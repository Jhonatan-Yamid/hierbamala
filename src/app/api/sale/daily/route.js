import { NextResponse } from 'next/server';
import db from '@/libs/db';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const daysParam = parseInt(url.searchParams.get('days') || '60', 10);

    // Calcular fecha límite
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysParam);

    // ✅ Consulta ajustada a hora Colombia (UTC-5)
    const dailySales = await db.$queryRaw`
      SELECT 
        DATE_FORMAT(CONVERT_TZ(createdAt, '+00:00', '-05:00'), '%Y-%m-%d') AS date,
        DAYNAME(CONVERT_TZ(createdAt, '+00:00', '-05:00')) AS dayOfWeek,
        SUM(totalAmount) AS totalSales
      FROM Sale
      WHERE createdAt >= ${sinceDate}
      GROUP BY DATE_FORMAT(CONVERT_TZ(createdAt, '+00:00', '-05:00'), '%Y-%m-%d')
      ORDER BY DATE_FORMAT(CONVERT_TZ(createdAt, '+00:00', '-05:00'), '%Y-%m-%d') DESC;
    `;

    return NextResponse.json(dailySales, { status: 200 });
  } catch (error) {
    console.error('Error al obtener ventas diarias:', error);
    return NextResponse.json(
      { message: 'Error al obtener ventas diarias', error: error.message },
      { status: 500 }
    );
  }
}
