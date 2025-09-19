<template>
  <v-container>
    <v-card class="pa-6">
      <h2 class="text-h5 font-weight-bold mb-2">Productos</h2>
      <p class="text-medium-emphasis mb-6">Gestiona y analiza la información de tus productos</p>

      <!-- Resumen -->
      <v-row class="mb-4">
        <v-col cols="12" md="4">
          <v-card class="pa-4" variant="outlined">
            <h3 class="text-subtitle-1">Total de Productos</h3>
            <h1 class="text-h5">{{ productos.length }}</h1>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pa-4" variant="outlined">
            <h3 class="text-subtitle-1">Activos</h3>
            <h1 class="text-h5">{{ activos.length }}</h1>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pa-4" variant="outlined">
            <h3 class="text-subtitle-1">Archivados</h3>
            <h1 class="text-h5">{{ archivados.length }}</h1>
          </v-card>
        </v-col>
      </v-row>

      <!-- Botón agregar y toggle -->
      <div class="d-flex justify-space-between align-center mb-4">
        <v-btn color="black" prepend-icon="mdi-plus" @click="addProducto">
          Agregar Producto
        </v-btn>
      

        <v-btn-toggle v-model="mostrarArchivados" mandatory>
          <v-btn :value="false">Productos Activos ({{ activos.length }})</v-btn>
          <v-btn :value="true">Productos Archivados ({{ archivados.length }})</v-btn>
        </v-btn-toggle>
      </div>
        <v-text-field
        variant="outlined"
          v-model="searchQuery"
          label="Buscar producto por nombre"
          prepend-inner-icon="mdi-magnify"
          clearable
          class="mx-0 mb-4"
          hide-details
        />

      <!-- Listado -->
      <v-row>
        <v-col
          v-for="producto in productosFiltrados"
          :key="producto.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card class="pa-2" variant="outlined">
            <v-img
              height="150"
              :src="producto.imagen || '../../images/no-image.png'"
             
              class="mb-2"
            />
            
            <v-card-title class="text-subtitle-1">{{ producto.nombre }}</v-card-title>
            <v-card-subtitle>
              <div class="d-flex justify-space-between">
                <span>Precio: ${{ producto.precio_de_venta }}</span>
                <span>Stock: {{ producto.stock ?? 0 }}</span>
              </div>
            </v-card-subtitle>
            <v-chip
              v-if="producto.archivado"
              color="grey-darken-2"
              text-color="white"
              class="ma-2"
            >
              Archivado
            </v-chip>
            <v-card-actions>
              <v-btn size="small" color="primary" @click="editProducto(producto)">Editar</v-btn>
              <v-btn
                size="small"
                color="error"
                v-if="!producto.archivado"
                @click="archivarProducto(producto.id)"
              >
                Archivar
              </v-btn>
              <v-btn
                size="small"
                color="success"
                v-if="producto.archivado"
                @click="desarchivarProducto(producto.id)"



              > Desarchivar</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- Dialogo -->
    <v-dialog v-model="showDialog" max-width="500">
      <edit-add-producto
        :producto="selectedProducto"
        @close="showDialog = false; fetchProductos()"
      />
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import supabase from '@/supabase'
import EditAddProducto from './editAddProducto.vue'

const productos = ref([])
const showDialog = ref(false)
const selectedProducto = ref(null)
const mostrarArchivados = ref(false)

const fetchProductos = async () => {
  const { data } = await supabase.from('productos').select('*')
  productos.value = data || []
}

const activos = computed(() => productos.value.filter(p => !p.archivado))
const archivados = computed(() => productos.value.filter(p => p.archivado))

const searchQuery = ref('')

const productosFiltrados = computed(() => {
  const base = mostrarArchivados.value ? archivados.value : activos.value
  if (!searchQuery.value) return base

  return base.filter(producto =>
    producto.nombre.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const addProducto = () => {
  selectedProducto.value = null
  showDialog.value = true
}

const editProducto = (producto) => {
  selectedProducto.value = { ...producto }
  showDialog.value = true
}

const archivarProducto = async (id) => {
  if (confirm('¿Archivar este producto?')) {
    await supabase.from('productos').update({ archivado: true }).eq('id', id)
    fetchProductos()
  }
}

const desarchivarProducto = async (id) => {
  if (confirm('¿Desarchivar este producto?')) {
    await supabase.from('productos').update({ archivado: false }).eq('id', id)
    fetchProductos()
  }
}

onMounted(fetchProductos)
</script>