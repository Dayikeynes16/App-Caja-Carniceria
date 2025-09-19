<template>
  <v-card class="pa-4 mb-6" variant="outlined">
    <v-row dense>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="filtros.nombreCliente"
          label="Buscar por nombre de cliente"
          clearable
        />
      </v-col>

      <v-col cols="12" sm="4">
        <v-text-field
          v-model="filtros.comentario"
          label="Buscar por comentario"
          clearable
        />
      </v-col>

      <v-col cols="12" sm="2">
        <v-text-field
          v-model.number="filtros.montoMin"
          type="number"
          label="Monto mínimo"
          clearable
        />
      </v-col>

      <v-col cols="12" sm="2">
        <v-text-field
          v-model.number="filtros.montoMax"
          type="number"
          label="Monto máximo"
          clearable
        />
      </v-col>
    </v-row>

    <v-row justify="end" class="mt-2">
      <v-btn color="primary" @click="aplicarFiltros">Aplicar</v-btn>
      <v-btn class="ms-2" @click="limpiarFiltros">Limpiar</v-btn>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['filtrar'])

const filtros = ref({
  nombreCliente: '',
  comentario: '',
  montoMin: null,
  montoMax: null
})

const aplicarFiltros = () => {
  emit('filtrar', { ...filtros.value })
}

const limpiarFiltros = () => {
  filtros.value = {
    nombreCliente: '',
    comentario: '',
    montoMin: null,
    montoMax: null
  }
  emit('filtrar', { ...filtros.value })
}
</script>
