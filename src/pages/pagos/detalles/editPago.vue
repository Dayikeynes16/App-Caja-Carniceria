<template>
  <v-dialog
    v-model="dialogInterno"
    max-width="500"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="text-h6">Editar Pago</v-card-title>

      <v-card-subtitle v-if="pagoEdit.ventas">
        Venta asociada: <strong>#{{ pagoEdit.ventas }}</strong>
      </v-card-subtitle>

      <v-divider class="mb-2" />

      <v-card-text>
        <v-form @submit.prevent="guardarPago">
          <v-switch
            v-model="pagoEdit.anulado"
            label="¿Anular este pago?"
            color="red"
            inset
            class="mb-2"
          />

          <v-text-field
            v-model.number="pagoEdit.total"
            label="Monto"
            type="number"
            :disabled="pagoEdit.anulado"
            prepend-inner-icon="mdi-currency-usd"
            class="mb-3"
            hide-details
          />

          <v-select
            v-model="pagoEdit.metodo"
            :items="['efectivo', 'tarjeta', 'transferencia']"
            label="Método de Pago"
            :disabled="pagoEdit.anulado"
            prepend-inner-icon="mdi-credit-card"
            class="mb-3"
            hide-details
          />

          <v-textarea
            v-model="pagoEdit.comentario"
            label="Comentario"
            rows="2"
            auto-grow
            :disabled="pagoEdit.anulado === false ? false : false"
            prepend-inner-icon="mdi-comment-text-outline"
            hide-details
          />
          <!-- Sugerencia: si anulas, pide comentario -->
          <div v-if="pagoEdit.anulado" class="text-caption text-red">
            * Recomiendo dejar un comentario de anulación.
          </div>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="emit('update:modelValue', false)">
          Cancelar
        </v-btn>
        <v-btn color="primary" :loading="cargando" :disabled="cargando" @click="guardarPago">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Snackbar (sin modificar tu componente) -->
  <snackbar
    :type="snack.type"
    :message="snack.message"
    :timeout="snack.timeout"
    :show="snack.show"
  />
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { useEditarPago } from '../../../composables/useEditarPago'
import snackbar from '@/components/snackbar.vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  pago: { type: Object, required: true }
})
const emit = defineEmits(['update:modelValue', 'actualizado'])

const dialogInterno = ref(false)
const pagoEdit = ref({})
const anuladoPrevio = ref(false) // para revertir si cancelan

const { editarPago, cargando, error } = useEditarPago()

// Snackbar state (compatible con tu componente)
const snack = ref({ show: false, type: 'success', message: '', timeout: 3000 })
const notify = async (type, message, timeout = 3000) => {
  snack.value.show = false
  snack.value.type = type
  snack.value.message = message
  snack.value.timeout = timeout
  await nextTick(); snack.value.show = true
}

// Sincroniza pago entrante y abre diálogo
watch(
  () => props.pago,
  (val) => {
    if (val) {
      pagoEdit.value = { ...val }
      anuladoPrevio.value = !!val.anulado
      dialogInterno.value = true
    }
  },
  { immediate: true }
)

// Advertir/confirmar al marcar anulado
watch(
  () => pagoEdit.value.anulado,
  async (nuevo) => {
    if (nuevo === anuladoPrevio.value) return
    if (nuevo) {
      // confirmación simple; si prefieres, haz un v-dialog de confirmación
      const ok = window.confirm('¿Seguro que deseas ANULAR este pago? Este cambio afecta saldos.')
      if (!ok) {
        pagoEdit.value.anulado = false
        return
      }
      notify('warning', 'Pago marcado para anulación. Guarda para confirmar.')
    } else {
      notify('warning', 'Se quitó la anulación. Guarda para aplicar el cambio.')
    }
  }
)

async function guardarPago() {
  // Validaciones
  if (!pagoEdit.value.anulado) {
    if (!pagoEdit.value.total || Number(pagoEdit.value.total) <= 0) {
      notify('warning', 'El monto debe ser mayor que 0.')
      return
    }
    if (!pagoEdit.value.metodo) {
      notify('warning', 'Selecciona el método de pago.')
      return
    }
  } else {
    // Sugerido: pedir comentario al anular
    if (!pagoEdit.value.comentario || !pagoEdit.value.comentario.trim()) {
      notify('warning', 'Agrega un comentario de anulación (motivo).')
      return
    }
  }

  const payload = { ...pagoEdit.value }

  const resultado = await editarPago(payload) // tu composable hace el update
  if (resultado?.ok) {
    const fueAnulado = !!payload.anulado
    notify('success', fueAnulado ? 'Pago ANULADO correctamente.' : 'Pago actualizado correctamente.')
    anuladoPrevio.value = fueAnulado
    emit('actualizado', payload)
    emit('update:modelValue', false)
  } else {
    console.error(error?.value || resultado?.error)
    notify('error', 'No se pudo guardar el cambio del pago.')
  }
}

onMounted(() => {
  if (props.pago) {
    pagoEdit.value = { ...props.pago }
    anuladoPrevio.value = !!props.pago.anulado
    dialogInterno.value = true
  }
})
</script>
