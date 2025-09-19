<template>
        <snackbar :type="notificationType" :message="notificationMessage" :show="showNotification"></snackbar>
        <v-row>
         
            <v-col cols="6">
                <v-card v-if="!props.corte" border="md" rounded="xl" height="100%" :disabled="edit" elevation="0">
                    <v-card-title>
                        <h1>Venta del dia</h1>
                    </v-card-title>
                    <v-card-text>
                        <v-text-field :error-messages="errorMessages.efectivo" v-model="corte.efectivo" label="Efectivo">
                        </v-text-field>
                        <v-text-field :error-messages="errorMessages.tarjeta" v-model="corte.tarjeta" label="Tarjeta"></v-text-field>
                        <v-text-field :error-messages="errorMessages.transferencia" v-model="corte.transferencia" label="Transferencia"></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click="save" block class="pa-3" rounded="xl" variant="flat"  color="black" >Guardar</v-btn>
                    </v-card-actions>
                </v-card>
                <v-card>
                    <ComparedToYesterday  :values="chartData"></ComparedToYesterday>
                </v-card>
            </v-col>
            <v-col cols="6">
                <v-card border="md" rounded="xl" height="100%">
                    <v-card-title>
                        <v-row class="pa-4  mx-auto" >
                            <v-col cols="10" align="left">
                                <h2 v-if="!props.corte">Resumen del dia</h2>
                                <h2 v-else>Busqueda especifica</h2>
                                <p>{{ formatDateWithDay(corte.fecha) }}</p>
                            </v-col>
                        

                            <v-col cols="2" align="right" class="pt-5">
                                <v-icon v-if="!props.corte" @click="editMode" size="sm" icon="mdi-pencil"></v-icon>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col  cols="12" >
                               <v-sheet elevation="3" class="pa-4 text-center mx-auto"  height="100%" width="100%">
                                <h3>Total: {{ formatCurrency(corte.total) }}</h3>
                               </v-sheet>
                            </v-col>
                            <v-col>
                                <v-row height="100%">
                                    <v-col cols="6">
                                        <v-sheet elevation="2" class="pa-4 text-center mx-auto" height="100%">
                                            Tarjeta: {{ formatCurrency(corte.tarjeta) }}
                                        </v-sheet>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-sheet elevation="2" class="pa-4 text-center mx-auto" height="100%">
                                            Transferencia: {{ formatCurrency(corte.transferencia) }}
                                        </v-sheet>

                                    </v-col>
                                    <v-col cols="12">
                                        <v-sheet elevation="2" class="pa-4 text-center mx-auto" height="100%">
                                            Efectivo: {{ formatCurrency(corte.efectivo) }}
                                        </v-sheet>
                                    </v-col>
                                </v-row>

                            </v-col>
                        </v-row>


                    </v-card-text>
                    <v-card-actions>
                        <v-btn >
                        probando
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
        
</template>
<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";
import api from "@/api";
import { router } from "@/router";
import Navbar from "@/components/Navbar.vue";
import snackbar from "@/components/snackbar.vue";
import formatCurrency from "@/composables/formatCurrency";
import useTime from "@/composables/datetime.js";
import ComparedToYesterday from "@/components/ComparedToYesterday.vue";

const { 
  formatDate,
  formatDateWithDay,
  getRelativeTime,
  isToday,
  getDateComponents,
  formatos
} = useTime()

const props = defineProps({
  corte: {
    type: Object,
    required: false,
  },
});

const edit = ref(true);
const corte = ref({
});

const chartData = ref([])
const errorMessages = ref({})

const getUserInfo = async () => {
   api.get("users/")
    .then((response) => {
         console.log(response.data, ' esto esdjjs');
    })
};

const editMode = () => {
    edit.value = !edit.value;
};

const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    delete api.defaults.headers.common["Authorization"];
    router.push("/login");
};

const save = () => {
    const response = api.post("cortes/cortes/", corte.value)
    .then((response) => {
        console.log(response.data);
        corte.value = response.data;
        mostrarNotificacion('success', 'Guardado con exito')
    })
    .catch((error) => {
        console.log(error.response.data);
        errorMessages.value = error.response.data
        
    });
};

const showNotification = ref(false);
const notificationType = ref('');
const notificationMessage = ref('');

const mostrarNotificacion = (tipo, mensaje) => {
  notificationType.value = tipo;
  notificationMessage.value = mensaje;
  showNotification.value = true;

  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};


const delete_all = async () => {
    try {
        const response = await api.delete("/cortes/cortes/")
        mostrarNotificacion(
            "success" , 'borrado con exito'

        )
    } catch (error) {
        mostrarNotificacion(
            "error", "ocurrio un problema"
        )
    } 
}
onMounted( async ()  => {
    if (props.corte) {
        
        corte.value = props.corte
        corte.value.chart = []
        console.log(corte.value.historial.historial,' esta es una prueba');
        
        corte.value.historial.historial.forEach(item => {
            chartData.value.push(parseFloat(item.total)) // Acceder a `total` correctamente
        })
        console.log(chartData.value, 'probando asies');
        
    }
  
    if(!props.corte){

        const data = await api.get("cortes/cortes/")
        console.log(data);
        
        
        corte.value = data.data
      
    }
  
});

</script>