<template>
  <v-card class="pa-4 mb-6" variant="outlined">
    <v-btn @click="mostrar = !mostrar" prepend-icon="mdi-magnify">
      Búsqueda Avanzada
    </v-btn>

    <v-expand-transition>
      <div v-show="mostrar" class="mt-4">
        <v-row dense>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              label="Monto mínimo"
              v-model="form.montoMin"
              type="number"
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-text-field
              label="Monto máximo"
              v-model="form.montoMax"
              type="number"
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-select
              label="Método de pago"
              v-model="form.metodo"
              :items="metodos"
              clearable
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-select
              label="Cliente asociado"
              v-model="form.conCliente"
              :items="['Sí', 'No']"
              clearable
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-select
              label="Venta asociada"
              v-model="form.conVenta"
              :items="['Sí', 'No']"
              clearable
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-select
              label="Comentario"
              v-model="form.conComentario"
              :items="['Sí', 'No']"
              clearable
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-text-field
              label="Desde (YYYY-MM-DD)"
              v-model="form.desde"
              type="date"
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-text-field
              label="Hasta (YYYY-MM-DD)"
              v-model="form.hasta"
              type="date"
            />
          </v-col>

          <v-col cols="12" class="d-flex justify-end">
            <v-btn @click="buscar" color="primary" class="me-2">Buscar</v-btn>
            <v-btn @click="limpiar" color="default">Limpiar</v-btn>
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['buscar'])

const mostrar = ref(false)
const metodos = ['efectivo', 'tarjeta', 'transferencia']

const form = ref({
  montoMin: null,
  montoMax: null,
  metodo: null,
  conCliente: null,
  conVenta: null,
  conComentario: null,
  desde: null,
  hasta: null
})

const buscar = () => {
  emit('buscar', { ...form.value })
}

const limpiar = () => {
  form.value = {
    montoMin: null,
    montoMax: null,
    metodo: null,
    conCliente: null,
    conVenta: null,
    conComentario: null,
    desde: null,
    hasta: null
  }
  emit('buscar', { ...form.value })
}
</script>
