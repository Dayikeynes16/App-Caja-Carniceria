// clienteFinanzas.js

function calcularTotalVentas(cliente) {
  return cliente.ventas
    .filter(v => v.estatus !== 'cancelado')
    .reduce((total, venta) => total + venta.total, 0);
}

function calcularTotalPagado(cliente) {
  return cliente.ventas
    .filter(v => v.estatus !== 'cancelado')
    .reduce((total, venta) => {
      const sumaPagos = venta.pagos?.reduce((suma, pago) => suma + Math.floor(pago.monto), 0) || 0;
      return total + sumaPagos;
    }, 0);
}

function calcularSaldoPendiente(cliente) {
  return cliente.ventas
    .filter(venta => venta.estatus !== 'cancelado')
    .reduce((saldo, venta) => {
      const pagos = venta.pagos?.reduce((sum, p) => sum + Math.floor(p.total), 0) || 0;
      console.log(`Venta: ${venta.id}, Total: ${venta.total}, Pagos: ${pagos}, Saldo: ${venta.total - pagos}`);
      return saldo + (Math.floor(venta.total) - pagos);
      
    }, 0);
}

function ventasUltimoMes(cliente) {
  const hoy = new Date();
  const haceUnMes = new Date();
  haceUnMes.setMonth(hoy.getMonth() - 1);

  return cliente.ventas
    .filter(v => v.estatus !== 'cancelado')
    .filter(v => {
      const fecha = new Date(v.created_at);
      return fecha >= haceUnMes && fecha <= hoy;
    });
}

function totalVentasUltimoMes(cliente) {
  return ventasUltimoMes(cliente).reduce((sum, venta) => sum + venta.total, 0);
}

function historialPagos(cliente) {
  return cliente.ventas
    .filter(v => v.estatus !== 'cancelado')
    .flatMap(venta => 
      (venta.pagos || []).map(pago => ({
        ...pago,
        venta_id: venta.id
      }))
    )
    .sort((a, b) => new Date(b.fecha || b.created_at) - new Date(a.fecha || a.created_at));
}

function resumenFinanzas(cliente) {
  const ventasValidas = cliente.ventas.filter(v => v.estatus !== 'cancelado');

  return {
    totalVentas: calcularTotalVentas(cliente),
    totalPagado: calcularTotalPagado(cliente),
    saldoPendiente: calcularSaldoPendiente(cliente),
    totalUltimoMes: totalVentasUltimoMes(cliente),
    cantidadVentas: ventasValidas.length,
    ventasCompletadas: ventasValidas.filter(v => v.pagado).length,
    ventasPendientes: ventasValidas.filter(v => !v.pagado).length,
    historialPagos: historialPagos(cliente),
    ultimaCompra: ventasValidas.reduce((ultima, actual) => {
      return new Date(actual.created_at) > new Date(ultima.created_at || 0) ? actual : ultima;
    }, {})
  };
}

export default resumenFinanzas;
