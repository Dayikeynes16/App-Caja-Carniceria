<template>
  <v-container>
    <v-card class="pa-4" elevation="2">
      <v-card-title>
        <v-row>
          <v-icon class="ma-3" color="black" icon="mdi-account-plus" />
          <p class="ma-3">
            {{ props.cliente ? 'Editar Cliente' : 'Nuevo Cliente' }}
          </p>
        </v-row>
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            v-model="form.nombre"
            label="Nombre"
            required
            :error-messages="errorMessages.nombre"
          />
          <v-text-field
            v-model="form.telefono"
            label="Teléfono"
            :error-messages="errorMessages.telefono"
          />
          <v-text-field
            v-model="form.direccion"
            label="Dirección"
          />
          <v-row>
            <v-col cols="6">
                <v-btn block variant="flat" color="red" @click="emits('cerrar')" prepend-icon="mdi-close" >
                    cancelar

                </v-btn>
            </v-col>
            <v-col cols="6">
                <v-btn block @click="guardarCliente" variant="flat" color="primary" :loading="loading">
                    {{ props.cliente ? 'Actualizar Cliente' : 'Crear Cliente' }}
                </v-btn>
                
            </v-col>
          </v-row>

        
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue'
import supabase from '@/supabase'
import snackbar from '@/components/snackbar.vue'

const notificacion = ref({
    show: false,
    type: '',
    message: ''
})

const mostrarNotificacion = (type, message) => {
    notificacion.value = {
        show: true,
        type: type,
        message: message
    }
    setTimeout(() => {
        notificacion.value.show = false
    }, 3000)
  
}

const props = defineProps({
  cliente: {
    type: Object,
    default: null
  }
})

const emits = defineEmits(['clienteCreado', 'clienteActualizado', 'cerrar'])

const loading = ref(false)

const form = ref({
  nombre: '',
  telefono: '',
  direccion: '',
  cordenadas: '',
  is_proveedor: false,
  credito: false,
  monto: 0
})

const errorMessages = ref({
  nombre: [],
  telefono: []
})

// Prellenar formulario si es edición
watch(
  () => props.cliente,
  (cliente) => {
    if (cliente) {
      form.value = {
         nombre: props.cliente.nombre || '',
        telefono: props.cliente.telefono || '',
        direccion: props.cliente.direccion || '',
        cordenadas: props.cliente.cordenadas || '',
        is_proveedor: props.cliente.is_proveedor || false,
        credito: props.cliente.credito || false,
        monto: props.cliente.monto || 0
        }
    }
  },
  { immediate: true }
)

const validarFormulario = () => {
  errorMessages.value.nombre = []
  errorMessages.value.telefono = []

  let valido = true

  if (!form.value.nombre || typeof form.value.nombre !== 'string') {
    errorMessages.value.nombre.push('El nombre es obligatorio y debe ser un texto.')
    valido = false
  }

  if (!/^\d{10}$/.test(form.value.telefono)) {
    errorMessages.value.telefono.push('El teléfono debe tener exactamente 10 dígitos numéricos.')
    valido = false
  }

  return valido
}

const limpiarFormulario = () => {
  form.value = {
    nombre: '',
    telefono: '',
    direccion: '',
    cordenadas: '',
    is_proveedor: false,
    credito: false,
    monto: 0
  }
}

const guardarCliente = async () => {
  if (!validarFormulario()) return

  loading.value = true
  try {
    if (props.cliente) {
      const { error } = await supabase
        .from('clientes')
        .update(form.value)
        .eq('id', props.cliente.id)

      if (error) throw error

      
      emits('clienteCreado')
      console.log('probando');
      
    } else {
      const { data, error } = await supabase
        .from('clientes')
        .insert([form.value])
        .select()
        .single()

      if (error) throw error

      emits('clienteCreado')
      limpiarFormulario()
    }
  } catch (error) {
    console.error('Error al guardar cliente:', error)
    mostrarNotificacion('error', 'Error al guardar cliente: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>
