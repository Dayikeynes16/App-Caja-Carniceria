<template>
  <v-card variant="outlined">
    <v-card-title class="text-h6">
      Lista de Pagos
    </v-card-title>

    <v-data-table
      :items="pagos"
      :headers="headers"
      :loading="cargando"
      loading-text="Cargando pagos..."
      class="elevation-1"
      density="compact"
    >
      <template #item.fecha="{ item }">
        {{ formatFecha(item.created_at) }}
      </template>

      <template #item.metodo="{ item }">
        <v-chip size="small" :color="colorMetodo(item.metodo)" variant="flat">
          {{ item.metodo }}
        </v-chip>
      </template>

      <template #item.cliente="{ item }">
        {{ item.clientes?.nombre || '—' }}
      </template>

      <template #item.venta="{ item }">
        {{ item.venta_id || '—' }}
        
      </template>

      <template #item.total="{ item }">
        ${{ item.total.toFixed(2) }}
      </template>

      <template #item.comentario="{ item }">
        {{ item.comentario || '—' }}
      </template>
      <template #item.acciones="{ item }">
        <v-btn
          icon
          color="primary"
          @click="editarPago(item)"
          
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        
      </template>
    </v-data-table>
  </v-card>
  <editPago :modelValue="dialog" :pago="item"></editPago>
</template>


<script setup>
import { computed,ref } from 'vue'
import editPago from './editPago.vue'

const props = defineProps({
  pagos: {
    type: Array,
    required: true,
  },
  cargando: {
    type: Boolean,
    default: false,
  },
})

const dialog = ref(false)
const item = ref(null)

const editarPago = (pago) => {
  dialog.value = true
  item.value = pago // Clonar el objeto pago para editarlo
}


// Encabezados de la tabla
const headers = [
  { title: 'Fecha', key: 'fecha' },
  { title: 'Método', key: 'metodo' },
  { title: 'Monto', key: 'total' },
  { title: 'Cliente', key: 'cliente' },
  { title: 'Venta', key: 'venta' },
  { title: 'Comentario', key: 'comentario' },
  { title: 'Acciones', key: 'acciones', sortable: false },
]

// Opcional: formatear fecha
function formatFecha(iso) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Colores por método de pago
function colorMetodo(metodo) {
  switch (metodo) {
    case 'efectivo': return 'green'
    case 'tarjeta': return 'blue'
    case 'transferencia': return 'orange'
    default: return 'grey'
  }
}
</script>
