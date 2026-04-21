import { NextResponse } from 'next/server';
import db from '@/libs/db';

export async function POST(request) {
  try {
    const { publicUrl } = await request.json();

    if (!publicUrl) {
      return NextResponse.json({ message: 'URL requerida' }, { status: 400 });
    }

    const updateResult = await db.utils.upsert({
      where: { id: 1 },
      update: { ipv4: publicUrl, created_at: new Date() },
      create: { id: 1, ipv4: publicUrl, created_at: new Date() },
    });

    return NextResponse.json({ message: 'URL actualizada', data: updateResult }, { status: 200 });
  } catch (error) {
    console.error('Error en update-printer-ip:', error);
    return NextResponse.json({ message: 'Error al actualizar IP' }, { status: 500 });
  }
}