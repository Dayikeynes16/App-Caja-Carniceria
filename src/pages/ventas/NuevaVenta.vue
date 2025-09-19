<template>
    <v-container>
        <v-card variant="outlined">
            <v-card-title>
                <v-text-field label="Balanza" v-model="balanza" outlined>

                </v-text-field>
                <v-text-field>

                </v-text-field>
            </v-card-title>

        </v-card>
    </v-container>

</template>
<script setup>
const { ref, onMounted } = require('vue')
import { useRouter } from 'vue-router'
import supabase from '@/supabase.js'

const balanza = ref('')

</script>