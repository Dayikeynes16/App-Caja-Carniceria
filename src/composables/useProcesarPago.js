// composables/useProcesarPago.js
import supabase from '@/supabase'
import { getMexicoLocalString } from './localtime'

export default async function procesarPago({ clienteId, monto, metodo, referencia = null }) {
  try {
    if (!clienteId || !monto || monto <= 0 || !metodo) {
      throw new Error('Datos inválidos: clienteId, monto y método de pago son obligatorios.')
    }

    // 1. Buscar ventas activas (no canceladas, no totalmente pagadas)
    const { data: ventas, error } = await supabase
      .from('ventas')
      .select(`*, pagos(*)`)
      .eq('cliente_id', clienteId)
      .not('estatus', 'in', '("cancelado", "cobrado")')
      .order('created_at', { ascending: true }) // más antiguas primero

    if (error) throw error

    let restante = monto
    const detallesPagos = []
    const ventasActualizadas = []

    for (const venta of ventas) {
      const totalPagado = venta.pagos?.reduce((sum, pago) => sum + (pago.total || 0), 0)
      const saldoPendiente = venta.total - totalPagado

      if (saldoPendiente <= 0) continue // ya está completamente pagada

      const pagoAplicado = Math.min(restante, saldoPendiente)

      // 2. Insertar el nuevo pago
      console.log(getMexicoLocalString());
      
      
      const { data: nuevoPago, error: errorPago } = await supabase
        .from('pagos')
        .insert([{
          created_at: getMexicoLocalString(),
          cliente_id: clienteId,
          venta_id: venta.id,
          total: pagoAplicado,
          metodo,
       
         
        }])
        .select()
        .single()

      if (errorPago) throw errorPago

      // 3. Si ya se cubrió la venta, actualizar estatus
      if (pagoAplicado >= saldoPendiente) {
        const { error: errorUpdate } = await supabase
          .from('ventas')
          .update({ estatus: 'cobrado' })
          .eq('id', venta.id)

        if (errorUpdate) {
          console.warn(`No se pudo actualizar la venta ${venta.id} a "cobrado"`, errorUpdate)
        } else {
          ventasActualizadas.push(venta.id)
        }
      }

      detallesPagos.push({
        ventaId: venta.id,
        pagoId: nuevoPago.id,
        monto: pagoAplicado
      })

      restante -= pagoAplicado
      if (restante <= 0) break
    }

    return {
      ok: true,
      totalProcesado: monto - restante,
      restante,
      detallesPagos,
      ventasActualizadas
    }

  } catch (err) {
    console.error('[useProcesarPago] Error al procesar pago:', err)
    return {
      ok: false,
      error: err.message || 'Ocurrió un error desconocido al procesar el pago.'
    }
  }
}
