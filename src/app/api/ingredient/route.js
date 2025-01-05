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

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { message: "Datos inválidos, se esperaba un arreglo." },
        { status: 400 }
      );
    }

    // Validar que cada elemento tenga los campos necesarios
    for (const { id, quantity } of data) {
      if (typeof id !== "number" || typeof quantity !== "number") {
        return NextResponse.json(
          { message: "Todos los elementos deben tener un 'id' y 'quantity' numéricos." },
          { status: 400 }
        );
      }
    }

    // Crear la actualización en bloque utilizando la sentencia CASE
    const updates = data
      .map(({ id, quantity }) => {
        return `WHEN id = ${id} THEN ${quantity}`;
      })
      .join(" ");

    const query = `
      UPDATE \`Ingredient\`
      SET \`quantity\` = CASE
        ${updates}
      END
      WHERE id IN (${data.map(({ id }) => id).join(", ")})
    `;

    // Ejecutar la consulta
    await db.$executeRawUnsafe(query);

    return NextResponse.json(
      { message: "Ingredientes actualizados correctamente" },
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
