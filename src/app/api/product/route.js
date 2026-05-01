import { NextResponse } from 'next/server';
import db from '@/libs/db';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('search') || '';
    const categoryQuery = url.searchParams.get('category');

    const whereClause = {};

    if (searchQuery) {
      whereClause.name = {
        contains: searchQuery,
        mode: 'insensitive',
      };
    }

    if (categoryQuery) {
      whereClause.category = categoryQuery;
    } else {
      whereClause.category = { not: 'Adiciones' };
    }

    const products = await db.product.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        quantity: true,    // <-- Nuevo campo
        typeUnity: true,   // <-- Nuevo campo
      },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error al obtener productos:', error); // Log más detallado
    return NextResponse.json(
      { message: 'Error al obtener productos', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const createdProduct = await db.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category,
        quantity: data.quantity ? parseFloat(data.quantity) : null, // <-- Nuevo
        typeUnity: data.typeUnity,                                 // <-- Nuevo
        ingredients: {
          create: data.selectedIngredients.map(id => ({
            quantity: 1,
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
const { id, name, description, price, selectedIngredients, category, quantity, typeUnity } = data;
    if (!id) {
      return NextResponse.json({ message: 'ID del producto es requerido' }, { status: 400 });
    }

    const updatedProduct = await db.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        quantity: quantity ? parseFloat(quantity) : null, // <-- Nuevo
        typeUnity,                                        // <-- Nuevo
      }
    });

    // Limpiar y recrear ingredientes (manteniendo tu lógica original)
    await db.productIngredient.deleteMany({ where: { productId: parseInt(id) } });
    
    await Promise.all(
      selectedIngredients.map(async (ingredientId) => {
        await db.productIngredient.create({
          data: {
                productId: parseInt(id),
            ingredientId: parseInt(ingredientId),
            quantity: 1
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

    await db.productIngredient.deleteMany({
      where: { productId: parseInt(id) }
    });

    await db.product.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Producto eliminado' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}