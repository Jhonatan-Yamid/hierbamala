// app/api/game/route.js
import { NextResponse } from 'next/server';
import db from '@/libs/db'; // Asegúrate de que esta ruta sea correcta para tu instancia de Prisma Client

export async function GET() {
  try {
    const games = await db.game.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    return NextResponse.json(games, { status: 200 });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ message: 'Failed to fetch games' }, { status: 500 });
  }
}