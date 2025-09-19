<template>
  <v-container class="pa-0">
    <v-card elevation="1" class="pa-4" >
      <h2 class="text-h6 font-weight-bold mb-1">Últimas Compras</h2>
      <p class="text-caption text-medium-emphasis mb-4">Historial reciente de transacciones</p>

      <v-infinite-scroll
        no-data-text="No hay ventas"
        :has-more="hasMore"
        direction="vertical"
        :items="ventas"
        @load="load"
      >
        <v-list density="compact" class="pa-0">
          <template v-for="item in ventas" :key="item.id">
            <v-list-item
              class="rounded-lg mb-3 pa-3 d-flex align-center justify-space-between"
              style="border: 1px solid #eee;"
            >
              <!-- Parte izquierda -->
              <div class="d-flex align-center gap-3">
                <v-avatar size="38" color="grey-lighten-3">
                  <v-icon icon="mdi-receipt" color="primary" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">
                    {{ formatCurrency(item.total) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ formatFechaLargaConSlash(item.created_at) }}
                  </div>
                </div>
              </div>

              <!-- Parte derecha -->
              <div class="d-flex align-center gap-2">
                <v-chip
                  size="small"
                  :color="item.estatus === 'cobrado' ? 'green' : item.estatus === 'pendiente' ? 'orange' : 'blue'"
                  text-color="white"
                  label
                >
                  {{ item.estatus }}
                </v-chip>
                <v-btn
                  size="small"
                  variant="outlined"
                  @click="especifica(item)"
                >
                  Detalles
                </v-btn>
              </div>
            </v-list-item>
          </template>
        </v-list>
      </v-infinite-scroll>

      <v-btn
        v-if="hasMore && ventas.length > 0"
        block
        variant="tonal"
        color="primary"
        class="mt-3"
        @click="load({ done: () => {} })"
      >
        Ver Más Transacciones
      </v-btn>

      <div v-if="!ventas.length && historial" class="text-center text-medium-emphasis mt-4">
        Este cliente no tiene historial de compras
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import supabase from '@/supabase.js'
import formatCurrency from '@/composables/formatCurrency'
import useTime from '@/composables/datetime.js'
import { router } from '@/router'

const { formatFechaLargaConSlash } = useTime()

const props = defineProps({
  id: {
    type: Number,
    required: true
  }
})

const ventas = ref([])
const historial = ref(false)
const hasMore = ref(true)

const paginate = ref({
  page: 1,
  pageSize: 5
})

const especifica = (item) => {
  const id = item.id
  router.push({ name: 'ventaEspecifica', params: { id } })
}

const load = async ({ done }) => {
  try {
    const from = (paginate.value.page - 1) * paginate.value.pageSize
    const to = (paginate.value.page * paginate.value.pageSize) - 1

    const { data, error } = await supabase
      .from('ventas')
      .select(`
        *,
        pagos (*),
        producto_ventas (
          *,
          productos (*)
        )
      `)
      .eq('cliente_id', props.id)
      .in('estatus', ['pagado', 'cobrado', 'pendiente'])
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error al obtener ventas:', error)
      return done('error')
    }

    if (!data || data.length === 0) {
      hasMore.value = false
      return done('empty')
    }

    ventas.value.push(...data)
    historial.value = true
    paginate.value.page++

    if (data.length < paginate.value.pageSize) {
      hasMore.value = false
      done('empty')
    } else {
      done('ok')
    }
  } catch (error) {
    console.error('Error en load:', error)
    done('error')
  }
}

onMounted(() => {
  if (props.id) {
    historial.value = true
  }
})

watch(() => props.id, (newId) => {
  if (newId) {
    ventas.value = []
    paginate.value.page = 1
    hasMore.value = true
    historial.value = false
    load({ done: () => {} })
  }
})
</script>
