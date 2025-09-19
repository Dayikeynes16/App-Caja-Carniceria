<template>
  <v-card class="pa-6">
    <div class="text-right">
      <v-btn icon @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <v-img
      max-height="160"
      contain
      :src="producto.imagen || '/images/no-image.png'"
      class="mb-4 mx-auto"
      width="160"
    />

    <h3 class="text-h6 text-center mb-4">
      {{ props.producto ? 'Editar Producto' : 'Agregar Producto' }}
    </h3>

    <v-text-field
      v-model="producto.nombre"
      label="Nombre del Producto"
      outlined
      dense
      required
    />

    <v-text-field
      v-model="producto.precio_de_venta"
      label="Precio"
      type="number"
      outlined
      dense
      required
    />

    <v-text-field
      v-model="producto.stock"
      label="Stock"
      type="number"
      outlined
      dense
    />

    <v-checkbox
      v-model="producto.piezas"
      label="¿Producto por piezas?"
    />

    <div class="d-flex justify-end mt-4">
      <v-btn class="mr-2" variant="flat" color="grey" @click="$emit('close')">Cancelar</v-btn>
      <v-btn variant="flat" color="green" @click="updateProduct">Guardar</v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import supabase from '@/supabase'

const props = defineProps({
  producto: { type: Object, required: false },
})

const emit = defineEmits(['close'])

const producto = ref({
  nombre: '',
  precio_de_venta: 0,
  stock: 0,
  piezas: false,
  imagen: '',
  precio_produccion: 0,
})

watch(
  () => props.producto,
  (val) => {
    if (val) producto.value = { ...val }
  },
  { immediate: true }
)

const updateProduct = async () => {
  if (!producto.value.nombre || !producto.value.precio_de_venta) {
    alert('Completa todos los campos obligatorios.')
    return
  }

  const { error } = await supabase
    .from('productos')
    .upsert({
      ...producto.value,
      precio_de_venta: parseFloat(producto.value.precio_de_venta),
      precio_produccion: parseFloat(producto.value.precio_produccion || 0),
      piezas: !!producto.value.piezas,
    })
    .eq('id', props.producto?.id || 0)

  if (!error) emit('close')
}
</script>