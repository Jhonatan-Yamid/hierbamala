// /api/products/search/route.js
import { NextResponse } from "next/server";
import db from "@/libs/db";

export async function GET() {
  try {
    const products = await db.product.findMany({
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    const productsWithStock = products
      .filter(p => p.ingredients.length === 1) // 👈 REGLA CLAVE
      .map(product => {
        const ingredientQty = product.ingredients[0].ingredient.quantity;

        return {
          id: product.id,
          stock: ingredientQty ?? 0,
        };
      });

    return NextResponse.json(productsWithStock);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
