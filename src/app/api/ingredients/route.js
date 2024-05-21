import { NextResponse } from "next/server";
import db from "@/libs/db";

export async function GET(request) {
  try {
    const ingredient = await db.ingredient.findMany();
    return NextResponse.json(ingredient, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
