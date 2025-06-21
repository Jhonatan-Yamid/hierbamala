import { NextResponse } from 'next/server';
import db from '@/libs/db';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('search') || '';
    const categoryQuery = url.searchParams.get('category'); // Obtiene el parámetro 'category'

    const whereClause = {}; // Inicializa el objeto where para la consulta a la DB

    if (searchQuery) {
      whereClause.name = {
        contains: searchQuery, // Búsqueda por nombre del producto
        mode: 'insensitive', // Opcional: para que la búsqueda no distinga mayúsculas/minúsculas
      };
    }

    // Lógica clave para incluir/excluir por categoría
    if (categoryQuery) {
      // Si se proporciona una categoría específica (ej. ?category=adiciones)
      // entonces filtra por esa categoría.
      whereClause.category = categoryQuery;
    } else {
      // Si NO se proporciona el parámetro 'category' en la URL
      // entonces EXCLUYE los productos que tienen la categoría 'adiciones'.
      whereClause.category = {
        not: 'Adiciones', // <-- ¡ESTE ES EL CAMBIO CLAVE!
      };
    }

    // Buscar productos según la cláusula 'where' construida dinámicamente
    const products = await db.product.findMany({
      where: whereClause, // Usar el objeto 'whereClause'
      select: {
        id: true,
        name: true,
        price: true,
        category: true, // Incluye la categoría para depuración o si la necesitas en el frontend
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
        price: parseInt(data.price),
        category: data.category, // Asegúrate de enviar la categoría al crear un producto
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
    const { id, name, description, price, selectedIngredients, category } = data; // Agrega 'category' aquí

    if (!id) {
      return NextResponse.json({ message: 'ID del producto es requerido' }, { status: 400 });
    }

    const updatedProduct = await db.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        category, // Actualiza la categoría
      }
    });

    await db.productIngredient.deleteMany({
      where: { productId: parseInt(id) }
    });

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