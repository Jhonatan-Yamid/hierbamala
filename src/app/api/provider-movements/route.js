import { NextResponse } from "next/server";
import db from "@/libs/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const providerId = parseInt(searchParams.get("providerId"));

  const movements = await db.providerMovement.findMany({
    where: { providerId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(movements);
}

export async function POST(req) {
  const data = await req.json();

  const movement = await db.providerMovement.create({
    data: {
      providerId: data.providerId,
      type: data.type,
      amount: parseFloat(data.amount),
      description: data.description,
      imageUrl: data.imageUrl,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    },
  });

  return NextResponse.json(movement);
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id"));

  await db.providerMovement.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
