import webPush from '@/libs/webPushConfig';
import db from '@/libs/db';

export async function GET() {
  try {
    const now = new Date();
    const timeZone = 'America/Bogota';

    // Calcular inicio y fin del día en la zona horaria deseada
    const todayStart = new Date(
      new Date(now.toLocaleString('en-US', { timeZone })).setHours(0, 0, 0, 0)
    ).toISOString(); // Convertir a UTC
    const todayEnd = new Date(
      new Date(now.toLocaleString('en-US', { timeZone })).setHours(24, 0, 0, 0)
    ).toISOString(); // Convertir a UTC

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
            repeatDay: now.getDay(), // Verificar si es el día correcto de la semana
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
        { status: 200 }
      );
    }

    // Obtener suscripciones activas
    const subscriptions = await db.subscription.findMany();

    let alertassumadas = '';
    alerts.forEach(async (alert) => {
      alertassumadas += alert.title;
      const notificationPayload = JSON.stringify({
        title: alert.title,
        body: alert.description,
      });

      subscriptions.forEach(async (subscription) => {
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
      });
      
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notificaciones enviadas. Rango: ${todayStart} - ${todayEnd} otro ${alertassumadas}`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en el proceso de notificación:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
