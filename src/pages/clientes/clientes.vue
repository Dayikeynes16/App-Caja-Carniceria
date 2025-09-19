<template>
  <v-container width="100%" class="pa-6">
    <v-card>
      <!-- Encabezado -->
      <v-card-title class="d-flex justify-space-between align-center ma-2">
        <v-row class="align-center">
          <v-col cols="8">
            <h1 class="text-h3">Clientes</h1>
          </v-col>
          <v-col cols="4" class="text-right">
            <v-btn
              prepend-icon="mdi-account-multiple-plus"
              color="black"
              variant="flat"
              @click="nuevoClienteDialog = true"
            >
              Nuevo Cliente
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-subtitle class="d-flex justify-space-between align-center ma-2">
        Gestiona y analiza la información de tus clientes
      </v-card-subtitle>

      <!-- Tarjetas resumen -->
      <v-card-text>
        <v-row>
          <v-col cols="3">
            <v-card append-icon="mdi-cash-check" title="Total por cobrar" class="mx-auto my-2 pa-2" height="140px" variant="outlined">
              <v-card-text>
                <h3><strong>{{ formatCurrency(totalPorCobrar) }}</strong></h3>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="3">
            <v-card title="Total de clientes" append-icon="mdi-account-group-outline" height="140px" class="mx-auto my-2 pa-2" variant="outlined">
              <v-card-text>
                <h3><strong>{{ clients.length }}</strong></h3>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="3">
            <v-card title="Clientes Activos" append-icon="mdi-trending-up" height="140px" class="mx-auto my-2 pa-2" variant="outlined">
              <v-card-text>
                <h3><strong>{{ clients.filter(c => !c.archived).length }}</strong></h3>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="3">
            <v-card title="Clientes Inactivos" append-icon="mdi-trending-down" height="140px" class="mx-auto my-2 pa-2" variant="outlined">
              <v-card-text>
                <h3><strong>{{ clients.filter(c => c.archived).length }}</strong></h3>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Tabla de clientes -->
          <v-col cols="12">
            <v-card variant="outlined" class="mx-auto" width="100%">
              <v-card-text>
                <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />
                <v-row>
                  <v-col cols="8">
                    <v-text-field
                      v-model="search"
                      variant="outlined"
                      label="Buscar cliente"
                      append-icon="mdi-magnify"
                      class="mb-4"
                    />
                  </v-col>
                  <v-col align="end" cols="4">
                    <v-switch
                      v-model="mostrarArchivados"
                      inset
                      color="primary"
                      :label="mostrarArchivados ? `Mostrar archivados (${clients.filter(c => c.archived).length})` : `Mostrar activos (${clients.filter(c => !c.archived).length})`"
                      class="mb-4"
                    />
                  </v-col>
                </v-row>
                <v-data-table
                  :headers="headers"
                  :items="clientsFiltrados"
                  :search="search"
                  item-value="id"
                  class=""
                  :loading="loading"
                  no-data-text="No se encontraron clientes con esos criterios"
                >
                  <!-- Nombre -->
                  <template #item.nombre="{ item }">
                    <span :class="item.deuda === 0 ? 'text-grey' : 'text-high-emphasis'">
                      {{ item.nombre }}
                    </span>
                  </template>

                  <!-- Teléfono -->
                  <template #item.telefono="{ item }">
                    {{ item.telefono }}
                  </template>

                  <!-- Deuda -->
                  <template #item.deuda="{ item }">
                    <span :class="item.deuda > 0 ? 'text-red' : 'text-grey'">
                      {{ formatCurrency(item.deuda) }}
                    </span>
                  </template>

                  <!-- Estado -->
                  <template #item.estado="{ item }">
                    <v-chip :color="item.archived ? 'grey' : 'success'" size="small">
                      {{ item.archived ? 'Inactivo' : 'Activo' }}
                    </v-chip>
                  </template>

                  <!-- Acciones -->
                  <template #item.acciones="{ item }">
                    <v-btn class="mx-2" @click="verCliente(item.id)" color="primary" variant="outlined" size="small">Ver</v-btn>
                    <v-btn class="mx-2" @click="editarCliente(item)" color="primary" variant="outlined" size="small">Editar</v-btn>
                    <v-btn
                      class="mx-2"
                      v-if="!item.archived"
                      @click="archivarCliente(item.id)"
                      color="error"
                      variant="outlined"
                      size="small"
                    >Archivar</v-btn>
                    <v-btn
                      v-else
                      class="mx-2"

                      @click="restaurarCliente(item.id)"
                      color="success"
                      variant="outlined"
                      size="small"
                    >Restaurar</v-btn>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Snackbar y diálogo -->
    <snackbar :show="notificacion.show" :message="notificacion.message" :type="notificacion.type"></snackbar>
    <v-dialog max-width="50%" v-model="nuevoClienteDialog">
      <nuevoCliente @cerrar="nuevoClienteDialog = false" @clienteCreado="refreshClients" :cliente="clienteSeleccionado" />
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import supabase from '@/supabase.js'
import { router } from '@/router'
import nuevoCliente from './nuevoCliente.vue'
import snackbar from '@/components/snackbar.vue'

const clients = ref([])
const search = ref('')
const loading = ref(false)
const mostrarArchivados = ref(false)
const nuevoClienteDialog = ref(false)
const clienteSeleccionado = ref()

const notificacion = ref({ show: false, type: '', message: '' })

const mostrarNotificacion = (type, message) => {
  notificacion.value = { show: true, type, message }
  setTimeout(() => { notificacion.value.show = false }, 3000)
}

const refreshClients = () => {
  mostrarNotificacion('success', 'Clientes actualizados correctamente')
  get_clients()
  nuevoClienteDialog.value = false
  clienteSeleccionado.value = null
  loading.value = false
}

const headers = [
  { text: 'Nombre', value: 'nombre' },
  { text: 'Teléfono', value: 'telefono' },
  { text: 'Deuda', value: 'deuda' },
  { text: 'Estado', value: 'estado' },
  { text: 'Acciones', value: 'acciones' }
]

const verCliente = (id) => router.push({ name: 'clientesDetalles', params: { id } })
const editarCliente = (cliente) => {
  clienteSeleccionado.value = cliente
  nuevoClienteDialog.value = true
}

const calcularDeudaCliente = (ventas) => {
  return ventas?.reduce((acc, venta) => {
    if (venta.estatus === 'cancelado') return acc
    const totalPagado = venta.pagos?.reduce((suma, p) => suma + (p.total || 0), 0) || 0
    const deuda = venta.total - totalPagado
    return deuda > 0 ? acc + deuda : acc
  }, 0) || 0
}

const get_clients = async () => {
  loading.value = true
  const { data, error } = await supabase.from('clientes').select(`*, ventas(*, pagos(*))`)
  if (error) {
    console.error(error)
  } else {
    clients.value = data.map(client => ({
      id: client.id,
      nombre: client.nombre,
      telefono: client.telefono,
      deuda: calcularDeudaCliente(client.ventas ?? []),
      archived: client.archived || false
    }))
  }
  loading.value = false
}

const formatCurrency = (val) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val)

const totalPorCobrar = computed(() =>
  clients.value.reduce((sum, c) => sum + (c.deuda || 0), 0)
)

const clientsFiltrados = computed(() =>
  clients.value.filter(c =>
    (mostrarArchivados.value ? c.archived : !c.archived) &&
    c.nombre.toLowerCase().includes(search.value.toLowerCase())
  )
)

const archivarCliente = async (id) => {
  const { error } = await supabase.from('clientes').update({ archived: true }).eq('id', id)
  if (!error) {
    mostrarNotificacion('success', 'Cliente archivado')
    get_clients()
  }
}

const restaurarCliente = async (id) => {
  const { error } = await supabase.from('clientes').update({ archived: false }).eq('id', id)
  if (!error) {
    mostrarNotificacion('success', 'Cliente restaurado')
    get_clients()
  }
}

onMounted(() => {
  get_clients()
})
</script>

<style scoped>
.text-red {
  color: #d32f2f;
}
.text-grey {
  color: #9e9e9e;
}
</style>
