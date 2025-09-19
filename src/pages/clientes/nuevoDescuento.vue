<template>
  <v-container>

   
    <snackbar v-if="notificacion.show" :message="notificacion.message" :type="notificacion.type" :show="notificacion.show" />
    <v-card variant="outlined" elevation="1" class="pa-5 bg-white" max-width="500" mx-auto>
      <v-card-title class="text-h6 text-center">
        {{ esEdicion ? 'Editar descuento' : 'Nuevo descuento' }}
      </v-card-title>

      <v-card-text>
        <v-autocomplete
          v-model="producto_id"
          :items="productos"
          item-title="nombre"
          item-value="id"
          label="Seleccionar producto"
          variant="outlined"
          :disabled="esEdicion"
          :rules="[v => !!v || 'El producto es requerido']"
        />

        <v-text-field
          v-model="precio"
          label="Precio con descuento"
          type="number"
          min="1"
          variant="outlined"
          :rules="[v => !!v || 'El precio es requerido']"
          class="mt-4"
        />
      </v-card-text>

      <v-card-actions class="pt-0">
        <v-btn
          block
          color="green"
          variant="flat"
          prepend-icon="mdi-tag"
          @click="guardarDescuento"
        >
          {{ esEdicion ? 'Guardar cambios' : 'Crear descuento' }}
        </v-btn>
        <v-btn block color="red" variant="text" @click="$emit('cerrar')">
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import supabase from '@/supabase'
import { getMexicoLocalString } from '@/composables/localtime'
import snackbar from '@/components/snackbar.vue'

const props = defineProps({
  cliente_id: {
    type: [Number, String],
    required: true
  },
  descuento: {
    type: Object,
    default: null
  }
})

const notificacion = ref({
  show: false,
  message: '',
  type: 'success'
})

const mostrarSnackbar = (msg, tipo) => {
  notificacion.value.message = msg
  notificacion.value.type = tipo
  notificacion.value.show = true

  // Ocultar después de timeout
  setTimeout(() => {
    snackbar.value.show = false
  }, 3000)
}

const emit = defineEmits(['cerrar', 'creado'])

const productos = ref([])
const producto_id = ref(null)
const precio = ref(null)

const esEdicion = computed(() => !!props.descuento)

onMounted(async () => {
  await get_productos()

  if (esEdicion.value) {
    producto_id.value = props.descuento.producto_id
    precio.value = props.descuento.precio
  }
})

const get_productos = async () => {
  const { data, error } = await supabase.from('productos').select('*')
  if (error) {
    console.error('Error al obtener productos:', error)
  } else {
    productos.value = data
  }
}

const guardarDescuento = async () => {
  if (!producto_id.value || !precio.value) {
    mostrarSnackbar('Por favor completa todos los campos.', 'error')
    return
  }

  if (esEdicion.value) {
    // Editar descuento existente
    const { error } = await supabase
      .from('precio_especials')
      .update({ precio: parseFloat(precio.value) })
      .eq('id', props.descuento.id)

    if (error) {
      mostrarSnackbar('Error al editar el descuento.', 'error')
    } else {
      mostrarSnackbar('Descuento actualizado correctamente.', 'success')
      emit('creado')
      emit('cerrar')
    }
  } else {
    // Verificar si ya existe descuento
    const { data: existe, error: errorVerif } = await supabase
      .from('precio_especials')
      .select('*')
      .eq('cliente_id', props.cliente_id)
      .eq('producto_id', producto_id.value)
      .maybeSingle()

    if (errorVerif) {
      mostrarSnackbar('Error al verificar si ya existe un descuento.', 'error')
      return
    }

    if (existe) {
      mostrarSnackbar('Este cliente ya tiene un descuento asignado a ese producto.', 'warning')
      return
    }

    // Crear nuevo descuento
    const { error } = await supabase.from('precio_especials').insert({
      cliente_id: props.cliente_id,
      producto_id: producto_id.value,
      precio: parseFloat(precio.value),
      created_at: getMexicoLocalString(new Date())
    })

    if (error) {
      console.error('Error al crear descuento:', error)
      mostrarSnackbar('Error al crear el descuento.', 'error')
    } else {
      mostrarSnackbar('Descuento creado correctamente.', 'success')
      emit('creado')
      emit('cerrar')
    }
  }
}
</script>
