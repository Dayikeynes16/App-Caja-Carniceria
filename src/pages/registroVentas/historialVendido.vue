<template>
       <v-container>
            <v-row>
                <v-card width="100%" height="100%">
                    <v-card-text >
                        <v-list>
                            <v-list-item v-for="i in history.historial" :title="i.fecha">
                                <v-row>
                                    <v-col cols="4" align="left">
                                        {{ formatCurrency(i.total) }} 
                                    </v-col>
                                    <v-col cols="8" class="" align="right">
                                        <v-icon @click="detailed_day(i)" color="green" class="cursor-pointer" icon="mdi-calendar-search-outline">
                                        </v-icon>
                                    </v-col>
                                </v-row>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-row>
       </v-container>
</template>
<script setup>
import api from '@/api';
import { onMounted, ref } from 'vue';
import formatCurrency from '@/composables/formatCurrency';

const history = ref({})

const emit = defineEmits(['updateUser'])

const getRecords  = async () => {
    const response = await api.get('/cortes/historial');
    console.log(response);
    history.value = response.data   
}
const detailed_day = (i) => {
    i.historial = history.value
    emit('updateUser', i)
}

onMounted(() => {
    getRecords()
})

</script>