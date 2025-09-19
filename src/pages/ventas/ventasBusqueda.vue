<template>
  <v-row>
    <v-col cols="7">
      <scrollerVentas :loading="loading"  :resumen="resumen"></scrollerVentas>
    </v-col>
    <v-col cols="5">
      <totalVentas :resumen="resumen"></totalVentas>

    </v-col>
  </v-row>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import supabase from '@/supabase.js'
import formatCurrency from '@/composables/formatCurrency'
import useTime from '@/composables/datetime.js';
import totalVentas from './totalVentas.vue';
import scrollerVentas from './scrollerVentas.vue';
import { useVentas } from '@/composables/calculateSales.js'
const { fetchVentasPorFecha,  } = useVentas()
const resumen = ref({})

const getTime = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true // cambia a false si quieres formato 24h
  })
}

const loading = ref(false)

const { 
  formatDate,
  formatDateWithDay,
  getRelativeTime,
  isToday,
  getDateComponents,
  formatos
} = useTime()

const ventas = ref({
  cobradas: [],
  pendientes: [],
  canceladas: []
})



onMounted( async () => {

  loading.value = true
  resumen.value =  await fetchVentasPorFecha()
  loading.value = false

  console.log('este es:',resumen.value);
  ventas.value.cobradas = resumen.value.ventasCobradas,
  ventas.value.canceladas = resumen.value.ventasCanceladas,
  ventas.value.pendientes = resumen.value.ventasPendientes
  
  
})
</script>
