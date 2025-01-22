import webPush from '@/libs/webPushConfig';
import db from '@/libs/db';

export async function GET() {
  try {
    const now = new Date();
    const timeZone = 'America/Bogota';

    // Convertir a la hora de inicio y fin del día en la zona horaria deseada
    const todayStart = new Date(
      new Date(now.toLocaleString('en-US', { timeZone })).setHours(0, 0, 0, 0)
    );
    const todayEnd = new Date(
      new Date(now.toLocaleString('en-US', { timeZone })).setHours(24, 0, 0, 0)
    );

    // Convertir fechas al formato colombiano
    const nowFormatted = now.toLocaleString('es-CO', { timeZone });
    const todayStartFormatted = todayStart.toLocaleString('es-CO', { timeZone });
    const todayEndFormatted = todayEnd.toLocaleString('es-CO', { timeZone });
    let alertassumadas = "";

    // Obtener alertas que coincidan con el día actual y si son semanales, verificar que coincidan con el día de la semana
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
            repeatDay: now.getDay(), // Verificar si es el día de la semana correcto
          },
        ],
      },
    });

    if (alerts.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `No hay alertas para hoy. now: ${nowFormatted}, todayStart: ${todayStartFormatted}, todayEnd: ${todayEndFormatted}`,
        }),
        { status: 200 }
      );
    }

    // Obtener suscripciones activas
    const subscriptions = await db.subscription.findMany();

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
        } catch (error) {
          console.error('Error al enviar notificación:', error);

          // Si la suscripción no es válida, elimínala
          if (error.statusCode === 410 || error.statusCode === 404) {
            await db.subscription.delete({
              where: { endpoint: subscription.endpoint },
            });
          }
        }
      });
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notificaciones enviadas. now: ${nowFormatted}, todayStart: ${todayStartFormatted}, todayEnd: ${todayEndFormatted} otro ${alertassumadas}`,
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
