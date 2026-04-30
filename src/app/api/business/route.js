import { NextResponse } from 'next/server';
import db from '@/libs/db';

export async function GET() {
  try {
    // Buscamos el primer (y normalmente único) registro de configuración del negocio
    const business = await db.business.findFirst();

    if (!business) {
      return NextResponse.json({ message: 'No business configuration found' }, { status: 404 });
    }

    return NextResponse.json(business, { status: 200 });
  } catch (error) {
    console.error('Error fetching business config:', error);
    return NextResponse.json({ message: 'Failed to fetch business config' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Esto permite crear o actualizar la configuración
    const business = await db.business.upsert({
      where: { id: data.id || 'default' }, // O usa un ID específico si manejas varios
      update: data,
      create: data,
    });

    return NextResponse.json(business, { status: 200 });
  } catch (error) {
    console.error('Error saving business config:', error);
    return NextResponse.json({ message: 'Failed to save business config' }, { status: 500 });
  }
}