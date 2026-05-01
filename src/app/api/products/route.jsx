import { NextResponse } from "next/server";
import db from "@/libs/db";

// Obtener todos los productos o uno con ingredientes
export async function GET(request) {
  const id = request.nextUrl.searchParams.get("id");

  try {
    if (id) {
      const product = await db.product.findUnique({
        where: { id: parseInt(id) },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });
      return NextResponse.json(product);
    }

    const products = await db.product.findMany({
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Crear un nuevo producto con ingredientes
export async function POST(request) {
  try {
    const data = await request.json();

    const { name, description, price, category, ingredients, quantity, typeUnity } = data;

    const created = await db.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        quantity: quantity ? parseFloat(quantity) : null, // <-- Nuevo
        typeUnity,
        category,
        ingredients: {
          create: ingredients.map((item) => ({
            ingredient: {
              connect: { id: item.ingredientId },
            },
            quantity: item.quantity,
          })),
        },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();

    // SI ES UNA ACTUALIZACIÓN MASIVA DE INVENTARIO (Array)
    if (Array.isArray(data)) {
      const updates = data.map((item) =>
        db.product.update({
          where: { id: parseInt(item.id) },
          data: { 
            quantity: item.quantity === "Insuficiente" ? null : parseFloat(item.quantity) 
          },
        })
      );
      await Promise.all(updates);
      return NextResponse.json({ message: "Inventario actualizado" }, { status: 200 });
    }

    // SI ES UNA ACTUALIZACIÓN DE UN SOLO PRODUCTO (Objeto original)
    const { id, name, description, price, category, ingredients, quantity, typeUnity } = data;

    const updated = await db.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        quantity: quantity ? parseFloat(quantity) : null,
        typeUnity,
        category,
        ingredients: ingredients ? {
          deleteMany: {},
          create: ingredients.map((item) => ({
            ingredient: { connect: { id: item.ingredientId } },
            quantity: item.quantity,
          })),
        } : undefined,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Eliminar producto
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    // Elimina relaciones antes de eliminar producto (por integridad referencial)
    await db.product.update({
      where: { id: parseInt(id) },
      data: {
        ingredients: {
          deleteMany: {},
        },
      },
    });

    await db.product.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ message: "Producto eliminado." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
