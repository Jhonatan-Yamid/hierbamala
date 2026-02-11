import { NextResponse } from 'next/server';
import db from '@/libs/db';

export async function GET(request) {
  try {
    const providers = await db.provider.findMany({
      include: {
        ingredients: true,
      },
    });
    return NextResponse.json(providers, { status: 200 });
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return NextResponse.json(
      { message: "Error al obtener proveedores", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const newProvider = await db.provider.create({
      data: {
        name: data.name,
        description: data.description,
        accountNumber: data.accountNumber,
        phone: data.phone || null, // 👈 agregar
      },
    });
    return NextResponse.json(newProvider, { status: 201 });
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    return NextResponse.json(
      { message: "Error al crear proveedor", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const id = parseInt(body.id);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { message: "El ID es requerido para actualizar un proveedor" },
        { status: 400 }
      );
    }

    const updatedProvider = await db.provider.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        accountNumber: body.accountNumber,
        phone: body.phone || null,
      },
    });

    return NextResponse.json(updatedProvider, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    return NextResponse.json(
      { message: "Error al actualizar proveedor", error: error.message },
      { status: 500 }
    );
  }
}


export async function DELETE(request) {
  try {
    const body = await request.json();

    if (!body || !body.id) {
      return NextResponse.json(
        { message: "El ID es requerido para eliminar un proveedor" },
        { status: 400 }
      );
    }

    const { id } = body;

    await db.provider.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Proveedor eliminado" }, { status: 200 });
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    return NextResponse.json(
      { message: "Error al eliminar proveedor", error: error.message },
      { status: 500 }
    );
  }
}