import { NextResponse } from 'next/server';
import db from '@/libs/db'; // Asegúrate de que db esté configurado correctamente
import { nanoid } from 'nanoid'; // Usamos nanoid para generar un ID único

// Función para obtener las ventas del día
export async function GET() {
  try {
    // Obtener la fecha de hoy sin la parte de la hora
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Establece a medianoche
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // Establece al final del día

    // Consultar las ventas realizadas hoy
    const sales = await db.sale.findMany({
      
      include: {
        products: {
          include: {
            product: true, // Incluir los productos asociados a la venta
          },
        },
        // *** MODIFICACIÓN PARA JUEGOS: Incluir el juego relacionado al obtener las ventas ***
        game: true,
      },
    });

    // Retornar las ventas encontradas
    return NextResponse.json(sales, { status: 200 });
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    return NextResponse.json({ message: 'Error al obtener las ventas' }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const data = await request.json();

    const {
      tableNumber,
      saleStatus,
      generalObservation,
      totalAmount,
      products,
      // *** MODIFICACIÓN PARA JUEGOS: Desestructurar 'game' del body ***
      game,
    } = data;

    if (!products || products.length === 0) {
      return NextResponse.json({ message: 'Debe seleccionar al menos un producto' }, { status: 400 });
    }

    // *** MODIFICACIÓN PARA JUEGOS: Convertir 'game' a gameId (número o null) ***
    const gameId = game ? parseInt(game, 10) : null;
    if (game && isNaN(gameId)) {
        return NextResponse.json({ message: 'ID de juego inválido' }, { status: 400 });
    }

    // Crear la venta
    const newSale = await db.sale.create({
      data: {
        totalAmount,
        status: saleStatus || 'en proceso',
        table: tableNumber,
        generalObservation,
        // *** MODIFICACIÓN PARA JUEGOS: Añadir gameId a la data de la venta ***
        gameId,
      },
    });

    // Procesar productos
    const productPromises = products.map(async (product) => {
      const saleProduct = await db.saleProduct.create({
        data: {
          id: nanoid(),
          saleId: newSale.id,
          productId: product.id,
          quantity: product.quantity,
          observation: product.observation || '',
        },
      });

      // Procesar adiciones
      const additionPromises = product.additions.map((addition) => {
        return db.saleProductAddition.create({
          data: {
            saleProductId: saleProduct.id,
            name: addition.name,
            price: addition.price,
          },
        });
      });

      await Promise.all(additionPromises);

      return saleProduct;
    });

    const updatedProducts = await Promise.all(productPromises);

    // *** MODIFICACIÓN PARA JUEGOS: Incluir el juego en la respuesta si es necesario ***
    // Para que el frontend tenga el objeto de juego completo si lo necesita inmediatamente
    const finalSale = await db.sale.findUnique({
      where: { id: newSale.id },
      include: {
        game: true, // Incluir la información del juego
        products: {
          include: {
            product: true,
            additions: true,
          }
        }
      }
    });


    return NextResponse.json({
      ...finalSale, // Usamos finalSale para asegurar que el objeto game esté incluido
      products: updatedProducts,
    }, { status: 201 });

  } catch (error) {
    console.error('Error al crear la venta:', error);
    // *** MODIFICACIÓN PARA JUEGOS: Manejo de error si el gameId no existe ***
    if (error.code === 'P2003' && error.meta?.field_name === 'gameId') {
        return NextResponse.json({ message: 'El ID de juego proporcionado no existe.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error al crear la venta' }, { status: 500 });
  }
}

export async function DELETE(request) { // Nota: No se usa 'params' aquí para la ruta base /api/sale
  try {
    // 1. Obtener el ID de los parámetros de consulta de la URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id'); // Esto obtendrá el valor de '?id=...' como string

    // 2. Convertir el ID a un número entero
    const saleIdInt = parseInt(id);

    // 3. Validar que el ID sea un número válido y que haya sido proporcionado
    if (isNaN(saleIdInt)) {
      return NextResponse.json(
        { message: "ID de venta inválido o no proporcionado en la URL" },
        { status: 400 } // Retorna 400 si el ID no es válido
      );
    }

    // 4. Utilizar una transacción para asegurar que todas las eliminaciones sean atómicas.
    // Si alguna operación falla, todas se revierten, manteniendo la integridad de los datos.
    await db.$transaction(async (prisma) => {
      // a. Eliminar adiciones de productos de venta relacionadas
      // (SaleProductAddition depende de SaleProduct, y SaleProduct depende de Sale)
      await prisma.saleProductAddition.deleteMany({
        where: {
          saleProduct: { // Accede a la relación anidada para filtrar por saleId
            saleId: saleIdInt
          }
        }
      });

      // b. Eliminar productos de venta relacionados
      // (SaleProduct depende de Sale)
      await prisma.saleProduct.deleteMany({
        where: {
          saleId: saleIdInt
        }
      });

      // c. Eliminar la venta principal
      // Esto lanzará un error (P2025) si la venta no existe
      await prisma.sale.delete({
        where: { id: saleIdInt },
      });
    });

    // 5. Si la transacción se completó sin errores, la venta y sus relaciones fueron eliminadas.
    return NextResponse.json(
      { message: `Venta con ID ${saleIdInt} eliminada exitosamente` },
      { status: 200 } // Retorna 200 OK en caso de éxito
    );

  } catch (error) {
    console.error('Error al eliminar la venta:', error); // Loguea el error completo para depuración

    // 6. Manejo de errores específicos y genéricos
    // Si es un error de "registro no encontrado" de Prisma (código P2025)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: `Venta con ID ${id} no encontrada.` }, // Usa el 'id' original para el mensaje
        { status: 404 } // Retorna 404 Not Found
      );
    }

    // Para cualquier otro tipo de error, devuelve un mensaje genérico y un 500
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar la venta';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 } // Retorna 500 Internal Server Error
    );
  }
}