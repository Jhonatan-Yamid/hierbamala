import { NextResponse } from 'next/server';
import db from '@/libs/db';

export async function GET(request) {
  try {
    // Obtener el término de búsqueda de los parámetros de la URL
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('search') || '';

    // Buscar productos que contengan el término de búsqueda en su nombre
    const products = await db.product.findMany({
      where: {
        name: {
          contains: searchQuery, // Búsqueda por nombre del producto
        },
      },
      select: {
        id: true,
        name: true,
        price: true,  // Solo devolver id, nombre y precio
      },
    });

    return NextResponse.json(products, { status: 200 });  // Devolver los productos encontrados
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}



export async function POST(request) {
  try {
    const data = await request.json();

    const createdProduct = await db.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseInt(data.price),
        ingredients: { // Relacionar los ingredientes seleccionados con el producto creado
          create: data.selectedIngredients.map(id => ({
            quantity: 1, // Aquí puedes ajustar la cantidad según tu lógica
            ingredient: { connect: { id: parseInt(id) } }
          }))
        }
      },
      
    });

    return NextResponse.json(createdProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, name, description, price, selectedIngredients } = data;

    if (!id) {
      return NextResponse.json({ message: 'ID del producto es requerido' }, { status: 400 });
    }

    // Paso 1: Actualiza el producto sin incluir los ingredientes
    const updatedProduct = await db.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: parseFloat(price), // Asegúrate de usar parseFloat para el precio si es un campo Float en tu modelo de datos
      }
    });

    // Paso 2: Actualiza las relaciones de los ingredientes con el producto
    await db.productIngredient.deleteMany({
      where: { productId: parseInt(id) } // Borra todas las relaciones existentes del producto con los ingredientes
    });

    // Crea las nuevas relaciones con los ingredientes seleccionados
    await Promise.all(
      selectedIngredients.map(async (ingredientId) => {
        await db.productIngredient.create({
          data: {
            productId: parseInt(id),
            ingredientId: parseInt(ingredientId),
            quantity: 1 // Puedes ajustar la cantidad según tu lógica
          }
        });
      })
    );

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}


export async function DELETE(request) {
  try {
    const data = await request.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json({ message: 'ID del producto es requerido' }, { status: 400 });
    }

    // Eliminar las relaciones del producto con los ingredientes
    await db.productIngredient.deleteMany({
      where: { productId: parseInt(id) }
    });

    // Eliminar el producto
    await db.product.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Producto eliminado' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

