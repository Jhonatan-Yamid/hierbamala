// src/app/api/sale/[id]/route.js
import { NextResponse } from 'next/server';
import db from '@/libs/db'; // Asegúrate de que db esté configurado correctamente
import { nanoid } from 'nanoid'; // nanoid se usa para SaleProduct.id si es string y no @default(cuid())

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID de venta inválido" },
        { status: 400 }
      );
    }
    const sale = await db.sale.findUnique({
      where: { id: id },
      include: {
        products: {
          include: {
            additions: true,
            product: true
          }
        },
        // *** MODIFICACIÓN PARA JUEGOS: Incluir el juego relacionado ***
        game: true,
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
      // *** MODIFICACIÓN PARA JUEGOS: Incluir gameId y game object en la respuesta ***
      game: sale.game ? String(sale.game.id) : '', // Enviar el ID del juego como string si existe, si no, cadena vacía
      gameDetails: sale.game || null, // Opcional: enviar el objeto completo del juego si el frontend lo necesita
      // AÑADIR: orderType para el GET
      orderType: sale.orderType || "En mesa", // Asumiendo un default si no está presente
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

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    // 1. Desestructurar los datos del payload de la solicitud
    const {
      totalAmount,
      saleStatus,
      tableNumber,
      generalObservation,
      products,
      game,
      orderType // <--- MODIFICACIÓN MÍNIMA 1: Desestructurar orderType
    } = data;

    const saleIdInt = parseInt(params.id);
    if (isNaN(saleIdInt)) {
      return NextResponse.json({ message: "ID de venta inválido" }, { status: 400 });
    }

    // *** MODIFICACIÓN PARA JUEGOS: Convertir 'game' a gameId (número o null) ***
    const gameId = game ? parseInt(game, 10) : null;
    if (game && isNaN(gameId)) {
      return NextResponse.json({ message: 'ID de juego inválido' }, { status: 400 });
    }

    await db.$transaction(async (prisma) => {
      // Eliminar relaciones de muchos a muchos primero: SaleProductAddition
      await prisma.saleProductAddition.deleteMany({
        where: {
          saleProduct: {
            saleId: saleIdInt
          }
        }
      });

      // Luego eliminar los SaleProduct asociados a la venta
      await prisma.saleProduct.deleteMany({
        where: {
          saleId: saleIdInt
        }
      });

      // *** MODIFICACIÓN IMPORTANTE PARA JUEGOS Y LÓGICA DE ACTUALIZACIÓN ***
      // En lugar de ELIMINAR y CREAR la venta principal, la VAMOS A ACTUALIZAR.
      // Esto mantiene el mismo ID de venta.
      const updatedSale = await prisma.sale.update({
        where: { id: saleIdInt }, // Actualizamos la venta con el ID existente
        data: {
          totalAmount: totalAmount,
          status: saleStatus || 'en proceso',
          table: tableNumber,
          generalObservation: generalObservation,
          // *** MODIFICACIÓN PARA JUEGOS: Añadir gameId a la data de actualización ***
          gameId: gameId,
          orderType: orderType, // <--- MODIFICACIÓN MÍNIMA 2: Añadir orderType a la data de actualización
        },
      });

      // Procesar y crear los nuevos productos de la venta
      // Usamos el ID de la venta existente (updatedSale.id)
      const productPromises = products.map(async (product) => {
        const saleProduct = await prisma.saleProduct.create({
          data: {
            id: nanoid(),
            saleId: updatedSale.id, // Usa el ID de la venta que fue actualizada
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
        return saleProduct;
      });

      await Promise.all(productPromises);

      // Si la transacción se completó sin errores, retornamos el resultado de la actualización
      return { message: 'Venta actualizada exitosamente', updatedSaleId: updatedSale.id };
    });

    return NextResponse.json({ message: 'Venta actualizada exitosamente' }, { status: 200 });

  } catch (error) {
    console.error('Error al actualizar la venta:', error);
    // *** MODIFICACIÓN PARA JUEGOS: Manejo de error si el gameId no existe ***
    if (error.code === 'P2003' && error.meta?.field_name === 'gameId') {
      return NextResponse.json({ message: 'El ID de juego proporcionado no existe.' }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al actualizar la venta';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// Este 'handler' es de Next.js Pages Router y está mezclado con la estructura de App Router.
// Si estás usando Next.js App Router (rutas con funciones GET/POST/PUT exportadas),
// esta parte del código probablemente no se está usando o está mal ubicada.
// No la modifico ya que el enfoque es solo el de los juegos en las funciones GET y PUT.
export default async function handler(req, res) {
  if (req.method === 'PUT' || req.method === 'PATCH') {
    const { id } = req.query;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: 'ID de venta o estado faltante' });
    }

    const allowedStatuses = ["en proceso", "en mesa", "pagada"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado proporcionado no válido' });
    }

    try {
      // Nota: 'prisma' no está definido en este ámbito, necesitarías importarlo o usar 'db'
      const updatedSale = await db.sale.update({ // Cambiado de 'prisma.sale.update' a 'db.sale.update'
        where: {
          id: parseInt(id),
        },
        data: {
          status: status,
          updatedAt: new Date(),
        },
      });

      res.status(200).json(updatedSale);
    } catch (error) {
      console.error("Error al actualizar el estado de la venta:", error);
      res.status(500).json({ message: 'Error al actualizar el estado de la venta', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}