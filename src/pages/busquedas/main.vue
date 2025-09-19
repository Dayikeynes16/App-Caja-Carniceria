<template>
  <v-container fluid class="pa-5">
    <v-card variant="outlined" class="mb-6">
      <v-card-title class="text-h5 font-weight-bold">Ventas del Día</v-card-title>
      <v-card-subtitle>{{ fechaTexto }}</v-card-subtitle>
      <v-card-text>
        <!-- Filtros -->
        <v-row class="ma-3" justify="end">
  <v-btn
    class="me-2"
    :color="filtroSeleccionado === 'hoy' ? 'success' : undefined"
    :variant="filtroSeleccionado === 'hoy' ? 'flat' : 'outlined'"
    @click="setHoy"
  >Hoy</v-btn>

  <v-btn
    v-for="n in [ 2, 7, 30]"
    :key="n"
    class="me-2"
    :color="filtroSeleccionado === `${n}d` ? 'primary' : undefined"
    :variant="filtroSeleccionado === `${n}d` ? 'flat' : 'outlined'"
    @click="setDias(n)"
  >
   hace {{ n }} días
  </v-btn>

 <v-menu open-on-hover>
  <template v-slot:activator="{ props }">
    <v-btn
      :color="filtroSeleccionado === 'rango' ? 'success' : undefined"
:variant="filtroSeleccionado === 'rango' ? 'flat' : 'outlined'"

      v-bind="props"
    >
      selecionar rango
      <v-icon right>mdi-calendar</v-icon>
    </v-btn>
  </template>
  <v-date-picker
    v-model="rango"
    range
    variant="outlined"
    @update:model-value="handleRangoSeleccionado"
  />
</v-menu>


  
</v-row>


        <!-- Loading -->
        <v-skeleton-loader v-if="loading" type="article, actions, card, table" class="my-10" />

        <!-- Métricas principales -->
        <v-row v-else dense>
          <v-col cols="12" md="3" v-for="card in cards" :key="card.label">
            <v-card variant="outlined" class="pa-4 ma-2 text-center">
              <v-card-subtitle class="text-medium-emphasis">{{ card.label }}</v-card-subtitle>
              <v-card-title class="text-h5 font-weight-bold">{{ card.value }}</v-card-title>
              <v-chip :color="card.chipColor" size="small" class="mt-2" variant="outlined">
                {{ card.chipText }}
              </v-chip>
            </v-card>
          </v-col>
        </v-row>

        <!-- Grillas -->
        <v-row v-if="!loading" dense>
          <!-- Métodos de pago -->
          <v-col cols="12" md="4">
            <v-card variant="outlined" class="pa-4">
              <v-card-title class="text-subtitle-1 font-weight-bold">Métodos de Pago</v-card-title>
              <v-divider class="my-2" />
              <div class="mb-3">
                <div class="d-flex justify-space-between">
                  <strong>efectivo</strong>
                  <span>{{ formatCurrency(data.dineroRecibidoPorMetodo?.efectivo) || 0 }}</span>
                </div>
                <v-progress-linear :disabled="true" height="6" color="primary" class="my-1" />

                <div class="d-flex justify-space-between">
                  <strong>transferencia</strong>
                  <span>{{ formatCurrency(data.dineroRecibidoPorMetodo?.transferencia) || 0 }}</span>
                </div>
                <v-progress-linear :disabled="true" height="6" color="primary" class="my-1" />
                <div class="text-caption text-medium-emphasis"></div>
              </div>
              <div class="mb-3">
                <div class="d-flex justify-space-between">
                  <strong>tarjeta</strong>
                  <span>{{ formatCurrency(data.dineroRecibidoPorMetodo?.tarjeta) || 0 }}</span>
                </div>
                <v-progress-linear :disabled="true" height="6" color="primary" class="my-1" />
              </div>
            </v-card>
          </v-col>

          <!-- Productos más vendidos -->
          <v-col cols="12" md="4">
            <v-card variant="outlined" class="pa-4">
              <v-card-title class="text-subtitle-1 font-weight-bold">Productos Más Vendidos</v-card-title>
              <v-divider class="my-2" />
              <v-card-text>
                <v-virtual-scroll :height="300" :items="data.productosMasVendidos">
                  <template v-slot:default="{ item }">
                     <div class="d-flex justify-space-between">
                      <strong>{{ item.nombre }}</strong>
                      <span>${{ item.total.toFixed(2) }}</span>
                    </div>
                <v-progress-linear :model-value="item.porcentaje" height="6" color="deep-purple" class="my-1" />
                <div class="text-caption text-medium-emphasis">{{ item.kg.toFixed(1) }} kg</div>
                  </template>
                </v-virtual-scroll>

              </v-card-text>
            
            </v-card>
          </v-col>

          <!-- Ventas por hora -->
          <v-col cols="12" md="4">
            <v-card variant="outlined" class="pa-4">
              <v-card-title class="text-subtitle-1 font-weight-bold">Ventas por Hora</v-card-title>
              <v-divider class="my-2" />
              <div v-for="hora in data.ventasPorHora" :key="hora.hora" class="mb-2 d-flex justify-space-between">
                <span>{{ hora.hora }} — {{ hora.ventas }} ventas</span>
                <strong>${{ hora.total.toFixed(2) }}</strong>
              </div>
            </v-card>
          </v-col>

          <!-- Gráfica de ventas por día -->
          <v-col cols="12">
            <v-card variant="outlined" class="pa-4 mt-6">
              <v-card-title class="text-subtitle-1 font-weight-bold">Ventas por Día</v-card-title>
              <v-divider class="my-3" />
              <Bar :data="chartData" :options="chartOptions" />
            </v-card>
          </v-col>
        </v-row>

        <!-- Últimas ventas del día -->
        <v-card v-if="!loading" class="mt-8" variant="outlined">
          <v-card-title class="text-subtitle-1 font-weight-bold">Últimas Ventas del Día</v-card-title>
          <v-data-table :headers="headers" :items="data.ultimasVentas" class="elevation-1" dense>
            <template #item.estado="{ item }">
              <v-chip :color="item.estado === 'activo' ? 'blue' : 'green'" variant="outlined" label>
                {{ item.estado }}
              </v-chip>
            </template>
            <template #item.acciones>
              <v-btn icon><v-icon>mdi-eye</v-icon></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-card-text>
    </v-card>
  </v-container>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useVentasDashboard } from '@/composables/useVentasDashboard'
import formatCurrency from '@/composables/formatCurrency'
import { Bar } from 'vue-chartjs'
import { watch } from 'vue'


import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const { data, fetchVentasDashboard, loading } = useVentasDashboard()

const filtroSeleccionado = ref('hoy')
const rango = ref([new Date(), new Date()])
const menuRef = ref(null)

const fechaTexto = computed(() => {
  const [start, end] = rango.value
  const s = dayjs(start).format('D MMM YYYY')
  const e = dayjs(end).format('D MMM YYYY')
  return s === e ? s : `${s} - ${e}`
})

const cards = computed(() => [
  {
    label: 'Total Ventas',
    value: `${formatCurrency(data.value?.totalVentas) || '0.00'}`,
    chipText: '',
    chipColor: 'green'
  },
  {
    label: 'Transacciones',
    value: data.value.transacciones || 0,
    chipText: '',
    chipColor: 'blue'
  },
  {
    label: 'Ticket Promedio',
    value: `${formatCurrency(data.value.ticketPromedio) || '0.00'}`,
    chipText: '',
    chipColor: 'purple'
  },
  {
    label: 'Producto Estrella',
    value: data.value.productoEstrella?.nombre || 'N/A',
    chipText: data.value.productoEstrella ? `${formatCurrency(data.value.productoEstrella.total)}` : '',
    chipColor: 'orange'
  }
])

const headers = [
  { title: 'ID Venta', key: 'id' },
  { title: 'Hora', key: 'hora' },
  { title: 'Cliente', key: 'cliente' },
  { title: 'Total', key: 'total' },
  { title: 'Estado', key: 'estado' },
  { title: 'Acciones', key: 'acciones', sortable: false },
]

const cargarDatos = async () => {
  const [startDate, endDate] = rango.value
  const start = dayjs(startDate).startOf('day')
  const end = dayjs(endDate).endOf('day')

  await fetchVentasDashboard({
    from: start.toISOString(),
    to: end.toISOString()
  })

  console.log('Total ventas crudas:', data.value.ventasTodas.length)
}

function setHoy() {
  filtroSeleccionado.value = 'hoy'
  const hoy = new Date()
  rango.value = [hoy, hoy]
  cargarDatos()
}

function setDias(dias) {
  filtroSeleccionado.value = `${dias}d`
  const start = dayjs().subtract(dias - 1, 'day').toDate()
  const end = new Date()
  rango.value = [start, end]
  cargarDatos()
}

function handleRangoSeleccionado() {
  filtroSeleccionado.value = 'rango'
  cargarDatos()
  menuRef.value?.close()
}

const chartData = computed(() => ({
  labels: data.value.ventasPorDia?.map(v => dayjs(v.fecha).format('DD MMM')) || [],
  datasets: [
    {
      label: 'Ventas ($)',
      data: data.value.ventasPorDia?.map(v => v.total) || [],
      backgroundColor: '#1976d2'
    }
  ]
}))

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx => `$${ctx.raw.toFixed(2)}`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

onMounted(() => {
  setHoy()
})
</script>

