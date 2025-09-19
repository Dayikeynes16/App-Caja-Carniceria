<template>
  <v-app-bar color="white" elevation="5" class="d-flex align-center px-2">
    <!-- Imagen personalizada sin márgenes adicionales -->
    <v-img 
      src="@/assets/pngtree-silhouette-of-head-cow-logo-design-template-png-image_12615120-removebg-preview.png"
      alt="Logo" 
      
      class="logo-img rounded-circle"
      style="width: 50px !important;  padding-left: 0% !important; padding-right: 0% !important;"
    
    ></v-img>
    <v-toolbar-title  class="ml-2">El Puebla</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn variant="flat" color="black" @click="router.push('/pagos')"  class="mx-2">Pagos</v-btn>
    <v-btn variant="flat" color="black" @click="router.push('/ventas')" class="mx-2"> Ventas</v-btn>
    <v-btn variant="flat" color="black"  @click="router.push('/clientes')" class="mx-2" >Clientes</v-btn>
    <v-btn variant="flat" color="black"  @click="router.push('/productos')" class="mx-2" >Productos</v-btn>
    <v-btn variant="flat" color="black" @click="router.push('/totalVentas')" class="mx-2">Registro diario</v-btn>
    <v-btn variant="flat" color="black" @click="router.push('/busqueda')" class="mx-2">Busqueda</v-btn>
    <v-btn variant="flat" color="black" @click="router.push('/insertarVenta')" class="mx-2">Vender</v-btn>
  </v-app-bar>
</template>

<style scoped>
.logo-img {
  margin: 0;
  padding: 0;
  object-fit: contain;
}
</style>

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

const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  isAuthenticated.value = false;
  window.dispatchEvent(new Event("auth-changed"));
  router.push("/login");
};
</script>
