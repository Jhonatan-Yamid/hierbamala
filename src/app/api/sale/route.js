import { NextResponse } from 'next/server';
import db from '@/libs/db';

// Handler para el método POST (Crear una nueva venta)
export async function POST(request) {
  try {
    const data = await request.json();
    const { products } = data;

    if (!products || products.length === 0) {
      return NextResponse.json(
        { message: 'La venta debe contener al menos un producto' },
        { status: 400 }
      );
    }

    // Calcular el monto total de la venta
    let totalAmount = 0;
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

      totalAmount += product.price * item.quantity;
      saleProducts.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    // Crear la venta
    const sale = await db.sale.create({
      data: {
        totalAmount,
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
    // Obtener todas las ventas
    const sales = await db.sale.findMany({
      include: {
        products: true, // Incluye los productos relacionados con cada venta
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
