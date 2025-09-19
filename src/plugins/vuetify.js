/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
const myowntheme = {
  dark: false,
  colors: {
    primary: '#3f51b5',
    secondary: '#b0bec5',
    accent: '#8c9eff',
    error: '#b71c1c',
    naranja: '#C14600',
    amarillo: '#FF9D23',
    gris_cafe: '#E5D0AC',
    black: '#343434',
    white: '#F3F3F3',
    background: '#F3F3F3',
    beige: '#8E8B82',
    btn: '#D84040',
  }
}

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'myowntheme',
    themes: {
      myowntheme,
  },}
})
