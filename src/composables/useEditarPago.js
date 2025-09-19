import { ref } from 'vue'
import  supabase  from '../supabase' // ajusta la ruta si es necesario

export function useEditarPago() {
  const cargando = ref(false)
  const error = ref(null)

  async function editarPago(pago) {
    cargando.value = true
    error.value = null

    try {
      const pagoId = pago.id

      // 1. Actualizar el pago en Supabase
      const { error: updateError } = await supabase
        .from('pagos')
        .update({
          total: pago.total,
          metodo: pago.metodo,
          comentario: pago.comentario,
          anulado: pago.anulado,
          
        })
        .eq('id', pagoId)

      if (updateError) throw updateError

      // 2. Si el pago tiene una venta asociada
      if (pago.venta_id) {
        const ventaId = pago.venta_id

        // 3. Obtener todos los pagos de esa venta
        const { data: pagosVenta, error: pagosError } = await supabase
          .from('pagos')
          .select('id, total')
          .eq('venta_id', ventaId)
          .eq('anulado', false)

        if (pagosError) throw pagosError

        // 4. Calcular la suma de todos los pagos de la venta
        const sumaPagos = pagosVenta.reduce((acum, p) => {
          if (p.id === pagoId) return acum + pago.total // si es el actual, usa el nuevo monto
          return acum + p.total
        }, 0)

        // 5. Traer la venta
        const { data: venta, error: ventaError } = await supabase
          .from('ventas')
          .select('id, total, estatus, pagado')
          .eq('id', ventaId)
          .single()

        if (ventaError) throw ventaError

        // 6. Verificar si está pagada o no
        const pagadoNuevo = sumaPagos >= venta.total
        const estatusNuevo = pagadoNuevo ? 'cobrado' : 'pendiente'

        // 7. Si hay cambios, actualiza la venta
        if (venta.pagado !== pagadoNuevo || venta.estatus !== estatusNuevo) {
          const { error: ventaUpdateError } = await supabase
            .from('ventas')
            .update({
              pagado: pagadoNuevo,
              estatus: estatusNuevo,
            })
            .eq('id', ventaId)

          if (ventaUpdateError) throw ventaUpdateError
        }
      }

      return { ok: true }
    } catch (err) {
      error.value = err
      console.error('Error al editar el pago:', err)
      return { ok: false, error: err }
    } finally {
      cargando.value = false
    }
  }

  return {
    editarPago,
    cargando,
    error,
  }
}
