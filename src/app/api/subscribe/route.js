import db from '@/libs/db';

export async function POST(request) {
  try {
    const { endpoint, keys } = await request.json();

    // Guardar suscripción en la base de datos
    const subscription = await db.subscription.create({
      data: {
        endpoint,
        keys,
      },
    });

    return new Response(JSON.stringify(subscription), { status: 201 });
  } catch (error) {
    console.error('Error al guardar la suscripción:', error);
    return new Response('Error al guardar la suscripción', { status: 500 });
  }
}
