<template>
  <v-container class="fill-height d-flex align-center justify-center">
    
    <!-- Registro -->
    <v-card v-if="steps === 2" style="border-radius: 2%;" class="pa-0 ma-0" color="gris_cafe" width="80%">
      <v-row>
        <v-col cols="12" md="6" class="d-flex justify-center align-center">
          <v-card style="border-radius: 7% !important;" width="90%" elevation="0" height="90%" color="amarillo" class="pa-5 ma-5 d-flex justify-center align-center">
            <v-img width="80%" class="ma-5" src="../images/h.png"></v-img>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" class="d-flex align-center">
          <v-card elevation="0" color="gris_cafe" class="pa-5 mx-auto" width="100%">
            <v-card-title class="text-h5 text-center">Regístrate</v-card-title>
            <v-card-text>
              <v-text-field :error-messages="errorMessages.username" v-model="form.username" label="Usuario" outlined></v-text-field>
              <v-text-field :error-messages="errorMessages.full_name" v-model="form.full_name" label="Nombre completo" outlined></v-text-field>
              <v-text-field :error-messages="errorMessages.email" v-model="form.email" label="Email" outlined></v-text-field>
              <v-text-field :error-messages="errorMessages.password" v-model="form.password" label="Contraseña" type="password" outlined></v-text-field>
              <v-text-field :error-messages="errorMessages.password_confirmation" v-model="form.password_confirmation" label="Repetir Contraseña" type="password" outlined></v-text-field>
              <v-btn variant="outlined" @click="register" block>Registrarse</v-btn>
            </v-card-text>
            <v-card-actions>
              <v-btn @click="LogOrReg(1)" color="primary">Iniciar Sesión</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- Login -->
    <v-card v-if="steps === 1" style="border-radius: 2%;" class="pa-0 ma-0" color="red" width="80%">
      <v-row>
        <v-col cols="12" md="6" class="d-flex align-center">
          <v-card elevation="0" color="gris_cafe" class="pa-5 mx-auto" width="100%">
            <v-card-title class="text-h5 text-center">Iniciar Sesión</v-card-title>
            <v-card-text>
              <v-text-field :error-messages="errorMessages.username" v-model="form.username" label="Usuario" outlined></v-text-field>
              <v-text-field :error-messages="errorMessages.password" v-model="form.password" label="Contraseña" type="password" outlined></v-text-field>
              <v-btn variant="outlined" @click="login" block>Iniciar Sesión</v-btn>
            </v-card-text>
            <v-card-actions>
              <v-btn @click="LogOrReg(2)" color="primary">Registrarse</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" md="6" class="d-flex justify-center align-center">
          <v-img style="border-radius: 10%;" class="" src="../images/h.png"></v-img>
        </v-col>
      </v-row>
    </v-card>

  </v-container>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import api from "../api";
import { router } from "@/router";

const steps = ref(1);

const LogOrReg = (mode) => {
  steps.value = mode;
  form.value = { username: "", full_name: "", email: "", password: "", password_confirmation: "" };
  errorMessages.value = { username: "", full_name: "", email: "", password: "", password_confirmation: "" };
};

const form = ref({
  username: "",
  full_name: "",
  email: "",
  password: "",
  password_confirmation: "",
});

const errorMessages = ref({
  username: "",
  full_name: "",
  email: "",
  password: "",
  password_confirmation: "",
});

const login = async () => {
  try {
    const response = await axios.post("http://localhost:8000/login/", form.value);
    
    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);

    api.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;

    window.dispatchEvent(new Event("auth-changed"));
    router.push("/inicio");
  } catch (error) {
    errorMessages.value = { username: "Usuario o contraseña incorrectos" };
    console.error("Error en el login", error.response?.data);
  }
};

const register = async () => {
  errorMessages.value = { username: "", full_name: "", email: "", password: "", password_confirmation: "" };

  if (!form.value.username || !form.value.full_name || !form.value.email || !form.value.password || !form.value.password_confirmation) {
    errorMessages.value = { username: "Todos los campos son obligatorios" };
    return;
  }

  if (form.value.password !== form.value.password_confirmation) {
    errorMessages.value.password = "Las contraseñas no coinciden";
    return;
  }

  try {
    const response = await api.post("/register/", form.value);
    alert("Usuario registrado correctamente");
    LogOrReg(1);
  } catch (error) {
    if (error.response?.data) {
      errorMessages.value = {
        username: error.response.data.username?.[0] || "",
        full_name: error.response.data.full_name?.[0] || "",
        email: error.response.data.email?.[0] || "",
        password: error.response.data.password?.[0] || "",
        password_confirmation: "",
      };
    } else {
      alert("Error al registrar usuario");
    }
  }
};
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
