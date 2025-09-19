import supabase from '@/supabase.js'
import { getMexicoLocalString } from '@/composables/localtime.js'
import { ref } from 'vue'

export const useVentas = () => {
  const productos = ref({})

  const fetchVentasPorFecha = async (fecha = null) => {
    try {
      const selectedDate = fecha || getMexicoLocalString().split(' ')[0]
      const startOfDay = `${selectedDate} 00:00:00`
      const endOfDay = `${selectedDate} 23:59:59`

      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          pagos(*),
          producto_ventas(
            *,
            productos(id, nombre)
          )
        `)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
        .order('created_at', { ascending: false })
        .limit(5000)

      if (error) {
        console.error('Error al obtener ventas:', error)
        return null
      }

      const todasLasVentas = data
      const ventasCobradas = todasLasVentas.filter(v => v.estatus === 'cobrado')
      const ventasCanceladas = todasLasVentas.filter(v => v.estatus === 'cancelado')
      const ventasPendientes = todasLasVentas.filter(v => v.estatus === 'pendiente')

      const resumen = {
        totalVendido: 0,
        totalEfectivo: 0,
        totalTarjeta: 0,
        totalTransferencia: 0,
        productos: null,
        totalVentas: ventasCobradas.length,
        ticketPromedio: 0,
        productoMasVendido: null,

        // Solo para mostrar listas en la UI
        ventas: todasLasVentas,
        ventasCobradas,
        ventasCanceladas,
        ventasPendientes
      }

      const productosVendidos = {}

      ventasCobradas.forEach(venta => {
        resumen.totalVendido += venta.total

        // Agrupar productos vendidos
        venta.producto_ventas?.forEach(pv => {
          const nombre = pv.productos?.nombre ?? 'Desconocido'
          productosVendidos[nombre] = (productosVendidos[nombre] || 0) + pv.total
        })

        // Sumar pagos por método
        venta.pagos?.forEach(pago => {
          switch (pago.metodo) {
            case 'efectivo':
              resumen.totalEfectivo += pago.total
              break
            case 'tarjeta':
              resumen.totalTarjeta += pago.total
              break
            case 'transferencia':
              resumen.totalTransferencia += pago.total
              break
          }
        })
      })

      resumen.ticketPromedio = resumen.totalVentas > 0
        ? resumen.totalVendido / resumen.totalVentas
        : 0

      const productoMasVendido = Object.entries(productosVendidos).sort((a, b) => b[1] - a[1])[0]
      resumen.productoMasVendido = productoMasVendido
        ? { nombre: productoMasVendido[0], cantidad: productoMasVendido[1] }
        : null

      productos_resumen(ventasCobradas)
      resumen.productos = productos.value

      return resumen

    } catch (err) {
      console.error('Error inesperado:', err)
      return null
    }
  }

  const productos_resumen = (ventas) => {
    productos.value = {}
    for (const venta of ventas) {
      for (const producto_venta of venta.producto_ventas) {
        const id = producto_venta.producto_id
        const nombre = producto_venta.productos?.nombre || "Desconocido"
        const cantidad = producto_venta.peso
        const total = producto_venta.total

        if (!productos.value[id]) {
          productos.value[id] = { nombre, cantidad: 0, total: 0 }
        }

        productos.value[id].cantidad += cantidad
        productos.value[id].total += total
      }
    }
  }

  return {
    fetchVentasPorFecha
  }
}
