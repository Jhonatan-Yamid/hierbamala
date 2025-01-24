import db from '@/libs/db';

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    await db.$disconnect();
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
    await db.$connect();


    await db.$disconnect();
    const subscriptions = await db.subscription.findMany();
    await db.$connect();

    return new Response(
      JSON.stringify({
        success: true,
        alerts,
        subscriptions,
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
