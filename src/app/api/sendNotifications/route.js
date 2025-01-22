import webPush from '@/libs/webPushConfig';
import db from '@/libs/db';

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

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
            repeatDay: now.getDay(),
          },
        ],
      },
    });

    if (alerts.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'No hay alertas para hoy', alerts }), { status: 200 });
    }

    const subscriptions = await db.subscription.findMany();
    const results = [];

    for (const alert of alerts) {
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
          results.push({ endpoint: subscription.endpoint, status: 'success' });
        } catch (error) {
          console.error('Error al enviar notificación:', error);
          results.push({
            endpoint: subscription.endpoint,
            status: 'error',
            message: error.message,
            statusCode: error.statusCode,
          });

          // Eliminar suscripción inválida
          if (error.statusCode === 410 || error.statusCode === 404) {
            await db.subscription.delete({
              where: { endpoint: subscription.endpoint },
            });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notificaciones procesadas',
        results,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error general:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
