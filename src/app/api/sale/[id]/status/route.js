// app/api/sale/[id]/status/route.js
import { NextResponse } from 'next/server';
import db from '@/libs/db'; // Asegúrate de que esta ruta a tu archivo db.js sea correcta

// Manejador para la petición PUT (actualizar el estado de la venta)
export async function PUT(request, { params }) {
  try {
    const { id } = params; // Obtiene la ID de la venta de los parámetros de la URL (ej: /api/sale/123/status)
    const { status } = await request.json(); // Obtiene el nuevo estado del cuerpo de la petición

    // Validaciones básicas
    if (!id || !status) {
      return NextResponse.json({ message: 'ID de venta o estado faltante.' }, { status: 400 });
    }

    const saleIdInt = parseInt(id); // Convierte la ID a un número entero
    if (isNaN(saleIdInt)) {
      return NextResponse.json({ message: 'ID de venta inválido.' }, { status: 400 });
    }

    // Opcional: Validar que el estado sea uno de los valores permitidos
    const allowedStatuses = ["en proceso", "en mesa", "pagada"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ message: 'Estado proporcionado no válido.' }, { status: 400 });
    }

    // Actualiza solo el campo 'status' de la venta
    const updatedSale = await db.sale.update({
      where: {
        id: saleIdInt,
      },
      data: {
        status: status,
        updatedAt: new Date(), // Opcional: actualiza la fecha de modificación
      },
    });

    return NextResponse.json(updatedSale, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar el estado de la venta:", error);
    return NextResponse.json(
      { message: 'Error interno del servidor al actualizar el estado de la venta.', error: error.message },
      { status: 500 }
    );
  }
}

// Opcional: Si prefieres usar PATCH para actualizaciones parciales, puedes añadirlo.
// export async function PATCH(request, { params }) {
//     return PUT(request, { params }); // Simplemente reutiliza la lógica de PUT
// }

// Manejador para métodos no permitidos
export async function GET(request) {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}

export async function POST(request) {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}

export async function DELETE(request) {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}