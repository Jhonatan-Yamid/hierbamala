import { DateTime } from 'luxon';
import db from '@/libs/db';

export async function GET(request) {
  try {
    // Zona horaria de Colombia
    const TIMEZONE = 'America/Bogota';

    // Fecha actual en la zona horaria de Colombia
    const now = DateTime.now().setZone(TIMEZONE);

    // Inicio y fin del día en la zona horaria de Colombia
    const todayStart = now.startOf('day').toISO(); // Inicio del día en ISO string
    const todayEnd = now.endOf('day').toISO(); // Fin del día en ISO string

    // Consulta la base de datos
    const [alerts, subscriptions] = await Promise.all([
      db.alert.findMany({
        where: {
          OR: [
            {
              alertTime: {
                gte: todayStart, // Inicio del día en hora colombiana
                lt: todayEnd, // Fin del día en hora colombiana
              },
            },
            {
              repeatWeekly: true,
              repeatDay: now.weekday, // Día de la semana (1 = lunes, 7 = domingo)
            },
          ],
        },
      }),
      db.subscription.findMany(),
    ]);

    // Respuesta con los datos
    return new Response(
      JSON.stringify({
        success: true,
        alerts,
        subscriptions,
      }),
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('Error obteniendo datos:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
