import { ref } from 'vue'
import supabase from '@/supabase'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
dayjs.locale('es')

export const useVentasDashboard = () => {
  const loading = ref(false)
  const error = ref(null)
  const data = ref({})

  const fetchVentasDashboard = async ({ from, to }) => {
    loading.value = true
    error.value = null
    data.value = {}

    const fromDate = dayjs(from).startOf('day')
    const toDate = dayjs(to).endOf('day')
    const dias = []

    for (let d = fromDate; d.isBefore(toDate) || d.isSame(toDate, 'day'); d = d.add(1, 'day')) {
      dias.push(d)
    }

    let ventasAcumuladas = []

    try {
      for (const dia of dias) {
        const inicio = dia.startOf('day').toISOString()
        const fin = dia.endOf('day').toISOString()

        const { data: ventasRaw, error: fetchError } = await supabase
          .from('ventas')
          .select(`*, pagos(*), producto_ventas(*, productos(*))`)
          .range(0, 4999)
          .gte('created_at', inicio)
          .lte('created_at', fin)

        if (fetchError) throw fetchError

        ventasAcumuladas.push(...ventasRaw)
      }

      const ventasRaw = ventasAcumuladas
      const ventasNoCanceladas = ventasRaw.filter(v => v.estatus !== 'cancelado')

      const ventasCobradas = ventasRaw.filter(v => v.estatus === 'cobrado')
      const ventasPendientes = ventasRaw.filter(v => v.estatus === 'pendiente')
      const ventasDomicilio = ventasRaw.filter(v => v.estatus === 'servicio domicilio')
      const ventasCanceladas = ventasRaw.filter(v => v.estatus === 'cancelado')

      const totalVentas = ventasNoCanceladas.reduce((sum, v) => sum + v.total, 0)
      const transacciones = ventasNoCanceladas.length
      const ticketPromedio = transacciones ? totalVentas / transacciones : 0

      const dineroRecibidoPorMetodo = {}
      let totalPagado = 0
      let efectivoTotal = 0

      for (const venta of ventasRaw) {
        for (const pago of venta.pagos || []) {
          const metodo = pago.metodo || 'Desconocido'
          dineroRecibidoPorMetodo[metodo] = (dineroRecibidoPorMetodo[metodo] || 0) + pago.total
          totalPagado += pago.total
          if (metodo === 'efectivo') efectivoTotal += pago.total
        }
      }

      const porHora = {}
      for (const venta of ventasNoCanceladas) {
        const hora = dayjs(venta.created_at).format('HH:00')
        if (!porHora[hora]) porHora[hora] = { total: 0, ventas: 0 }
        porHora[hora].total += venta.total
        porHora[hora].ventas++
      }

      const ventasPorHora = Object.entries(porHora).map(([hora, v]) => ({
        hora,
        total: v.total,
        ventas: v.ventas
      })).sort((a, b) => a.hora.localeCompare(b.hora))

      const productos = {}
      for (const venta of ventasNoCanceladas) {
        for (const pv of venta.producto_ventas || []) {
          const nombre = pv.productos?.nombre || 'Desconocido'
          if (!productos[nombre]) productos[nombre] = { kg: 0, total: 0 }
          productos[nombre].kg += pv.peso
          productos[nombre].total += pv.total
        }
      }

      const productosMasVendidos = Object.entries(productos).map(([nombre, p]) => ({
        nombre,
        kg: p.kg,
        total: p.total,
        porcentaje: Math.round((p.total / totalVentas) * 100)
      })).sort((a, b) => b.total - a.total)

      const productoEstrella = productosMasVendidos[0] || null

      const ultimasVentas = ventasNoCanceladas.map(v => ({
        id: v.id,
        hora: dayjs(v.created_at).format('HH:mm'),
        cliente: v.cliente_id ? 'Cliente registrado' : 'Sin asignar',
        total: `$${v.total.toFixed(2)}`,
        estado: v.estatus
      })).sort((a, b) => b.hora.localeCompare(a.hora))

      const porDia = {}
      for (const venta of ventasNoCanceladas) {
        const fecha = dayjs(venta.created_at).format('YYYY-MM-DD')
        if (!porDia[fecha]) porDia[fecha] = { total: 0, transacciones: 0 }
        porDia[fecha].total += venta.total
        porDia[fecha].transacciones++
      }

      const ventasPorDia = Object.entries(porDia).map(([fecha, v]) => ({
        fecha,
        total: v.total,
        transacciones: v.transacciones,
        ticketPromedio: v.transacciones ? v.total / v.transacciones : 0
      })).sort((a, b) => dayjs(a.fecha).isAfter(dayjs(b.fecha)) ? 1 : -1)

      data.value = {
        ventasTodas: ventasRaw,
        ventasCobradas,
        ventasPendientes,
        ventasDomicilio,
        ventasCanceladas,

        totalVentas,
        transacciones,
        totalPagado,
        efectivoTotal,
        ticketPromedio,

        dineroRecibidoPorMetodo,
        ventasPorHora,
        productosMasVendidos,
        productoEstrella,
        ultimasVentas,
        ventasPorDia
      }
    } catch (err) {
      console.error('Error en dashboard:', err)
      error.value = err.message || 'Error desconocido'
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    data,
    fetchVentasDashboard
  }
}
