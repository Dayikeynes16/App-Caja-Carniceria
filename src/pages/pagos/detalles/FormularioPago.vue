<template>
 

    <v-card>
      <v-card-title class="text-h6">Registrar Nuevo Pago</v-card-title>

      <v-card-text>
        <v-form @submit.prevent="enviarFormulario" ref="formRef">
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.metodo"
                :items="metodos"
                label="Método de Pago"
                required
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.total"
                label="Monto"
                type="number"
                required
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.cliente_id"
                :items="clientes"
                label="Cliente (opcional)"
                item-title="nombre"
                item-value="id"
                clearable
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.venta_id"
                :items="ventas"
                label="Venta (opcional)"
                item-title="folio"
                item-value="id"
                clearable
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.comentarios"
                label="Comentario (opcional)"
                rows="2"
                auto-grow
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
        <v-btn color="primary" @click="enviarFormulario">Guardar</v-btn>
      </v-card-actions>
    </v-card>
 
</template>

<script setup>
import { ref } from 'vue'
import supabase from '@/supabase'

const emit = defineEmits(['pagoCreado'])

const props = defineProps({
  clientes: Array,
  ventas: Array,
})

const dialog = ref(false)
const formRef = ref(null)

const form = ref({
  metodo: '',
  total: '',
  cliente_id: null,
  venta_id: null,
  comentarios: ''
})

const metodos = ['efectivo', 'tarjeta', 'transferencia']

const enviarFormulario = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  const { data, error } = await supabase.from('pagos').insert([form.value])

  if (error) {
    console.error('Error al guardar pago:', error)
    return
  }

  emit('pagoCreado', data[0])
  dialog.value = false

  // Resetear formulario
  form.value = {
    metodo: '',
    total: '',
    cliente_id: null,
    venta_id: null,
    comentarios: ''
  }
}
</script>
