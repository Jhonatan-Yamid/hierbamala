import { NextResponse } from 'next/server';
import db from '@/libs/db'; // Asegúrate de que db esté configurado correctamente
import { nanoid } from 'nanoid'; // Usamos nanoid para generar un ID único

// Función para obtener las ventas del día
export async function GET() {
  try {
    // Obtener la fecha de hoy sin la parte de la hora
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Establece a medianoche
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // Establece al final del día

    // Consultar las ventas realizadas hoy
    const sales = await db.sale.findMany({
      where: {
        updatedAt: {
          gte: startOfDay, // Mayor o igual a la medianoche
          lte: endOfDay,   // Menor o igual al final del día
        },
      },
      include: {
        products: {
          include: {
            product: true, // Incluir los productos asociados a la venta
          },
        },
      },
    });

    // Retornar las ventas encontradas
    return NextResponse.json(sales, { status: 200 });
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    return NextResponse.json({ message: 'Error al obtener las ventas' }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const data = await request.json();

    const {
      tableNumber,
      saleStatus,
      generalObservation,
      totalAmount,
      products,
    } = data;

    if (!products || products.length === 0) {
      return NextResponse.json({ message: 'Debe seleccionar al menos un producto' }, { status: 400 });
    }

    // Crear la venta
    const newSale = await db.sale.create({
      data: {
        totalAmount,
        status: saleStatus || 'en proceso',
        table: tableNumber,
        generalObservation,
      },
    });

    // Procesar productos
    const productPromises = products.map(async (product) => {
      const saleProduct = await db.saleProduct.create({
        data: {
          id: nanoid(),
          saleId: newSale.id,
          productId: product.id,
          quantity: product.quantity,
          observation: product.observation || '',
        },
      });

      // Procesar adiciones
      const additionPromises = product.additions.map((addition) => {
        return db.saleProductAddition.create({
          data: {
            saleProductId: saleProduct.id,
            name: addition.name,
            price: addition.price,
          },
        });
      });

      await Promise.all(additionPromises);

      return saleProduct;
    });

    const updatedProducts = await Promise.all(productPromises);

    return NextResponse.json({
      ...newSale,
      products: updatedProducts,
    }, { status: 201 });

  } catch (error) {
    console.error('Error al crear la venta:', error);
    return NextResponse.json({ message: 'Error al crear la venta' }, { status: 500 });
  }
}

