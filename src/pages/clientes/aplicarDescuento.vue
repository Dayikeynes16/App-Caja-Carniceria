<template>
  <v-container>
    <template v-if="switchClient">
      <v-card width="100%" class="pa-2" variant="outlined">
        <v-card-text>
          <v-row>
            <v-col cols="12" class="text-center">
              <v-icon icon="mdi-account-circle" size="50" color="black"></v-icon>
            </v-col>

            <v-divider class="my-2" />

            <v-col cols="6">
              <div class="text-body-1 text-left">Cliente:</div>
            </v-col>
            <v-col cols="6" class="text-right">
              {{ venta.clientes?.nombre || '' }}
            </v-col>

            <v-col cols="6">
              <div class="text-left">Teléfono:</div>
            </v-col>
            <v-col cols="6" class="text-right">
              {{ venta.clientes?.telefono || '' }}
            </v-col>

            <v-divider class="my-2" />

            <v-col cols="12" class="text-center">
              <v-btn @click="switchClient = false" variant="flat" color="black" class="ma-2">
                Cambiar cliente
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>

    <template v-else>
      <v-card width="100%" variant="outlined" class="pa-2">
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-autocomplete
                variant="outlined"
                label="Clientes"
                v-model="cliente"
                :items="clientes"
                item-title="nombre"
                item-value="id"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn block color="green" variant="flat" @click="asociarYAplicarDescuentos">
            Asociar y aplicar descuentos
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, defineEmits } from 'vue'
import supabase from '@/supabase.js'

const props = defineProps({
  venta: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['actualizado'])

const cliente = ref(null)
const clientes = ref([])
const venta = ref(props.venta)
const switchClient = ref(false)

onMounted(() => {
  getClientes()
  switchClient.value = !!venta.value.clientes
})

const getClientes = async () => {
  const { data, error } = await supabase.from('clientes').select('*')
  if (error) {
    console.error('Error al cargar clientes:', error)
  } else {
    clientes.value = data
  }
}

const asociarYAplicarDescuentos = async () => {
  try {
    if (!cliente.value) {
      alert('Por favor, selecciona un cliente')
      return
    }

    // Asociar venta al cliente
    const { error: errorAsociar, data: dataAsociar } = await supabase
      .from('ventas')
      .update({ cliente_id: cliente.value })
      .eq('id', venta.value.id)
      .select()

    if (errorAsociar || !dataAsociar) {
      alert('Error al asociar el cliente')
      return
    }

    switchClient.value = true

    // Obtener descuentos
    const { data: descuentos, error: errorDescuentos } = await supabase
      .from('precio_especials')
      .select('producto_id, precio')
      .eq('cliente_id', cliente.value)

    if (errorDescuentos) {
      console.error('Error al obtener descuentos:', errorDescuentos)
      alert('Error al obtener descuentos')
      return
    }

    const productosVenta = venta.value.producto_ventas
    if (!productosVenta?.length) {
      alert('Venta asociada correctamente (sin productos)')
      emits('actualizado')
      return
    }

    let totalVenta = 0
    for (const producto of productosVenta) {
      const descuento = descuentos.find(d => d.producto_id === producto.producto_id)
      const precioFinal = descuento ? descuento.precio : producto.precio
      const totalFinal = precioFinal * producto.peso

      const { error } = await supabase
        .from('producto_ventas')
        .update({ precio: precioFinal, total: totalFinal })
        .eq('id', producto.id)

      if (error) {
        console.error(`Error actualizando producto ${producto.id}:`, error)
      } else {
        totalVenta += totalFinal
      }
    }

    const { error: errorTotal } = await supabase
      .from('ventas')
      .update({ total: totalVenta })
      .eq('id', venta.value.id)

    if (errorTotal) {
      console.error('Error actualizando total de venta:', errorTotal)
      alert('Error al actualizar el total de la venta')
      return
    }

    alert('Descuentos aplicados correctamente')
    emits('actualizado')
  } catch (error) {
    console.error('Error inesperado:', error)
    alert('Ocurrió un error inesperado')
  }
}

watch(() => props.venta, (newVenta) => {
  venta.value = newVenta
  switchClient.value = !!newVenta.clientes
})
</script>
