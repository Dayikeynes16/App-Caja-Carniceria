<template>
  <v-card class="pa-4 mb-6" variant="outlined">
    <v-card-title class="text-h6">Resumen de Pagos</v-card-title>

    <v-row dense class="mt-2">
      <v-col cols="12" sm="6" md="3">
        <v-sheet class="pa-4 text-center" elevation="1">
          <div class="text-caption text-medium-emphasis">Total Registrado</div>
          <div class="text-h6 font-weight-bold">${{ resumen.totalGeneral.toFixed(2) }}</div>
        </v-sheet>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-sheet class="pa-4 text-center" elevation="1">
          <div class="text-caption text-medium-emphasis">Total de Registros</div>
          <div class="text-h6 font-weight-bold">{{ resumen.totalRegistros }}</div>
        </v-sheet>
      </v-col>

      <v-col cols="12" sm="6" md="3" v-for="(monto, metodo) in resumen.porMetodo" :key="metodo">
        <v-sheet class="pa-4 text-center" elevation="1">
          <div class="text-caption text-medium-emphasis">Método: {{ metodo }}</div>
          <div class="text-h6 font-weight-bold">${{ monto.toFixed(2) }}</div>
        </v-sheet>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-sheet class="pa-4 text-center" elevation="1">
          <div class="text-caption text-medium-emphasis">Con Cliente</div>
          <div class="text-h6 font-weight-bold">{{ resumen.conCliente }}</div>
        </v-sheet>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-sheet class="pa-4 text-center" elevation="1">
          <div class="text-caption text-medium-emphasis">Sin Cliente</div>
          <div class="text-h6 font-weight-bold">{{ resumen.sinCliente }}</div>
        </v-sheet>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-sheet class="pa-4 text-center" elevation="1">
          <div class="text-caption text-medium-emphasis">Con Venta</div>
          <div class="text-h6 font-weight-bold">{{ resumen.conVenta }}</div>
        </v-sheet>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-sheet class="pa-4 text-center" elevation="1">
          <div class="text-caption text-medium-emphasis">Sin Venta</div>
          <div class="text-h6 font-weight-bold">{{ resumen.sinVenta }}</div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
const props = defineProps({
  resumen: {
    type: Object,
    required: true
  }
})
</script>
