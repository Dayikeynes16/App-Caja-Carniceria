<template>
  <!-- Snackbar personalizado -->
  <snackbar v-if="notificacion.show" :message="notificacion.message" :type="notificacion.type" :show="notificacion.show" />

  <!-- Sin descuentos -->
  <v-card v-if="!productos" elevation="1" class="pa-2 rounded-lg">
    <v-card-title>Productos con Descuento</v-card-title>
    <v-card-text>
      Este cliente no cuenta con productos con descuento.
    </v-card-text>
    <v-card-actions class="pt-0">
      <v-btn
        block
        color="green"
        variant="flat"
        prepend-icon="mdi-tag"
        @click="abrirDialog()"
      >
        Nuevo descuento
      </v-btn>
    </v-card-actions>
  </v-card>

  <!-- Con descuentos -->
  <v-card v-else variant="flat" elevation="1" class="pa-2">
    <v-card-title>Productos con Descuento</v-card-title>
    <v-card-text>
      <v-row v-for="(producto, index) in productos" :key="index">
        <v-col cols="12">
          <v-card variant="flat" color="grey-lighten-2" class="pa-4 rounded-lg">
            <!-- Nombre -->
            <div class="text-subtitle-1 font-weight-bold mb-2">
              {{ producto.productos.nombre }}
            </div>

            <!-- Precios -->
            <v-row align="center" class="mb-2">
              <v-col cols="4">
                <div class="text-green-darken-2 font-weight-bold text-h6">
                  {{ formatCurrency(producto.precio) }}
                </div>
              </v-col>
              <v-col cols="4" class="text-grey text-decoration-line-through">
                {{ formatCurrency(producto.productos.precio_de_venta) }}
              </v-col>
              <v-col cols="4" class="text-right">
                <v-chip color="green" variant="flat" size="small">
                  {{ calcularPorcentajeDescuento(producto) }}% OFF
                </v-chip>
              </v-col>
            </v-row>

            <!-- Acciones -->
            <v-row dense>
              <v-col cols="6">
                <v-btn
                  prepend-icon="mdi-delete"
                  color="red"
                  block
                  variant="flat"
                  @click="eliminarDescuento(producto.id)"
                >
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn
                  append-icon="mdi-pencil"
                  color="green"
                  block
                  variant="flat"
                  @click="abrirDialog(producto)"
                >
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions class="pt-0">
      <v-btn
        block
        color="green"
        variant="flat"
        prepend-icon="mdi-tag"
        @click="abrirDialog()"
      >
        Nuevo Descuento
      </v-btn>
    </v-card-actions>
  </v-card>

  <!-- Diálogo para crear/editar -->
  <v-dialog v-model="dialog" max-width="500px">
    <nuevoDescuento
      :cliente_id="cliente.id"
      :descuento="productoSeleccionado"
      @cerrar="cerrarDialog"
      @creado="handleCreado"
    />
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import supabase from '@/supabase'
import formatCurrency from '@/composables/formatCurrency'
import nuevoDescuento from '../nuevoDescuento.vue'
import snackbar from '@/components/snackbar.vue' // importas el componente

const props = defineProps({
  productos: Array,
  cliente: Object
})

const emits = defineEmits(['creado'])

const dialog = ref(false)
const productoSeleccionado = ref(null)

// Snackbar personalizado
const notificacion = ref({
  show: false,
  message: '',
  type: 'success'
})

const mostrarSnackbar = (msg, tipo = 'success') => {
  notificacion.value.message = msg
  notificacion.value.type = tipo
  notificacion.value.show = true

  // Ocultar después de timeout
  setTimeout(() => {
    snackbar.value.show = false
  }, 3000)
}

const abrirDialog = (producto = null) => {
  productoSeleccionado.value = producto
  dialog.value = true
}

const cerrarDialog = () => {
  dialog.value = false
  productoSeleccionado.value = null
}

const handleCreado = () => {
  emits('creado')
  cerrarDialog()
}

const eliminarDescuento = async (id) => {
  const { error } = await supabase
    .from('precio_especials')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error al eliminar descuento:', error)
    mostrarSnackbar('Error al eliminar el descuento.', 'error')
  } else {
    mostrarSnackbar('Descuento eliminado correctamente.', 'success')
    emits('creado')
  }
}

// 👇 Calcula porcentaje de descuento
const calcularPorcentajeDescuento = (producto) => {
  const original = producto.productos.precio_de_venta
  const descuento = producto.precio
  const porcentaje = ((original - descuento) / original) * 100
  return Math.round(porcentaje)
}
</script>
