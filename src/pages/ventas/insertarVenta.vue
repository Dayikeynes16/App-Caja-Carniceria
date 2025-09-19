<template>
    <v-container>
      <snackbar
        :type="notificationType"
        :message="notificationMessage"
        :show="showNotification"
      ></snackbar>
  
      <v-row>
        <!-- SECCIÓN DE NUEVA VENTA -->
        <v-col cols="6">
          <v-card variant="outlined">
            <v-card-title>Nueva Venta</v-card-title>
            <v-card-text>
              <v-autocomplete
                :items="productos"
                variant="outlined"
                v-model="select"
                label="Selecciona un producto"
                item-value="id"
                item-title="nombre"
              ></v-autocomplete>
  
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    variant="outlined"
                    label="Peso del producto"
                    v-model="selectedProducto.peso"
                    type="number"
                    min="0"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  Peso: {{ parseFloat(selectedProducto.peso || 0).toFixed(2) }} KG
                </v-col>
  
                <v-col cols="6">
                  <v-text-field
                    variant="outlined"
                    :disabled="selectedProducto.disabled"
                    v-model="selectedProducto.precio_de_venta"
                    label="Precio"
                    type="number"
                    min="0"
                  ></v-text-field>
                </v-col>
                <v-col cols="2" class="d-flex align-center">
                  <v-btn icon @click="toggleDisabled">
                    <v-icon icon="mdi-pencil" />
                  </v-btn>
                </v-col>
                <v-col cols="4">
                  Total:
                  {{ formatCurrency((selectedProducto.peso * selectedProducto.precio_de_venta).toFixed(2)) }}
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-row>
                <v-col cols="6">
                  <v-btn block variant="flat" color="green" @click="addProducto">Añadir Producto</v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn block variant="flat" color="red" @click="limpiarCampos">Cancelar</v-btn>
                </v-col>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-col>
  
        <!-- SECCIÓN DE LISTA DE PRODUCTOS -->
        <v-col cols="6">
          <v-card variant="outlined">
            <v-card-title>
              Productos de la venta total: {{ formatCurrency(get_total()) }}
            </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="productosVenta"
                no-data-text="No hay productos en esta venta"
                hide-default-footer
                class="bg-white"
              >
                <template #item.peso="{ item }">
                  {{ item.peso.toFixed(2) }} KG
                </template>
                <template #item.precio_de_venta="{ item }">
                  {{ formatCurrency(item.precio_de_venta) }}
                </template>
                <template #item.total="{ item }">
                  {{ formatCurrency(item.total) }}
                </template>
                <template #item.acciones="{ index }">
                  <v-icon color="red" icon="mdi-delete-alert" @click="productosVenta.splice(index, 1)" />
                </template>
              </v-data-table>
            </v-card-text>
            <v-card-actions>
              <v-btn block variant="flat" color="green" @click="AgregarVenta">Finalizar</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { onMounted, ref, shallowRef, watch } from 'vue'
  import formatCurrency from '@/composables/formatCurrency'
  import supabase from '@/supabase.js'
  import snackbar from '@/components/snackbar.vue'
  import { getMexicoLocalString } from '@/composables/localtime'
  import { insertarProductoVenta } from './insertarProductoVenta'


  const getMexicoTime = () => {
    return new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }).replace(",", "").replace("/", "-").replace("/", "-");
  };

  // REFS PRINCIPALES
  const productos = ref([])
  const select = shallowRef(null)
  const productosVenta = ref([])
  const selectedProducto = ref({
    peso: 0,
    precio_de_venta: 0,
    disabled: true
  })
  
  // SNACKBAR
  const showNotification = ref(false)
  const notificationType = ref('')
  const notificationMessage = ref('')
  
  // ENCABEZADOS DE TABLA
  const headers = [
    { text: 'Producto', value: 'nombre' },
    { text: 'Peso', value: 'peso' },
    { text: 'Precio', value: 'precio_de_venta' },
    { text: 'Total', value: 'total' },
    { text: 'Eliminar', value: 'acciones', sortable: false }
  ]
  
  // FUNCIONES
  const get_ventas = async () => {
    const { data, error } = await supabase.from('productos').select('*')
    if (error) console.error(error)
    else productos.value = data
  }
  
  const get_total = () => {
    return productosVenta.value.reduce((total, producto) => total + producto.total, 0)
  }
  
  const toggleDisabled = () => {
    selectedProducto.value.disabled = !selectedProducto.value.disabled
  }
  
  const limpiarCampos = () => {
    select.value = null
    selectedProducto.value = {
      peso: 0,
      precio_de_venta: 0,
      disabled: true
    }
  }
  
  const addProducto = async () => {
    try {
      if (!selectedProducto.value.nombre || selectedProducto.value.peso <= 0) {
        showNotification.value = true
        notificationType.value = 'error'
        notificationMessage.value = 'Selecciona un producto válido con peso mayor a 0'
        return
      }
  
      const producto_venta = {
        nombre: selectedProducto.value.nombre,
        peso: parseFloat(selectedProducto.value.peso),

        precio: parseFloat(selectedProducto.value.precio_de_venta),
        total:
          parseFloat(selectedProducto.value.peso) *
          parseFloat(selectedProducto.value.precio_de_venta),
        producto_id: selectedProducto.value.id
      }
  
      productosVenta.value.push(producto_venta)
  
      showNotification.value = true
      notificationType.value = 'success'
      notificationMessage.value = 'Producto añadido correctamente'
      limpiarCampos()
    } catch (error) {
      console.error('Error al añadir el producto:', error)
      showNotification.value = true
      notificationType.value = 'error'
      notificationMessage.value = 'Error al añadir el producto'
    }
  }
  
  const create_venta = async () => {
    const { data, error } = await supabase
      .from('ventas')
      .insert({
        created_at: getMexicoTime(),
        balanza: '0',
        total: parseFloat(get_total()),
        estatus: 'activo'
      })
      .select()
      .single()
  
    if (error) {
      console.error(error)
      return null
    } else {
      return data
    }
  }
  
  const AgregarVenta = async () => {
    let venta = await create_venta()
    if (!venta) {
      showNotification.value = true
      notificationType.value = 'error'
      notificationMessage.value = 'Error al registrar la venta'
      return
    }
  
    const productos = await insertarProductoVenta(venta.id, productosVenta.value)
  
    if (productos.success) {
      showNotification.value = true
      notificationType.value = 'success'
      notificationMessage.value = 'Venta registrada correctamente'
      limpiarCampos()
      productosVenta.value = []
    } else {
      showNotification.value = true
      notificationType.value = 'error'
      notificationMessage.value = 'Error al registrar los productos'
    }
  }
  
  // WATCH PARA CAMBIO DE PRODUCTO
  watch(select, (nuevoId) => {
    if (nuevoId) {
      const producto = productos.value.find((p) => p.id === nuevoId)
      if (producto) {
        selectedProducto.value = {
          ...producto,
          peso: 0,
          disabled: true

        }
      }
    }
  })
  
  // INICIALIZACIÓN
  onMounted(() => {
    get_ventas()
  })
  </script>
  