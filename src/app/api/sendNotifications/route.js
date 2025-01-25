import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import db from '@/libs/db';

const TIMEZONE = 'America/Bogota'; // Zona horaria de Colombia

export async function GET() {
  try {
    const now = new Date(); // Fecha actual del servidor

    // Convierte la fecha actual al tiempo colombiano
    const colombiaTime = utcToZonedTime(now, TIMEZONE);

    // Ajusta el inicio y final del día en hora colombiana
    const todayStart = new Date(
      colombiaTime.getFullYear(),
      colombiaTime.getMonth(),
      colombiaTime.getDate(),
      0, 0, 0
    );
    const todayEnd = new Date(
      colombiaTime.getFullYear(),
      colombiaTime.getMonth(),
      colombiaTime.getDate(),
      23, 59, 59
    );

    // Convierte los límites a UTC para almacenarlos correctamente en la base de datos
    const todayStartUTC = zonedTimeToUtc(todayStart, TIMEZONE);
    const todayEndUTC = zonedTimeToUtc(todayEnd, TIMEZONE);

    // Obtén los datos de la base de datos
    const [alerts, subscriptions] = await Promise.all([
      db.alert.findMany({
        where: {
          OR: [
            {
              alertTime: {
                gte: todayStartUTC,
                lt: todayEndUTC,
              },
            },
            {
              repeatWeekly: true,
              repeatDay: colombiaTime.getDay(),
            },
          ],
        },
      }),
      db.subscription.findMany(),
    ]);

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
