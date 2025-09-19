<template>
  <v-row class="ma-5">
    <v-col cols="12">
      <v-btn
        variant="outlined"
        class="ml-5"
        @click="goBack"
        color="black"
        prepend-icon="mdi-arrow-left"
      >
        Volver
      </v-btn>
    </v-col>

    <v-col cols="7">
      <v-row>
        <venta :update v-if="showSale" :venta="ventaEspecifica" />
        <v-col cols="12">

        </v-col>
        <v-col cols="12"></v-col>
      </v-row>
    
    </v-col>

    <v-col cols="5">
      <v-row>
        <v-col cols="12">
          <pagos v-if="showSale" :venta="ventaEspecifica" />
        </v-col>
        <v-col cols="12">
          <aplicarDescuento @actualizado="getSpecificVenta" v-if="showSale" :venta="ventaEspecifica" />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup>
import supabase from '@/supabase';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import venta from '../ventas/venta.vue';
import pagos from '../ventas/cobrando/pagos.vue';
import aplicarDescuento from '../clientes/aplicarDescuento.vue';

const router = useRouter();
const route = useRoute();

const ventaEspecifica = ref(null);
const showSale = ref(false);
const id = ref(null);

const goBack = () => {
  router.back();
};

onMounted(async () => {
  await getSpecificVenta();
});

const getSpecificVenta = async () => {
  const { data, error } = await supabase
    .from('ventas')
    .select(`
      *,
      pagos(*),
      clientes(*),
      producto_ventas (
        total,
        precio,
        peso,
        productos(nombre)
      )
    `)
    .eq('id',  route.params.id)
    .single();

  if (error) {
    console.error('Error al obtener la venta específica:', error);
  } else {
    ventaEspecifica.value = data;
    showSale.value = true;
    console.log('heyhhhhhh');
    
  }
};
</script>
