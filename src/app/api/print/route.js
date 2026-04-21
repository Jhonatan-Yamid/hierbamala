import { NextResponse } from 'next/server';
import db from '@/libs/db';

export async function POST(request) {
  try {
    const body = await request.json();

    // Discriminar si viene del servidor local (getCategories) o del cliente POS
    const { action, productIds } = body;

    if (action === 'getCategories') {
      if (!productIds || !Array.isArray(productIds)) {
        return NextResponse.json(
          { message: 'IDs de productos requeridos' },
          { status: 400 }
        );
      }

      const products = await db.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, category: true },
      });

      return NextResponse.json(products, { status: 200 });
    }

    return NextResponse.json({ message: 'Acción no reconocida' }, { status: 400 });
  } catch (error) {
    console.error('Error en /api/print:', error);
    return NextResponse.json({ message: 'Error de servidor' }, { status: 500 });
  }
}