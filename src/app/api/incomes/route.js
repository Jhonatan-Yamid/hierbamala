import { NextResponse } from "next/server";
import db from "@/libs/db";

export async function POST(request) {
  try {
    const data = await request.json();

    const createdProduct = await db.ingredient.create({
      data: {
        name: data.name,
        description: data.description,
        quantity: parseInt(data.quantity),
        price: parseInt(data.price),
        typeUnity: data.typeUnity,
      },
    });

    return NextResponse.json(createdProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
