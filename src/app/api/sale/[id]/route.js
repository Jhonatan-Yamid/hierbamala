import { NextResponse } from 'next/server';
import db from '@/libs/db'; // Asegúrate de que db esté configurado correctamente

export async function GET(request, { params }) {
  try {
     const id = parseInt(params.id);
      // Validar que sea un número válido
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID de venta inválido" },
        { status: 400 }
      );
    }
    const sale = await db.sale.findUnique({
      where: { id: id }, // Usar el número convertido
      include: {
        products: {
          include: {
            additions: true,
            product: true
          }
        }
      }
    });

    if (!sale) {
      return NextResponse.json({ message: 'Venta no encontrada' }, { status: 404 });
    }

    // Formatear la respuesta para coincidir con la estructura que espera el front
    const formattedSale = {
      ...sale,
      tableNumber: sale.table,
      saleStatus: sale.status,
      generalObservation: sale.generalObservation,
      products: sale.products.map(sp => ({
        id: sp.product.id,
        quantity: sp.quantity,
        observation: sp.observation,
        additions: sp.additions,
        name: sp.product.name,
        price: sp.product.price
      }))
    };

    return NextResponse.json(formattedSale, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo venta:', error);
    return NextResponse.json({ message: 'Error obteniendo venta' }, { status: 500 });
  }
}

// app/api/sale/[id]/route.js
export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    
    // Eliminar la venta existente y sus relaciones
    await db.sale.delete({
      where: { id: params.id },
      include: {
        products: {
          include: {
            additions: true
          }
        }
      }
    });

    // Volver a crear con los nuevos datos (o implementar actualización)
    const newSale = await db.sale.create({
      data: {
        // ... mismos campos que en POST ...
      }
    });

    return NextResponse.json(newSale);
  } catch (error) {
    return NextResponse.json({ message: 'Error actualizando venta' }, { status: 500 });
  }
}