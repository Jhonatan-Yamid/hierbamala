import { NextResponse } from 'next/server';
import db from '@/libs/db'; // Asegúrate de importar tu cliente Prisma
import { nanoid } from 'nanoid'; // Usamos nanoid para generar un ID único

export async function POST(request) {
  try {
    // Obtener los datos del formulario enviado
    const data = await request.json();

    const {
      tableNumber,
      saleStatus,
      generalObservation,
      totalAmount,
      products,
    } = data;

    // Validar que los productos sean proporcionados
    if (!products || products.length === 0) {
      return NextResponse.json({ message: 'Debe seleccionar al menos un producto' }, { status: 400 });
    }

    // Crear una nueva venta
    const newSale = await db.sale.create({
      data: {
        totalAmount,
        status: saleStatus || 'en proceso',
        table: tableNumber,
        generalObservation,
      },
    });

    // Crear o insertar productos con observaciones
    const productPromises = products.map(async (product) => {
      // Generar un ID único para cada combinación de saleId, productId, y observation
      const uniqueSaleProductId = nanoid();

      // Crear un nuevo registro para el producto y la observación
      return db.saleProduct.create({
        data: {
          id: uniqueSaleProductId, // Usamos el ID único generado
          saleId: newSale.id, // ID de la venta
          productId: product.id, // ID del producto
          quantity: product.quantity, // Cantidad del producto
          observation: product.observation || '', // Observación
        },
      });
    });

    // Esperamos todas las promesas de productos
    const updatedProducts = await Promise.all(productPromises);

    // Asignamos los productos actualizados a la venta
    newSale.products = updatedProducts;

    // Respondemos con la venta creada y los productos actualizados
    return NextResponse.json(newSale, { status: 201 });
  } catch (error) {
    console.error('Error al crear la venta:', error);
    return NextResponse.json({ message: 'Error al crear la venta' }, { status: 500 });
  }
}
