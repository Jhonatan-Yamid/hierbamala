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
      where: {
        updatedAt: {
          gte: startOfDay, // Mayor o igual a la medianoche
          lte: endOfDay,   // Menor o igual al final del día
        },
      },
      include: {
        products: {
          include: {
            product: true, // Incluir los productos asociados a la venta
          },
        },
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
    } = data;

    if (!products || products.length === 0) {
      return NextResponse.json({ message: 'Debe seleccionar al menos un producto' }, { status: 400 });
    }

    // Crear la venta
    const newSale = await db.sale.create({
      data: {
        totalAmount,
        status: saleStatus || 'en proceso',
        table: tableNumber,
        generalObservation,
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

    return NextResponse.json({
      ...newSale,
      products: updatedProducts,
    }, { status: 201 });

  } catch (error) {
    console.error('Error al crear la venta:', error);
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