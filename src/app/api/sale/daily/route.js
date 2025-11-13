import { NextResponse } from 'next/server';
import db from '@/libs/db';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const daysParam = parseInt(url.searchParams.get('days') || '60', 10);

    // Fecha de inicio del rango (en UTC, para usar con CONVERT_TZ)
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysParam);

    /**
     * 💡 Lógica:
     *  - El "día operativo" comienza a las 15:00 (3 p.m.) hora Colombia (-05:00)
     *  - Las ventas entre medianoche y 5:59 a.m. pertenecen al día anterior
     * 
     * Usamos MySQL para ajustar la hora con DATE_SUB / DATE_ADD y agrupar correctamente.
     */

    const dailySales = await db.$queryRaw`
      SELECT 
        -- Calcular fecha operativa: si la hora es menor a 6 AM, se resta 1 día;
        -- si es menor a 3 PM, pertenece al mismo día; si es >= 3 PM, se considera el día actual
        DATE_FORMAT(
          DATE(
            CASE 
              WHEN HOUR(CONVERT_TZ(createdAt, '+00:00', '-05:00')) < 6 
                THEN DATE_SUB(CONVERT_TZ(createdAt, '+00:00', '-05:00'), INTERVAL 1 DAY)
              ELSE CONVERT_TZ(createdAt, '+00:00', '-05:00')
            END
          ),
          '%Y-%m-%d'
        ) AS date,
        DAYNAME(
          DATE(
            CASE 
              WHEN HOUR(CONVERT_TZ(createdAt, '+00:00', '-05:00')) < 6 
                THEN DATE_SUB(CONVERT_TZ(createdAt, '+00:00', '-05:00'), INTERVAL 1 DAY)
              ELSE CONVERT_TZ(createdAt, '+00:00', '-05:00')
            END
          )
        ) AS dayOfWeek,
        SUM(totalAmount) AS totalSales
      FROM Sale
      WHERE createdAt >= ${sinceDate}
      GROUP BY date
      ORDER BY date DESC;
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
