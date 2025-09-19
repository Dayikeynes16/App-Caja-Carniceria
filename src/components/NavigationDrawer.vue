<template>
    <v-navigation-drawer  v-if="isAuthenticated" class="" >
        <v-list>
            <v-list-item title="Navigation drawer"></v-list-item>
            <v-list-item>
                <v-btn color="black" rounded="35" block @click="router.push('/inicio')">Registro diario</v-btn>
            </v-list-item>
            
            <v-list-item>
                <v-btn color="black" block @click="router.push('/clientes')">Clientes</v-btn>
            </v-list-item>
            <v-list-item>
                <v-btn color="black" block @click="router.push('/ventas')">Ventas</v-btn>
            </v-list-item>
            <v-list-item>
                <v-btn color="black" block @click="router.push('/totalVentas')">Todas las ventas</v-btn>
            </v-list-item>
            <v-list-item>
                <v-btn color="black" block @click="router.push('/insertarVenta')">vender</v-btn>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>

</template>
<script setup>
  import { ref, onMounted, onBeforeUnmount } from "vue";
  import { router } from "@/router";
  

  const isAuthenticated = ref(!!localStorage.getItem("access"));

  
  const authListener = () => {
    isAuthenticated.value = !!localStorage.getItem("access");
  };
  
  onMounted(() => {
    window.addEventListener("auth-changed", authListener);
  });

  
  onBeforeUnmount(() => {
    window.removeEventListener("auth-changed", authListener);
  });
  

</script>