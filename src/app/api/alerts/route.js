import { NextResponse } from 'next/server';
import db from '@/libs/db';

// Crear una nueva alerta
export async function POST(request) {
  try {
    const { title, description, alertTime } = await request.json();

    if (!title || !description || !alertTime) {
      return NextResponse.json(
        { message: 'Todos los campos son obligatorios.' },
        { status: 400 }
      );
    }

    const alert = await db.alert.create({
      data: {
        title,
        description,
        alertTime: new Date(alertTime),
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Error al crear la alerta:', error);
    return NextResponse.json(
      { message: 'Error al crear la alerta.' },
      { status: 500 }
    );
  }
}

// Obtener todas las alertas
export async function GET() {
  try {
    const alerts = await db.alert.findMany({
      orderBy: { alertTime: 'asc' },
    });

    return NextResponse.json(alerts, { status: 200 });
  } catch (error) {
    console.error('Error al obtener las alertas:', error);
    return NextResponse.json(
      { message: 'Error al obtener las alertas.' },
      { status: 500 }
    );
  }
}

// Eliminar una alerta
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: 'Se requiere el ID de la alerta.' },
        { status: 400 }
      );
    }

    await db.alert.delete({ where: { id } });

    return NextResponse.json({ message: 'Alerta eliminada.' }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar la alerta:', error);
    return NextResponse.json(
      { message: 'Error al eliminar la alerta.' },
      { status: 500 }
    );
  }
}
