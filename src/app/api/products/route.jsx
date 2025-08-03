import { NextResponse } from "next/server";
import db from "@/libs/db";

export async function GET(request) {
  const id = request.nextUrl.searchParams.get("id");
  try {
    if (id) {
      const product = await db.product.findUnique({
        where: { id: parseInt(id) },
      });
      return NextResponse.json(product);
    }
    const products = await db.product.findMany();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const created = await db.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price), // <- aquí aseguras el tipo
        category: data.category,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const updated = await db.product.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price), // <- aquí aseguras el tipo
        category: data.category,
      },
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await db.product.delete({ where: { id: parseInt(id) } });
    return NextResponse.json(
      { message: "Producto eliminado." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
