<template>
    <v-snackbar
      v-model="isVisible"
      :timeout="timeout"
      :color="notificationColor"
      location="top"
      elevation="2"

    >
      <v-icon>{{ notificationIcon }}</v-icon>
      {{ message }}
      <template v-slot:actions>
        <v-btn color="white" text @click="isVisible = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  
  const props = defineProps({
    type: {
      type: String,
      required: true,
      validator: (value) => ['error', 'success', 'warning'].includes(value),
    },
    message: {
      type: String,
      required: true,
    },
    timeout: {
      type: Number,
      default: 3000,
    },
    show: {
      type: Boolean,
      required: true,
    }
  });
  
  const isVisible = ref(props.show);
  
  const notificationColor = computed(() => {
    return {
      error: 'red',
      success: 'green',
      warning: 'yellow',
    }[props.type];
  });
  
  const notificationIcon = computed(() => {
    return {
      error: 'mdi-alert-circle',
      success: 'mdi-check-circle',
      warning: 'mdi-alert',
    }[props.type];
  });
  
  watch(() => props.show, (newVal) => {
    isVisible.value = newVal;
  });
  </script>
  