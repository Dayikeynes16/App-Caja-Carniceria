// composables/useBusquedaAvanzada.js
import { ref, reactive } from 'vue'
import supabase from '@/supabase'// ajusta si usas otra ruta

export default function useBusquedaAvanzada() {
  const filtros = reactive({
    fechaInicio: null,
    fechaFin: null,
    metodo: 'todos',          // efectivo, tarjeta, transferencia
    cliente: 'todos',         // con_cliente, sin_cliente, todos
    venta: 'todos',           // con_venta, sin_venta, todos
    comentario: 'todos',      // con_comentario, sin_comentario, todos
    montoMin: null,
    montoMax: null,
  })

  const pagosAvanzados = ref([])
  const buscando = ref(false)
  const errorBusqueda = ref(null)

  const buscarPagos = async () => {
    buscando.value = true
    errorBusqueda.value = null

    let query = supabase.from('pagos').select(`
      *,
      clientes(nombre),
      ventas(id)
    `)

    // Filtros dinámicos
    if (filtros.fechaInicio && filtros.fechaFin) {
      query = query.gte('created_at', filtros.fechaInicio).lte('created_at', filtros.fechaFin)
    }

    if (filtros.metodo !== 'todos') {
      query = query.eq('metodo', filtros.metodo)
    }

    if (filtros.cliente === 'con_cliente') {
      query = query.not('cliente_id', 'is', null)
    } else if (filtros.cliente === 'sin_cliente') {
      query = query.is('cliente_id', null)
    }

    if (filtros.venta === 'con_venta') {
      query = query.not('venta_id', 'is', null)
    } else if (filtros.venta === 'sin_venta') {
      query = query.is('venta_id', null)
    }

    if (filtros.comentario === 'con_comentario') {
      query = query.not('comentario', 'is', null)
    } else if (filtros.comentario === 'sin_comentario') {
      query = query.is('comentario', null)
    }

    if (filtros.montoMin !== null) {
      query = query.gte('total', filtros.montoMin)
    }

    if (filtros.montoMax !== null) {
      query = query.lte('total', filtros.montoMax)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      errorBusqueda.value = error.message
      pagosAvanzados.value = []
    } else {
      pagosAvanzados.value = data
    }

    buscando.value = false
  }

  const resetFiltros = () => {
    filtros.fechaInicio = null
    filtros.fechaFin = null
    filtros.metodo = 'todos'
    filtros.cliente = 'todos'
    filtros.venta = 'todos'
    filtros.comentario = 'todos'
    filtros.montoMin = null
    filtros.montoMax = null
  }

  return {
    filtros,
    pagosAvanzados,
    buscando,
    errorBusqueda,
    buscarPagos,
    resetFiltros,
  }
}
