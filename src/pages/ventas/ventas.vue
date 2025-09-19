<template>
  <div class="fill-height ma-3">
    <v-row>
      <v-col cols="3" >


            <v-card
              height=""
              variant="outlined"
              v-for="item in ventas"
              class="ma-4"
            >
              <v-card-title>
                Balanza: {{ item.balanza }}
                <v-divider></v-divider>
              </v-card-title>
              <v-card-subtitle>
                Total: {{ formatCurrency(item.total) }} <br>
                Fecha: {{ getRelativeTime(item.created_at) }} <br>
              </v-card-subtitle>
              <v-card-actions>
                <v-btn block variant="flat" color="green"  @click="details(item)">ver productos</v-btn>
              </v-card-actions>
            </v-card>
      </v-col>
      <v-col cols="6" class="d-flex flex-column fill-width" height="100%">
        <venta  @updateVenta="removeAndClose()"   @finished="remove_venta('warning','venta pendiente')" v-if="selected_venta" :venta="selected_venta"></venta>
        <printing  v-if="selected_venta == 3" :venta="selected_venta" />
      </v-col>
      <v-col cols="3" >
        <pagos @finished="imprimir" v-if="selected_venta" :venta="selected_venta"></pagos>
      </v-col>
    </v-row>
  </div>
  <snackbar :type="notificationType" :message="notificationMessage" :show="showNotification" />
  <v-dialog persistent v-model="print" max-width="500px">
      <printing @close="removeAndClose" @finished="remove_venta('success','venta exitosa')" :venta="selected_venta"></printing>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import supabase from '@/supabase.js';
import totalVentas from './totalVentas.vue';
import printing from './printing.vue';
import snackbar from '@/components/snackbar.vue';
import venta from './venta.vue';
import formatCurrency from '@/composables/formatCurrency';
import useTime from "@/composables/datetime.js";
import pagos from './cobrando/pagos.vue';


const print = ref(false);

const imprimir = () => {
  print.value = true;
}

const removeAndClose = () => {
  remove_venta();
  print.value = false;
}


const { 
  formatDate,
  formatDateWithDay,
  getRelativeTime,
  isToday,
  getDateComponents,
  formatos,
  formatHoraCompleta
} = useTime()

const ventas = ref([]);
const selected_venta = ref(null);
const showNotification = ref(false);
const notificationType = ref('');
const notificationMessage = ref('');

const mostrarNotificacion = (tipo, mensaje) => {
  notificationType.value = tipo;
  notificationMessage.value = mensaje;
  showNotification.value = true;
  setTimeout(() => showNotification.value = false, 3000);
};

const get_ventas = async () => {
  const { data, error } = await supabase.from('ventas').select(`*, pagos(*), producto_ventas(id, producto_id, total, precio, peso, productos(nombre)), clientes(*)`).in('estatus', ['activo', 'en transito']).order('id', { ascending: false });
  if (error) mostrarNotificacion('error', 'Error al obtener ventas');
  else ventas.value = data.map(v => ({ ...v, dialog: false }));
};

const details = (venta) => {
  selected_venta.value = venta;
};

const channels = supabase.channel('custom-insert-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'ventas' },
    (payload) => {
      console.log('Change received!', payload)
      setTimeout(() => {
        get_specific_venta(payload.new.id);
      }, 1500);
    }
  )
  .subscribe()

const get_specific_venta = async (id) => {
  const { data, error } = await supabase.from('ventas').select(`*, pagos(*), producto_ventas(id, producto_id, total, precio, peso, productos(nombre)), clientes(*)`).eq('id', id).single();
  if(error) {
    mostrarNotificacion('error', 'Error al obtener venta');
    return null;
  } else {
    ventas.value.push(data);
  }
};





const remove_venta = ( type,message) => {
  console.log('Removing venta:', selected_venta.value);
  let id = selected_venta.value.id;
  ventas.value = ventas.value.filter(venta => venta.id !== id);
  mostrarNotificacion(type, message);
  selected_venta.value = null;
};




onMounted(() => get_ventas());
</script>


<style scoped>

.v-card {
  width: 100% !important;
}

html, body, #app, .v-container {
  width: 100% !important;
}

</style>
