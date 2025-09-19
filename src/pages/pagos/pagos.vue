<template>
  <v-container>
    <!-- Encabezado -->
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h2 class="text-h5">Gestión de Pagos</h2>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="dialogoNuevo = true">
          Nuevo Pago
        </v-btn>
      </v-col>
    </v-row>

    <!-- Navegación de días -->
    <v-row class="mb-2">
      <v-col cols="12" class="d-flex align-center justify-space-between">
        <v-btn @click="irADiaAnterior" icon="mdi-chevron-left" variant="outlined" />
        <div>{{ fechaFormateada }}</div>
        <v-btn @click="irADiaSiguiente" icon="mdi-chevron-right" variant="outlined" :disabled="!puedeIrADiaSiguiente" />
      </v-col>
    </v-row>

    <!-- Filtros avanzados -->
    <BusquedaAvanzada @buscar="aplicarBusquedaAvanzada" />

    <!-- Resumen -->
    <ResumenPagos :resumen="resumen" class="mb-4" />

    <!-- Tabla -->
    <TablaPagos :pagos="pagos" />

    <!-- Diálogo -->
    <DialogNuevoPago
      :visible="dialogoNuevo"
      :clientes="clientes"
      @update:visible="dialogoNuevo = $event"
      @guardar="registrarPago"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import usePagos from '@/composables/usePagos'
import useBusquedaAvanzada from '@/composables/useBusquedaAvanzada'
import supabase from '@/supabase'

import BusquedaAvanzada from './detalles/BusquedaAvanzada.vue'
import ResumenPagos from './detalles/ResumenPagos.vue'
import TablaPagos from './detalles/TablaPagos.vue'
import DialogNuevoPago from './detalles/DialogNuevoPago.vue'

// Composables
const {
  pagos,
  resumen,
  fechaActual,
  puedeIrADiaSiguiente,
  cargarPagosDelDia,
  irADiaAnterior,
  irADiaSiguiente,
  setPagosBusquedaAvanzada,
} = usePagos()

const { buscarPagos, filtros, pagosAvanzados } = useBusquedaAvanzada()

// Formatear fecha
const fechaFormateada = computed(() =>
  fechaActual.value.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
)

// Diálogo
const dialogoNuevo = ref(false)
const clientes = ref([])

const cargarClientes = async () => {
  const { data, error } = await supabase.from('clientes').select('id, nombre')
  if (!error) clientes.value = data
}

const aplicarBusquedaAvanzada = async (filtrosFrontend) => {
  // Convertir filtros para el composable
  filtros.metodo = filtrosFrontend.metodo || 'todos'
  filtros.montoMin = filtrosFrontend.montoMin
  filtros.montoMax = filtrosFrontend.montoMax

  filtros.fechaInicio = filtrosFrontend.desde || null
  filtros.fechaFin = filtrosFrontend.hasta || null

  filtros.cliente = filtrosFrontend.conCliente === 'Sí' ? 'con_cliente'
    : filtrosFrontend.conCliente === 'No' ? 'sin_cliente' : 'todos'

  filtros.venta = filtrosFrontend.conVenta === 'Sí' ? 'con_venta'
    : filtrosFrontend.conVenta === 'No' ? 'sin_venta' : 'todos'

  filtros.comentario = filtrosFrontend.conComentario === 'Sí' ? 'con_comentario'
    : filtrosFrontend.conComentario === 'No' ? 'sin_comentario' : 'todos'

  await buscarPagos()
  setPagosBusquedaAvanzada(pagosAvanzados.value)
}

const registrarPago = async (pago) => {
  const { error } = await supabase.from('pagos').insert(pago)
  if (!error) {
    cargarPagosDelDia(fechaActual.value)
  } else {
    console.error('Error al registrar pago:', error.message)
  }
}

onMounted(() => {
  cargarPagosDelDia()
  cargarClientes()
})
</script>
