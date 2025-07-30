import { NextResponse } from 'next/server';
import db from '@/libs/db';

export async function GET(request) {
  try {
    const ingredients = await db.ingredient.findMany();
    return NextResponse.json(ingredients, { status: 200 });
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
        quantity: data.quantity === "insuficiente" ? null : parseFloat(data.quantity),
        price: parseFloat(data.price),
        typeUnity: data.typeUnity,
      },
    });

    return NextResponse.json(createdIngredient, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();

    // 🔍 Si viene el parámetro `actualizar`, es una edición individual
    if (data.actualizar === true) {
      const {
        id,
        name,
        description,
        quantity,
        price,
        typeUnity,
      } = data;

      if (!id || typeof id !== "number") {
        return NextResponse.json(
          { message: "ID inválido para actualización." },
          { status: 400 }
        );
      }

      const updatedIngredient = await db.ingredient.update({
        where: { id },
        data: {
          name,
          description,
          quantity: quantity === "insuficiente" ? null : parseFloat(quantity),
          price: parseFloat(price),
          typeUnity,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(updatedIngredient, { status: 200 });
    }

    // 🧪 Si NO viene `actualizar`, se asume que es un lote
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { message: "Datos inválidos, se esperaba un arreglo." },
        { status: 400 }
      );
    }

    for (const { id, quantity } of data) {
      if (
        typeof id !== "number" ||
        (typeof quantity !== "string" && typeof quantity !== "number" && quantity !== null)
      ) {
        return NextResponse.json(
          { message: "Todos los elementos deben tener un 'id' y 'quantity' válidos." },
          { status: 400 }
        );
      }
    }

    await Promise.all(
      data.map(async ({ id, quantity }) => {
        await db.ingredient.update({
          where: { id },
          data: {
            quantity: quantity === "insuficiente" ? null : parseFloat(quantity),
            updatedAt: new Date(),
          },
        });
      })
    );

    return NextResponse.json(
      { message: "Ingredientes actualizados correctamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error actualizando ingredientes:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}


export async function DELETE(request) {
  try {
    const data = await request.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json({ message: "ID del ingrediente es requerido." }, { status: 400 });
    }

    await db.ingredient.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Ingrediente eliminado." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
