import { NextResponse } from 'next/server';
import db from '@/libs/db';

export async function GET(request) {
  try {
    const ingredient = await db.ingredient.findMany();
    return NextResponse.json(ingredient, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const createdIngredient = await db.ingredient.create({
      data: {
        name: data.name,
        description: data.description,
        quantity: parseInt(data.quantity),
        price: parseInt(data.price),
        typeUnity: data.typeUnity,
      },
    });

    return NextResponse.json(createdIngredient, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();

    for (const ingredient of data) {
      const { id, quantity } = ingredient;
      await db.ingredient.update({
        where: { id: parseInt(id) },
        data: { quantity: parseInt(quantity) },
      });
    }

    return NextResponse.json(
      { message: "Ingredientes actualizados correctamente" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}


export async function DELETE(request) {
  try {
    const data = await request.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json({ message: 'ID del ingredient es requerido' }, { status: 400 });
    }

    await db.ingredient.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Ingrediento eliminado' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
