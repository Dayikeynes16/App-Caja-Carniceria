<template>
  <v-container>
    <v-card variant="outlined" class="ma-0" elevation="2">
      <v-row>

        <!-- Campo de búsqueda -->
        <v-col cols="8">
          <div class="text-center pa-4">
            <v-text-field
              color="black"
              v-model="search"
              label="Búsqueda por ID, total u hora"
              variant="outlined"
              height="60px"
            ></v-text-field>
          </div>
        </v-col>

        <!-- Filtro por estado -->
        <v-col cols="4">
          <div class="text-center pa-4">
            <v-menu v-model="menu" :close-on-content-click="false" location="end">
              <template #activator="{ props }">
                <v-btn
                  height="55px"
                  variant="outlined"
                  color="black"
                  v-bind="props"
                  prepend-icon="mdi-filter"
                >
                  Filtrar
                </v-btn>
              </template>

              <v-card class="pa-3">
                <v-card-title>Estado de ventas</v-card-title>
                <v-divider></v-divider>
                <v-card-text class="ma-0 pa-0">

                  <v-btn
                    block
                    class="ma-1 pa-1"
                    :variant="filtroActivo === 'cobrado' ? 'tonal' : 'text'"
                    color="green"
                    prepend-icon="mdi-check"
                    @click="filter('cobrado')"
                  >
                    Completadas
                  </v-btn>
                  <v-btn
                    block
                    class="ma-1 pa-1"
                    :variant="filtroActivo === 'servicio domicilio' ? 'tonal' : 'text'"
                    color="green"
                    prepend-icon="mdi-moped-outline"
                    @click="filter('servicio domicilio')"
                  >
                    a domicilio
                  </v-btn>

                  <v-btn
                    block
                    class="ma-1 pa-1"
                    :variant="filtroActivo === 'pendiente' ? 'tonal' : 'text'"
                    color="orange"
                    prepend-icon="mdi-alert"
                    @click="filter('pendiente')"
                  >
                    Pendientes
                  </v-btn>

                  <v-btn
                    block
                    class="ma-1 pa-1"
                    :variant="filtroActivo === 'cancelado' ? 'tonal' : 'text'"
                    color="red"
                    prepend-icon="mdi-cancel"
                    @click="filter('cancelado')"
                  >
                    Canceladas
                  </v-btn>

                </v-card-text>
              </v-card>
            </v-menu>
          </div>
        </v-col>

        <!-- Tabla de ventas -->
        <v-col cols="12">
          <v-data-table-virtual
           
            :search="search"
            no-data-text="No hay Ventas"
            :headers="headers"
            :loading="props.loading"
            :items="ventas"
            fixed-header
            :height="530"
            density="comfortable"
            hover
            class="elevation-1 rounded-lg ma-4"
          >
          <template #item.estatus="{ item }">
           <v-chip color="green" v-if="item.estatus === 'cobrado'">
             {{ item.estatus }}
           </v-chip>
           <v-chip color="warning" v-if="item.estatus === 'pendiente'">
             {{ item.estatus }}
           </v-chip>
           <v-chip color="red" v-if="item.estatus === 'cancelado'">
             {{ item.estatus }}
           </v-chip>
         </template>
            <template #item.detalles="{ item }">
              <v-btn
                @click="watchSpecific(item)"
                append-icon="mdi-magnify"
                variant="flat"
                color="blue"
              >
                ...Detalles
              </v-btn>
            </template>
            
          </v-data-table-virtual>
        </v-col>

      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import formatCurrency from '@/composables/formatCurrency'
import useTime from '@/composables/datetime.js'

// Composables
const router = useRouter()
const { formatDate, getRelativeTime } = useTime()

// Estado
const resumen = ref({})
const ventas = ref([])
const search = ref('')
const menu = ref(false)
const filtroActivo = ref('cobrado') 

const props = defineProps({
  resumen: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    required: true
  }
})

// Encabezados para la tabla
const headers = [
  { title: 'ID', key: 'id' },
  {
    title: 'Total',
    key: 'total',
    value: item => formatCurrency(item.total)
  },
  {
    title: 'Hora',
    key: 'hora',
    value: item => item.hora
  },
  {
    title: 'Fecha',
    key: 'fecha',
    value: item => formatDate(item.fecha)
  },
  { title: 'Balanza', key: 'balanza' },
  { title: 'Detalles', key: 'detalles' },
  { title: 'Estatus', key: 'estatus' },

]

// Ir a vista específica
const watchSpecific = (value) => {
  router.push({
    name: 'ventaEspecifica',
    params: { id: value.id }
  })
}

// Formatear ventas para la tabla
const formatSales = (ventas) => {
  return ventas.map(venta => ({
    id: String(venta.id),
    total: venta.total,
    hora: getRelativeTime(venta.created_at),
    balanza: venta.balanza ? String(venta.balanza) : '-',
    estatus: venta.estatus
  }))
}

// Filtrar por estatus y actualizar ventas + botón activo
const filter = (estatus) => {
  console.log('este es el filtro', filtroActivo.value);
  
  filtroActivo.value = estatus
  
  if (!resumen.value.ventas) return
  const filtradas = resumen.value.ventas.filter(venta => venta.estatus === estatus)
  ventas.value = formatSales(filtradas)
}

// Actualizar cuando cambien los props
watch(
  () => props.resumen,
  (newValue) => {
    resumen.value = newValue
    filter('cobrado') // Inicializar con ventas cobradas
  },
  { immediate: true }
)
</script>
