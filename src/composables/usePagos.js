// composables/usePagos.js
import { ref, computed } from 'vue'
import supabase from '@/supabase'

export default function usePagos() {
  const pagos = ref([])
  const fechaActual = ref(new Date()) // Fecha seleccionada en modo diario
  const cargando = ref(false)
  const errorCarga = ref(null)
  const modoBusquedaAvanzada = ref(false)

  // Cargar pagos por fecha específica (MODO 1)
  const cargarPagosDelDia = async (fecha = new Date()) => {
    cargando.value = true
    errorCarga.value = null
    modoBusquedaAvanzada.value = false

    const inicioDia = new Date(fecha)
    inicioDia.setHours(0, 0, 0, 0)
    const finDia = new Date(fecha)
    finDia.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('pagos')
      .select(`
        *,
        clientes(nombre),
        ventas:id
      `)
      .eq('anulado', 'false') // Asegúrate de filtrar por estado activo si es necesario
      .gte('created_at', inicioDia.toISOString())
      .lte('created_at', finDia.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      errorCarga.value = error.message
      pagos.value = []
    } else {
      pagos.value = data
      fechaActual.value = fecha
    }

    cargando.value = false
  }

  // Reemplazar pagos desde búsqueda avanzada (MODO 2)
  const setPagosBusquedaAvanzada = (resultados) => {
    modoBusquedaAvanzada.value = true
    pagos.value = resultados
  }

  // Navegar al día anterior
  const irADiaAnterior = () => {
    const anterior = new Date(fechaActual.value)
    anterior.setDate(anterior.getDate() - 1)
    cargarPagosDelDia(anterior)
  }

  // Navegar al día siguiente
  const irADiaSiguiente = () => {
    const siguiente = new Date(fechaActual.value)
    siguiente.setDate(siguiente.getDate() + 1)
    cargarPagosDelDia(siguiente)
  }

  // Mostrar si el botón [→ Día siguiente] debe estar activo
  const puedeIrADiaSiguiente = computed(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fecha = new Date(fechaActual.value)
    fecha.setHours(0, 0, 0, 0)
    return fecha < hoy
  })

  // Cálculo de estadísticas
  const resumen = computed(() => {
    const totalGeneral = pagos.value.reduce((suma, p) => suma + (p.total || 0), 0)

    const porMetodo = pagos.value.reduce((res, p) => {
      res[p.metodo] = (res[p.metodo] || 0) + (p.total || 0)
      return res
    }, {})

    const conCliente = pagos.value.filter(p => p.cliente_id).length
    const sinCliente = pagos.value.length - conCliente

    const conVenta = pagos.value.filter(p => p.venta_id).length
    const sinVenta = pagos.value.length - conVenta

    return {
      totalGeneral,
      totalRegistros: pagos.value.length,
      porMetodo,
      conCliente,
      sinCliente,
      conVenta,
      sinVenta,
    }
  })

  return {
    pagos,
    cargando,
    errorCarga,
    fechaActual,
    puedeIrADiaSiguiente,
    cargarPagosDelDia,
    irADiaAnterior,
    irADiaSiguiente,
    setPagosBusquedaAvanzada,
    resumen,
    modoBusquedaAvanzada,
  }
}
