<template>
    <v-container>
      <v-card>
        <v-card-title>
          <v-row>
            <v-col cols="6">
              <h3>Detalles de la venta</h3>
            </v-col>
            <v-col cols="6" class="text-end">
              <v-btn @click="emits('close')" icon>
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
  
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <v-data-table
                :items="productos"
                :item-value="null"
                :hide-default-footer="true"
              >
                <!-- Columna de imagen + nombre -->
                <template #item.producto="{ item }">
                
                  {{ item.producto }}
                </template>
  
                <!-- Precio -->
                <template #item.precio="{ item }">
                  {{ formatCurrency(item.precio) }}
                </template>
  
                <!-- Peso -->
                <template #item.peso="{ item }">
                  {{ item.peso }} Kg
                </template>
  
                <!-- Total -->
                <template #item.total="{ item }">
                  {{ formatCurrency(item.total) }}
                </template>
              </v-data-table>
            </v-col>
  
            <v-col cols="6">
              <printing :venta="venta" />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  import printing from '@/pages/ventas/printing.vue'
  import formatCurrency from '@/composables/formatCurrency'
  

  
  const props = defineProps({
    venta: {
      type: Object,
      required: true
    }
  })
  
  const emits = defineEmits(['close'])
  
  const venta = ref(props.venta)
  const productos = ref([])
  
  const orderProducts = () => {
    productos.value = venta.value.producto_ventas.map(item => ({
      producto: item.productos?.nombre || '—',
      precio: item.precio,
      peso: item.peso,
      total: item.total
    }))
  }
  
  onMounted(() => {
    orderProducts()
  })
  </script>