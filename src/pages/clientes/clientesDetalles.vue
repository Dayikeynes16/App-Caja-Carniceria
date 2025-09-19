<template>
  <v-container>
    <v-row class="pa-0" no-gutters>
      <!-- Columna Izquierda -->
      <v-col cols="4" class="pr-2">
        <v-row>
          <v-col cols="12">
            <infoCliente :cliente="client" />
          </v-col>
  
          <v-col cols="12">
            <v-card class="pa-4" color="#E6F4EA" elevation="1">
              <v-card-title class="text-green-darken-2">
                <v-icon start color="green">mdi-credit-card-check-outline</v-icon>
                Procesar Pago
              </v-card-title>
              <v-card-subtitle class="text-caption mb-2">
                Registra un pago que será procesado automáticamente por el sistema
              </v-card-subtitle>
  
              <v-text-field
                v-model.number="monto"
                prefix="$"
                label="Monto del Pago"
                type="number"
                density="compact"
                variant="outlined"
                class="mb-2"
              />
              <v-select
                v-model="metodo"
                :items="['efectivo', 'transferencia', 'tarjeta']"
                label="Método de Pago"
                variant="outlined"
                density="compact"
                class="mb-2"
              />
              <v-text-field
                v-model="referencia"
                label="Referencia (opcional)"
                variant="outlined"
                density="compact"
                class="mb-4"
              />
              <v-btn :loading="procesando" @click="registrarPago" color="green" block>
                Procesar Pago
              </v-btn>
            </v-card>
          </v-col>
  
          <v-col cols="12">
            <productosDescuentos
              @creado="get_clients(id)"
              :cliente="client"
              :productos="client.precio_especials"
            />
          </v-col>
        </v-row>
      </v-col>
  
      <!-- Columna Derecha -->
      <v-col cols="8">
        <v-row>
          <v-col cols="4">
            <v-card color="#FFEBEE" class="pa-4">
              <v-card-title>Deuda total</v-card-title>
              <v-card-text class="text-h6">{{ formatCurrency(resumen.saldoPendiente) }}</v-card-text>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card color="#E8F5E9" class="pa-4">
              <v-card-title>Compras este mes</v-card-title>
              <v-card-text class="text-h6">{{ formatCurrency(resumen.totalUltimoMes) }}</v-card-text>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card color="#E3F2FD" class="pa-4">
              <v-card-title>Historial Total</v-card-title>
              <v-card-text class="text-h6">{{ formatCurrency(resumen.totalVentas) }}</v-card-text>
            </v-card>
          </v-col>
  
          <v-col cols="12">
            <ultimasVentas :id="client.id" />
          </v-col>
        </v-row>
      </v-col>
  
      <!-- Notificación -->
      <snackbar-notification
        :type="snack.type"
        :message="snack.message"
        :show="snack.show"
        :timeout="3000"
      />
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import supabase from '@/supabase.js'
import infoCliente from './detalles/infoCliente.vue'
import productosDescuentos from './detalles/productosDescuentos.vue'
import ultimasVentas from './detalles/ultimasVentas.vue'
import resumenFinanzas from '@/composables/clientFinances'
import formatCurrency from '@/composables/formatCurrency'
import procesarPago from '@/composables/useProcesarPago.js'
import snackbarNotification from '@/components/snackbar.vue'

const route = useRoute()
const id = ref(route.params.id)
const client = ref({})
const resumen = ref({})
const monto = ref(0)
const metodo = ref('efectivo')
const referencia = ref('')
const procesando = ref(false)

const snack = ref({
  show: false,
  type: 'success',
  message: ''
})

const showNotification = (type, message) => {
  snack.value = { show: true, type, message }
  setTimeout(() => (snack.value.show = false), 3000)
}

const get_clients = async (id) => {
  const { data, error } = await supabase
    .from('clientes')
    .select(`*, precio_especials(*, productos(*)), ventas(*, producto_ventas(*, productos(*)), pagos(*))`)
    .eq('id', id)
    .single()

  if (!error) {
    client.value = data
    resumen.value = resumenFinanzas(data)
  }
}

const registrarPago = async () => {
  procesando.value = true
  const resultado = await procesarPago({
    clienteId: client.value.id,
    monto: monto.value,
    metodo: metodo.value,
    referencia: referencia.value
  })

  if (resultado.ok) {
    monto.value = 0
    referencia.value = ''
    get_clients(id.value)
    showNotification('success', 'Pago registrado correctamente')
  } else {
    showNotification('error', 'Error al procesar el pago: ' + resultado.error)
  }

  procesando.value = false
}

onMounted(() => {
  get_clients(id.value)
})
</script>
