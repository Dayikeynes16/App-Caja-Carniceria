<template>
  <v-card
    elevation="1"
    class="pa-4 rounded-lg"
    style="background-color: white; border: 1px solid #e0e0e0;"
  >
    <div class="d-flex align-center gap-4 mb-4">
      <v-avatar color="blue-lighten-4" size="48">
        <span class="text-subtitle-2 font-weight-bold text-blue-darken-2">
          {{ cliente.nombre?.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase() }}
        </span>
      </v-avatar>
      <div>
        <h2 class="text-subtitle-1 font-weight-bold mb-0">
          {{ cliente.nombre }}
        </h2>
        <p class="text-caption text-medium-emphasis">Cliente Premium</p>
      </div>
    </div>

    <v-divider class="mb-4" />

    <v-list density="compact" class="pa-0">
      <v-list-item class="px-0">
        <template #prepend>
          <v-icon icon="mdi-phone" class="me-2 text-grey-darken-1" />
        </template>
        <v-list-item-title class="text-body-2">{{ cliente.telefono || 'No especificado' }}</v-list-item-title>
      </v-list-item>

      <v-list-item class="px-0">
        <template #prepend>
          <v-icon icon="mdi-map-marker" class="me-2 text-grey-darken-1" />
        </template>
        <v-list-item-title class="text-body-2">
          {{ cliente.direccion || 'Dirección no especificada' }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item class="px-0">
        <template #prepend>
          <v-icon icon="mdi-calendar" class="me-2 text-grey-darken-1" />
        </template>
        <v-list-item-title class="text-body-2">
          Cliente desde: {{ new Date(cliente.created_at).toLocaleDateString() }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
const props = defineProps({
  cliente: {
    type: Object,
    required: true,
  },
});
</script>
