<template>
  <v-sparkline :line-width="3" :fill="true" :color="blue" :model-value="values">

  </v-sparkline>


</template>
<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { defineProps } from 'vue';

const props = defineProps ({
  values: {
    required: true,
    type: Array
  }
})

const chart = ref([])

onMounted(() =>{
  console.log('esta es la prop:' , props.values);
  
  
  props.values.forEach(element => {
    console.log(element);
    
  });
  console.log(props.values);
  

})



</script>