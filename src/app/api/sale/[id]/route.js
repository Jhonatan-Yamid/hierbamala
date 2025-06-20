import { NextResponse } from 'next/server';
import db from '@/libs/db'; // Asegúrate de que db esté configurado correctamente
import { nanoid } from 'nanoid';

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    // Validar que sea un número válido
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID de venta inválido" },
        { status: 400 }
      );
    }
    const sale = await db.sale.findUnique({
      where: { id: id }, // Usar el número convertido
      include: {
        products: {
          include: {
            additions: true,
            product: true
          }
        }
      }
    });

    if (!sale) {
      return NextResponse.json({ message: 'Venta no encontrada' }, { status: 404 });
    }

    // Formatear la respuesta para coincidir con la estructura que espera el front
    const formattedSale = {
      ...sale,
      tableNumber: sale.table,
      saleStatus: sale.status,
      generalObservation: sale.generalObservation,
      products: sale.products.map(sp => ({
        id: sp.product.id,
        quantity: sp.quantity,
        observation: sp.observation,
        additions: sp.additions,
        name: sp.product.name,
        price: sp.product.price
      }))
    };

    return NextResponse.json(formattedSale, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo venta:', error);
    return NextResponse.json({ message: 'Error obteniendo venta' }, { status: 500 });
  }
}

// app/api/sale/[id]/route.js
export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    // 1. Desestructurar los datos del payload de la solicitud
    const { totalAmount, saleStatus, tableNumber, generalObservation, products } = data;

    // Convertir el ID de la URL a un número entero
    const saleIdInt = parseInt(params.id);
    if (isNaN(saleIdInt)) {
      return NextResponse.json({ message: "ID de venta inválido" }, { status: 400 });
    }

    // Usar una transacción para asegurar que todas las operaciones de la base de datos
    // se completen o se reviertan si algo falla.
    await db.$transaction(async (prisma) => {
      // Eliminar relaciones de muchos a muchos primero: SaleProductAddition
      await prisma.saleProductAddition.deleteMany({
        where: {
          saleProduct: {
            saleId: saleIdInt // Filtra por la venta que estamos actualizando
          }
        }
      });

      // Luego eliminar los SaleProduct asociados a la venta
      await prisma.saleProduct.deleteMany({
        where: {
          saleId: saleIdInt // Filtra por la venta que estamos actualizando
        }
      });

      // Finalmente, eliminar la venta principal
      // Nota: Si quieres un 'update' que mantenga el mismo ID de venta,
      // esta lógica de delete+create es un reemplazo completo.
      // Una actualización real sería con db.sale.update y manejar las relaciones.
      await prisma.sale.delete({
        where: { id: saleIdInt },
      });

      // Recrear la venta con los datos actualizados (esto generará un nuevo ID de venta)
      const newSale = await prisma.sale.create({
        data: {
          totalAmount: totalAmount,
          status: saleStatus || 'en proceso',
          table: tableNumber, // Asegúrate de que el nombre del campo coincida con tu esquema de Prisma ('table')
          generalObservation: generalObservation,
        },
      });

      // Procesar y crear los nuevos productos de la venta
      // Usamos el ID de la nueva venta creada
      const productPromises = products.map(async (product) => {
        const saleProduct = await prisma.saleProduct.create({
          data: {
            // El campo 'id' de SaleProduct es @default(cuid()), no necesitas nanoid aquí a menos que quieras otra cosa.
            saleId: newSale.id, // Usa el ID de la venta recién creada
            productId: product.id,
            quantity: product.quantity,
            observation: product.observation || '',
          },
        });

        // Procesar adiciones si existen
        if (product.additions && product.additions.length > 0) {
          await Promise.all(
            product.additions.map((addition) => {
              return prisma.saleProductAddition.create({
                data: {
                  saleProductId: saleProduct.id,
                  name: addition.name,
                  price: addition.price,
                },
              });
            })
          );
        }
        return saleProduct; // Devuelve el producto de venta creado
      });

      await Promise.all(productPromises); // Espera a que todos los productos se creen

      // En este punto, la transacción fue exitosa y la venta fue recreada
      // con un posible nuevo ID. Puedes retornar un mensaje de éxito o los datos
      // de la nueva venta. Para este escenario, un mensaje de éxito es suficiente.
      return { message: 'Venta actualizada exitosamente', newSaleId: newSale.id };
    });

    // Si la transacción se completó sin errores, enviamos una respuesta de éxito al cliente
    return NextResponse.json({ message: 'Venta actualizada exitosamente' }, { status: 200 });

  } catch (error) {
    console.error('Error al actualizar la venta:', error);
    // Envía siempre un mensaje de error como STRING al frontend
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al actualizar la venta';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
