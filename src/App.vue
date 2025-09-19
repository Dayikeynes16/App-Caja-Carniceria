<template>
  <v-app>
    <AppNavbar />
    <v-main>
      <RouterView />
    </v-main>

    <AppFooter />
  </v-app>
</template>

<script setup>
import { RouterView } from "vue-router";
import AppNavbar from "@/components/Navbar.vue";
import NavigationDrawer from "./components/NavigationDrawer.vue";
  //
</script>
