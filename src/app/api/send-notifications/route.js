import webPush from '@/libs/webPushConfig';
import db from '@/libs/db';
import { DateTime } from 'luxon';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const timeZone = 'America/Bogota';

    // Calcular inicio y fin del día en la zona horaria deseada
    const now = DateTime.now().setZone(timeZone);

    const todayStart = now
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .toUTC()
      .toISO(); // Convertir a UTC
    const todayEnd = now
      .set({ hour: 24, minute: 0, second: 0, millisecond: 0 })
      .toUTC()
      .toISO(); // Convertir a UTC

    // Obtener alertas para el día actual
    const alerts = await db.alert.findMany({
      where: {
        OR: [
          {
            alertTime: {
              gte: todayStart,
              lt: todayEnd,
            },
          },
          {
            repeatWeekly: true,
            repeatDay: now.weekday === 7 ? 0 : now.weekday, // Convertir Luxon (1=Lunes, 7=Domingo) a JS (0=Domingo, 6=Sábado)
          },
        ],
      },
    });

    console.log('Fechas calculadas:', { todayStart, todayEnd });
    console.log('Alertas encontradas:', alerts);

    if (alerts.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `No hay alertas para hoy. Rango: ${todayStart} - ${todayEnd}`,
        }),
        { status: 200,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
         }
      );
    }

    // Obtener suscripciones activas
    const subscriptions = await db.subscription.findMany();

    let alertassumadas = '';
    for (const alert of alerts) {
      alertassumadas += alert.title;

      const notificationPayload = JSON.stringify({
        title: alert.title,
        body: alert.description,
      });

      for (const subscription of subscriptions) {
        try {
          await webPush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys,
            },
            notificationPayload
          );
          console.log('Notificación enviada correctamente a:', subscription.endpoint);
        } catch (error) {
          console.error('Error al enviar notificación:', {
            endpoint: subscription.endpoint,
            error: error.message,
            statusCode: error.statusCode,
          });

          // Si la suscripción no es válida, elimínala
          if (error.statusCode === 410 || error.statusCode === 404) {
            await db.subscription.delete({
              where: { endpoint: subscription.endpoint },
            });
            console.log('Suscripción eliminada por ser inválida:', subscription.endpoint);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notificaciones enviadas. Rango: ${todayStart} - ${todayEnd}. Títulos: ${alertassumadas}`,
      }),
      { status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
       }
    );
  } catch (error) {
    console.error('Error en el proceso de notificación:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
       }
    );
  }
}
