import { NextResponse } from 'next/server';
import db from '@/libs/db';
 
// Crear una nueva alerta
export async function POST(request) {
  console.log('--- Verificando variables de entorno ---');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '¡Variable de base de datos cargada!' : '¡DATABASE_URL NO CARGADA!');
  console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '¡Secreto de NextAuth cargado!' : '¡NEXTAUTH_SECRET NO CARGADA!');
  // Puedes añadir más variables que quieras verificar
  console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY:', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? '¡Clave pública VAPID cargada!' : '¡NEXT_PUBLIC_VAPID_PUBLIC_KEY NO CARGADA!');
  console.log('--- Fin de la verificación ---');

  try {
    const { title, description, alertTime, repeatWeekly, repeatDay } = await request.json();

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
        repeatWeekly: repeatWeekly || false,
        repeatDay: repeatWeekly ?  parseInt(repeatDay) : null,
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
