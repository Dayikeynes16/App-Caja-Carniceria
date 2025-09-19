import supabase from "@/supabase";

export const insertarProductoVenta = async (ventaId, productos) => {
  console.log("ID de venta:", ventaId);
  console.log("Productos a insertar:", productos);
  
  try {
    for (const producto of productos) {
      console.log("Producto a insertar:", producto);
      const { data, error } = await supabase
        .from("producto_ventas")
        .insert({
          venta_id: ventaId,
          producto_id: producto.producto_id,
          peso: producto.peso,
          precio: producto.precio,
          total: producto.total
        });

      if (error) {
        console.error("Error al insertar producto:", error);
        return null;
      }
    }

    return { success: true, message: "Todos los productos fueron insertados correctamente" };
  } catch (err) {
    console.error("Error inesperado al insertar productos:", err);
    return { success: false, message: "Error inesperado", error: err };
  }
};
