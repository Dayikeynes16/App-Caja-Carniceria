<template>
    <v-container>
        <v-card width="100%" variant="outlined" class="bg-white ">
            <v-card-title>
                <strong>
                    Detalles de Pago
                </strong>
            </v-card-title>
            <v-card-text class="bg-white ">
                <v-row>
                    <v-col cols="6">
                        <div align="left">
                            Total: 
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div align="right">
                            {{ formatCurrency(payment.total) }}
                        </div>

                    </v-col>
                    <v-col cols="6">
                        <div align="left">
                            Por liquidar:
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div align="right">
                            {{ formatCurrency(payment.restante) }}
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div align="left">
                            Pagado:
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div align="right">
                            {{ formatCurrency(payment.total - payment.restante) }}
                        </div>
                    </v-col>
                    <v-col cols="6" v-if="payment.cambio > 0">
                        <div align="left">
                            Cambio:
                        </div>
                    </v-col>
                    <v-col cols="6" v-if="payment.cambio > 0">
                        <div align="right">
                            {{ formatCurrency(payment.cambio) }}
                        </div>
                    </v-col>
                </v-row>
                <v-divider></v-divider>
                <div v-if="venta.estatus !== 'cobrado'" class="text-h6">
                    <v-text-field :error-messages="errorMessages.cantidad" variant="outlined" v-model="form.cantidad" :model-value="form.cantidad" label="Cantidad a pagar" type="number" >
                    </v-text-field>
                    <v-select :error-messages="errorMessages.metodo" variant="outlined" v-model="form.metodo"  :model-value="form.metodo" label="Metodo de pago" :items="['efectivo', 'tarjeta', 'transferencia']" ></v-select>
                    <v-btn block color="green" @click="bill_sale">Pagar</v-btn>
                    <v-divider></v-divider>
                </div>
                <div >
                    <v-list v-if="existingPayments" class="pa-0 ma-0">
                        
                            <div class="text-h6 bg-white ">pagos realizados</div>
                            <v-list-item v-for="i in venta.pagos" class="bg-white">
                                <v-list-item-content>
                                    <v-row>
                                        <v-col cols="6">
                                            <div align="left">
                                                <v-row>
                                                    <v-col cols="3">
                                                        <v-icon v-if="i.metodo === 'efectivo'" size="35" icon="mdi-cash"></v-icon>
                                                        <v-icon v-if="i.metodo === 'tarjeta'" size="30" icon="mdi-credit-card-check-outline"></v-icon>
                                                        <v-icon v-if="i.metodo === 'transferencia'" size="30" icon="mdi-swap-horizontal"></v-icon>
                                                    </v-col>
                                                    <v-col cols="9" >
                                                        <div align="left">
                                                            <v-list-item-title>{{ i.metodo }}</v-list-item-title>
                                                        </div>

                                                    </v-col>
                                                </v-row>
                                             


                                            </div>
                                        </v-col>
                                        <v-col cols="6">
                                            <div align="right">
                                                <v-list-item-title>{{ formatCurrency(i.total) }}</v-list-item-title>

                                            </div>
                                        </v-col>
                                    </v-row>
                                </v-list-item-content>
                            </v-list-item>
                    </v-list>
                </div>
            </v-card-text>
        </v-card>
    </v-container>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import supabase from '@/supabase.js';
import formatCurrency from '@/composables/formatCurrency.js';
import { getMexicoLocalString } from '@/composables/localtime';

const props = defineProps({
  venta: {
    type: Object,
    required: true
  }
});

const emits = defineEmits(['finished']);

const form = ref({
  cantidad: 0,
  metodo: 'efectivo'
});

const errorMessages = ref({})

const validate = () => {
    console.log('Validating form:', form.value);
    if(isNaN(form.value.cantidad)) { 
    errorMessages.value.cantidad = 'debe ser un numero';
    return false;
  }
  if (form.value.cantidad <= 0) {
    errorMessages.value.cantidad = 'Cantidad debe ser mayor a 0';
    return false;
  }
  
  if(!form.value.metodo) {
    errorMessages.value.metodo = 'Metodo de pago es requerido';
    return false;
  }
  return true;
};

const existingPayments = computed(() => {
  return props.venta.pagos.length > 0;
});

const payment = computed(() => {
  const pago = {
    total: Math.round(props.venta.total),
    restante: Math.round(props.venta.total) - props.venta.pagos.reduce((acc, pago) => acc + pago.total, 0) | 0,
    cambio: 0,
  }

    if (form.value.cantidad > 0) {
        pago.cambio = form.value.cantidad - pago.restante;
        if (pago.cambio < 0) {
            pago.cambio = 0;
        }
    } else {
        pago.cambio = 0;
    }
    return pago;
});


const bill_sale = async () => {
    errorMessages.value = {};
    if (!validate()) {
        console.error('Validation failed:', errorMessages.value);
        return;
    }
    if (payment.value.restante <= 0) {
        console.error('No remaining balance to pay.');
        return;
    } else {
        if(form.value.cantidad > payment.value.restante){
            form.value.cantidad = payment.value.restante

        }
    
        console.log('probamdo ',props.venta);
        
        const { data, error } = await supabase
        .from('pagos')
        .insert([{
             venta_id: props.venta.id, total: form.value.cantidad, metodo: form.value.metodo, cliente_id: props.venta?.cliente_id || null , created_at: getMexicoLocalString()}])
        .select()
        .single()
        if (error) {
            console.error('Error al registrar el pago:', error);
        } else {
            props.venta.pagos.push(data);
            form.value.cantidad = 0;
            form.value.metodo = '';
            if (payment.value.restante <= 0) {
                finishSale();
            }
        }
       
  
}};

const finishSale = async () => {
    console.log('Finishing sale:', props.venta);
    const { data, error } = await supabase
        .from('ventas')
        .update({ estatus: 'cobrado', pagado: true })
        .eq('id', props.venta.id)
        .select()
        .single();
    if (error) {
        console.error('Error al finalizar la venta:', error);
    } else {
        console.log('Venta finalizada:', data);
        console.log('Vedbdhs:', data);

        emits('finished');
    }
};


onMounted(() => {
  console.log('Component mounted', props.venta);

});




</script>