// app/api/print-ip/route.js
import { NextResponse } from 'next/server';
import db from '@/libs/db';

export async function GET() {
  try {
    const ipData = await db.utils.findUnique({
      where: {
        id: 1
      },
      select: {
        ipv4: true
      }
    });

    if (!ipData) {
      return NextResponse.json(
        { message: 'Dirección IP no configurada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ip: ipData.ipv4 }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al obtener la IP:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { ipv4 } = await request.json();

    if (!ipv4) {
      return NextResponse.json(
        { message: 'La dirección IP es requerida' },
        { status: 400 }
      );
    }

    const updatedIp = await db.utils.upsert({
      where: { id: 1 },
      update: { ipv4: ipv4 },
      create: {
        id: 1,
        ipv4: ipv4
      }
    });

    return NextResponse.json(
      { ip: updatedIp.ipv4 },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al actualizar la IP:', error);
    return NextResponse.json(
      { message: 'Error al guardar la configuración' },
      { status: 500 }
    );
  }
}