<template>
  <v-card class="pa-4 mb-6" variant="outlined">
    <h3 class="text-subtitle-1 font-weight-medium mb-4">Filtros de Búsqueda</h3>
    <v-row dense>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="filtros.busqueda"
          label="Cliente, monto, comentario..."
          density="comfortable"
          clearable
        />
      </v-col>

      <v-col cols="12" md="2">
        <v-select
          v-model="filtros.metodo"
          :items="metodos"
          label="Método de Pago"
          density="comfortable"
          clearable
        />
      </v-col>

      <v-col cols="12" md="2">
        <v-select
          v-model="filtros.cliente"
          :items="clientes"
          label="Cliente"
          density="comfortable"
          clearable
          item-title="nombre"
          item-value="id"
        />
      </v-col>

      <v-col cols="12" md="2">
        <v-select
          v-model="filtros.asociacion"
          :items="asociaciones"
          label="Asociación a Venta"
          density="comfortable"
          clearable
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-row dense>
          <v-col cols="6">
            <v-text-field
              v-model="filtros.fechaDesde"
              label="Fecha Desde"
              type="date"
              density="comfortable"
              clearable
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="filtros.fechaHasta"
              label="Fecha Hasta"
              type="date"
              density="comfortable"
              clearable
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row class="mt-3" justify="end">
      <v-btn color="primary" @click="emitirFiltros">Aplicar Filtros</v-btn>
      <v-btn class="ml-2" variant="outlined" @click="limpiarFiltros">Limpiar Filtros</v-btn>
    </v-row>
  </v-card>
</template>

<script setup>
import { reactive, watch, onMounted } from 'vue'

const emit = defineEmits(['filtrar'])

const props = defineProps({
  clientes: {
    type: Array,
    required: true
  }
})

const filtros = reactive({
  busqueda: '',
  metodo: null,
  cliente: null,
  asociacion: null,
  fechaDesde: '',
  fechaHasta: ''
})

const metodos = ['efectivo', 'tarjeta', 'transferencia']
const asociaciones = ['con_venta', 'independiente']

const emitirFiltros = () => {
  emit('filtrar', { ...filtros })
}

const limpiarFiltros = () => {
  filtros.busqueda = ''
  filtros.metodo = null
  filtros.cliente = null
  filtros.asociacion = null
  filtros.fechaDesde = ''
  filtros.fechaHasta = ''
  emitirFiltros()
}

onMounted(() => emitirFiltros())
</script>
