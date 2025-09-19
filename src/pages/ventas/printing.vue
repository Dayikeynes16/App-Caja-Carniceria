<template>
  <v-card>
    <v-card-title>
      <p class="text-h5 text-center">
        ¿Desea imprimir su ticket?
      </p>
    </v-card-title>
    <v-card-text>
      <div class="ticket-container">
        <div class="ticket" ref="ticketRef">
          <div class="ticket-header">
            <h2>El Puebla</h2>
            <p>Carnicería y Abastos</p>
            <p>{{ formatDate(new Date()) }}</p>
            <hr>
          </div>
    
          <div class="ticket-body">
            <table>
              <thead>
                <tr>
                  <th style="text-align:left">Producto</th>
                  <th style="text-align:right">Kg</th>
                  <th style="text-align:right">P. Unit</th>
                  <th style="text-align:right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="producto in venta.producto_ventas" :key="producto.id">
                  <td>{{ producto.productos.nombre }}</td>
                  <td style="text-align:right">{{ producto.peso.toFixed(2) }}</td>
                  <td style="text-align:right">${{ producto.precio.toFixed(2) }}</td>
                  <td style="text-align:right">${{ producto.total.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
            <hr>
            <div class="ticket-total">
              <strong>Total: ${{ venta.total.toFixed(2) }}</strong>
            </div>
          </div>
    
          <div class="ticket-footer">
            <p>¡Gracias por su compra!</p>
            <p>Venta #{{ venta.id }}</p>
          </div>
        </div>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-row>
        <v-col cols="6">
          <v-btn block variant="flat" @click="$emit('close')" color="red">Cerrar</v-btn>

        </v-col>
        <v-col cols="6">
          <v-btn variant="flat" block @click="printTicket" color="green">Imprimir</v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  venta: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'finished'])

const ticketRef = ref(null)

const formatDate = (date) => {
  return new Date(date).toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const printTicket = () => {
  const printContents = ticketRef.value.innerHTML
  const printWindow = window.open('', '', 'width=800,height=1000')

  printWindow.document.write(`
    <html>
      <head>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          @media print {
            body {
              margin: 0;
              font-family: monospace;
              width: 80mm;
              font-size: 11px;
              padding: 0;
            }
          }
          body {
            font-family: monospace;
            width: 80mm;
            margin: 0;
            padding: 0;
            font-size: 11px;
          }
          .ticket {
            width: 100%;
            padding: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 2px 0;
            font-size: 11px;
          }
          hr {
            border: none;
            border-top: 1px dashed #000;
            margin: 5px 0;
          }
          .ticket-header,
          .ticket-footer {
            text-align: center;
          }
          .ticket-total {
            text-align: right;
            font-weight: bold;
            margin-top: 5px;
          }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        ${printContents}
      </body>
    </html>
  `)

  printWindow.document.close()
}
</script>

<style scoped>
.ticket-container {
  max-width: 300px;
  margin: 0 auto;
}

.ticket {
  font-family: monospace;
  border: 1px dashed #000;
  font-size: 11px;
  padding: 10px;
}

.ticket-header,
.ticket-footer {
  text-align: center;
}

.print-actions {
  margin-top: 10px;
  text-align: center;
}
</style>