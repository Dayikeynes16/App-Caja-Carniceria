<template>
    <v-container>
        <v-row>
            <v-col cols="8">
                <v-btn v-if="steps !== 1" icon="mdi-arrow-left" class="mb-5" @click="steps = 1; selected = null"></v-btn>
                <RegistroVentas v-if="steps === 1"   ></RegistroVentas>
                <historialVendido v-if="steps === 2" @update-user="selected = $event, steps=3"></historialVendido>
                <RegistroVentas v-if="steps === 3" :corte="selected"  ></RegistroVentas>
                
            </v-col>
            <v-col cols="4">
                    <v-list rounded="xl">
                        <v-list-item>
                            <v-btn color="black" rounded="xl" @click="steps = 1 ; corte = {}" block>Registro de ventas</v-btn>
                        </v-list-item>
                        <v-list-item >
                            <v-btn color="black" rounded="xl" @click="steps = 2" block>Historial</v-btn>
                        </v-list-item>
                        <v-list-item >
                            <v-btn color="black" rounded="xl" @click="steps = 3" block>Estadisticas</v-btn>
                        </v-list-item>
                    </v-list>
            </v-col>
        </v-row>
    </v-container>

</template>
<script setup>
import { ref } from 'vue';
import RegistroVentas from './registroVentas/RegistroVentas.vue';
import historialVendido from './registroVentas/historialVendido.vue';

const steps = ref(1)

const selected = ref()

if (selected.value) {
    console.log('hdhdh', selected.value);
}




</script>