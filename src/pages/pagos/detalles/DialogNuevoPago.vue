<template>
  <v-dialog v-model="visibleLocal" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-h6">Registrar nuevo pago</v-card-title>

      <v-card-text>
        <v-form @submit.prevent="emitirGuardar" ref="formRef">
          <v-text-field v-model="form.total" label="Monto pagado" type="number" required />
          <v-select v-model="form.metodo" :items="['efectivo','tarjeta','transferencia']" label="Método de pago" required />
          <v-autocomplete v-model="form.cliente_id" :items="clientes" item-title="nombre" item-value="id" label="Cliente (opcional)" clearable />
          <v-text-field v-model="form.venta_id" label="ID de venta (opcional)" type="text" clearable />
          <v-textarea v-model="form.comentario" label="Comentario (opcional)" rows="2" auto-grow />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="cancelar">Cancelar</v-btn>
        <v-btn color="primary" @click="emitirGuardar">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Usa tu snackbar SIN cambios -->
  <Snackbar
    :type="snack.type"
    :message="snack.message"
    :timeout="snack.timeout"
    :show="snack.show"
  />
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import Snackbar from '@/components/snackbar.vue'

const props = defineProps({
  visible: Boolean,
  clientes: Array,
})
const emit = defineEmits(['update:visible','guardar'])

const visibleLocal = ref(props.visible)
watch(() => props.visible, v => { visibleLocal.value = v })
watch(visibleLocal, v => emit('update:visible', v))

const form = ref({
  total: null, metodo: null, cliente_id: null, venta_id: null, comentario: ''
})
const formRef = ref(null)

/** Estado del snackbar (compatible con tu componente) */
const snack = ref({
  show: false,
  type: 'success',        // 'success' | 'warning' | 'error'
  message: '',
  timeout: 3000
})
/** Helper para mostrar notificación sin cambiar el snackbar */
const notify = async (type, message, timeout = 3000) => {
  snack.value.show = false              // resetea para re-disparar
  snack.value.type = type
  snack.value.message = message
  snack.value.timeout = timeout
  await nextTick()
  snack.value.show = true
}

const emitirGuardar = async () => {
  if (!form.value.total || !form.value.metodo) {
    notify('warning', 'Faltan campos obligatorios.')
    return
  }

  try {
    // Deja que el padre haga el insert/update (Supabase):
    // Nota: emit() no devuelve promesa; es “optimista”.
    emit('guardar', { ...form.value })

    // Mensajes según caso (ajusta a tu lógica):
    // - si mandas varios pagos juntos -> muestra conteo
    // - si detectas edición (p.ej. viene un id de pago) -> "actualizado"
    if (Array.isArray(form.value.total)) {
      notify('success', `Se registraron ${form.value.total.length} pagos.`)
    } else if (form.value.id) {
      notify('success', 'Pago actualizado correctamente.')
    } else {
      notify('success', 'Pago registrado correctamente.')
    }

    limpiar()
    visibleLocal.value = false
  } catch (e) {
    notify('error', 'No se pudo guardar el pago.')
  }
}

const cancelar = () => {
  limpiar()
  visibleLocal.value = false
  notify('warning', 'Registro cancelado.')
}

const limpiar = () => {
  form.value = { total: null, metodo: null, cliente_id: null, venta_id: null, comentario: '' }
}
</script>
