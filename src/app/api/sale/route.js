import { NextResponse } from 'next/server';
import db from '@/libs/db';

// Handler para el método POST (Crear una nueva venta)
export async function POST(request) {
  try {
    const data = await request.json();
    const { totalAmount, products, table, status } = data;

    if (!products || products.length === 0) {
      return NextResponse.json(
        { message: 'La venta debe contener al menos un producto' },
        { status: 400 }
      );
    }

    // Calcular el monto total de la venta si no se pasa desde el cliente
    let calculatedTotalAmount = 0;
    const saleProducts = [];

    for (const item of products) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { message: `Producto con ID ${item.productId} no encontrado` },
          { status: 404 }
        );
      }

      // Calcular el total aquí
      calculatedTotalAmount += product.price * item.quantity;
      saleProducts.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    // Si no se pasó totalAmount, usar el calculado
    const finalTotalAmount = totalAmount || calculatedTotalAmount;

    // Crear la venta
    const sale = await db.sale.create({
      data: {
        totalAmount: finalTotalAmount,
        table: parseInt(table, 10),  
        status, // Añadir el campo de estado
        products: {
          create: saleProducts,
        },
      },
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// Handler para el método GET (Obtener todas las ventas)
export async function GET() {
  try {
    const sales = await db.sale.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(sales, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// Handler para el método DELETE (Eliminar una venta)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const saleId = parseInt(searchParams.get('id'), 10);

    if (isNaN(saleId)) {
      return NextResponse.json(
        { message: 'ID de venta no válido' },
        { status: 400 }
      );
    }

    const existingSale = await db.sale.findUnique({
      where: { id: saleId },
    });

    if (!existingSale) {
      return NextResponse.json(
        { message: 'Venta no encontrada' },
        { status: 404 }
      );
    }

    await db.sale.delete({
      where: { id: saleId },
    });

    return NextResponse.json(
      { message: 'Venta eliminada con éxito' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// Handler para el método PUT (Actualizar una venta)
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const saleId = parseInt(searchParams.get('id'), 10);
    const data = await request.json();
    const { totalAmount, products, table, status } = data;

    if (isNaN(saleId)) {
      return NextResponse.json(
        { message: 'ID de venta no válido' },
        { status: 400 }
      );
    }

    const existingSale = await db.sale.findUnique({
      where: { id: saleId },
      include: { products: true },
    });

    if (!existingSale) {
      return NextResponse.json(
        { message: 'Venta no encontrada' },
        { status: 404 }
      );
    }

    const updatedSale = await db.sale.update({
      where: { id: saleId },
      data: {
        totalAmount,
        table,  // Actualizar el campo de mesa
        status, // Actualizar el campo de estado
        products: {
          upsert: products.map(product => ({
            where: {
              saleId_productId: {
                saleId: saleId,
                productId: product.productId,
              },
            },
            update: {
              quantity: product.quantity,
            },
            create: {
              productId: product.productId,
              quantity: product.quantity,
            },
          })),
        },
      },
    });

    return NextResponse.json(
      { message: 'Venta actualizada con éxito', sale: updatedSale },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al actualizar la venta:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
