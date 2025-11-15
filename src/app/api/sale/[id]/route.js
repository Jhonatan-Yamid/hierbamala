// src/app/api/sale/[id]/route.js
import { NextResponse } from 'next/server';
import db from '@/libs/db';
import { nanoid } from 'nanoid';

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: "ID de venta inválido" }, { status: 400 });
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
        game: true,
      }
    });

    if (!sale) {
      return NextResponse.json({ message: 'Venta no encontrada' }, { status: 404 });
    }

    const formattedSale = {
      ...sale,
      tableNumber: sale.table,
      saleStatus: sale.status,
      generalObservation: sale.generalObservation,
      game: sale.game ? String(sale.game.id) : '',
      gameDetails: sale.game || null,
      orderType: sale.orderType || "En mesa",
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
    const {
      totalAmount,
      saleStatus,
      tableNumber,
      generalObservation,
      products,
      game,
      orderType
    } = data;

    const saleIdInt = parseInt(params.id);
    if (isNaN(saleIdInt)) {
      return NextResponse.json({ message: "ID de venta inválido" }, { status: 400 });
    }

    const gameId = game ? parseInt(game, 10) : null;
    if (game && isNaN(gameId)) {
      return NextResponse.json({ message: "ID de juego inválido" }, { status: 400 });
    }

    // -- Validaciones básicas --
    if (!Array.isArray(products)) {
      return NextResponse.json({ message: "Products debe ser un array" }, { status: 400 });
    }

    // -------------------------------------------------
    // 1) Transacción mínima: delete old -> update sale -> create new saleProducts (+ additions)
    // -------------------------------------------------
    const txResult = await db.$transaction(async (prisma) => {
      // 1.a Obtener los saleProducts antiguos (id, productId, quantity)
      const oldSaleProducts = await prisma.saleProduct.findMany({
        where: { saleId: saleIdInt },
        select: { id: true, productId: true, quantity: true },
      });

      const oldSaleProductIds = oldSaleProducts.map((s) => s.id);

      // 1.b Borrar adiciones antiguas en batch (por saleProductId)
      if (oldSaleProductIds.length > 0) {
        await prisma.saleProductAddition.deleteMany({
          where: { saleProductId: { in: oldSaleProductIds } },
        });
      }

      // 1.c Borrar saleProducts antiguos
      await prisma.saleProduct.deleteMany({
        where: { saleId: saleIdInt },
      });

      // 1.d Actualizar la venta principal
      await prisma.sale.update({
        where: { id: saleIdInt },
        data: {
          totalAmount,
          status: saleStatus || 'en proceso',
          table: tableNumber,
          generalObservation,
          gameId,
          orderType,
        },
      });

      // 1.e Preparar nuevos saleProducts con ids (generados con nanoid)
      const newSaleProductsData = [];
      const additionsData = []; // accumular todas las adiciones para createMany

      for (const prod of products) {
        const saleProductId = nanoid();
        newSaleProductsData.push({
          id: saleProductId,
          saleId: saleIdInt,
          productId: prod.id,
          quantity: prod.quantity,
          observation: prod.observation || '',
        });

        if (Array.isArray(prod.additions) && prod.additions.length > 0) {
          for (const add of prod.additions) {
            additionsData.push({
              saleProductId,
              name: add.name,
              price: add.price,
              additionId: add.id ?? null,
            });
          }
        }
      }

      // 1.f Crear los saleProducts en batch
      if (newSaleProductsData.length > 0) {
        // createMany soporta insertar ids que ya generamos
        await prisma.saleProduct.createMany({
          data: newSaleProductsData,
          skipDuplicates: true,
        });
      }

      // 1.g Crear todas las adiciones en batch
      if (additionsData.length > 0) {
        await prisma.saleProductAddition.createMany({
          data: additionsData,
          skipDuplicates: true,
        });
      }

      // Retornar info mínima necesaria para ajustar inventario fuera de la tx
      return {
        oldSaleProducts, // array {id, productId, quantity}
        newSaleProducts: newSaleProductsData.map((p) => ({
          id: p.id,
          productId: p.productId,
          quantity: p.quantity,
        })),
      };
    });

    // -------------------------------------------------
    // 2) Ajuste de inventario FUERA de la transacción (agrupado por ingredient)
    // -------------------------------------------------

    // 2.a Revertir inventario de productos antiguos (sumar)
    if (Array.isArray(txResult.oldSaleProducts) && txResult.oldSaleProducts.length > 0) {
      const productIdsToRestore = [...new Set(txResult.oldSaleProducts.map(p => p.productId))];

      // obtener todas las relaciones productIngredient para esos productos en UNA consulta
      const productIngredients = await db.productIngredient.findMany({
        where: { productId: { in: productIdsToRestore } },
        select: { productId: true, ingredientId: true, quantity: true },
      });

      // calcular incrementos por ingredientId
      const incrementsByIngredient = new Map(); // ingredientId -> totalIncrement

      for (const old of txResult.oldSaleProducts) {
        const related = productIngredients.filter(pi => pi.productId === old.productId);
        for (const pi of related) {
          const inc = (incrementsByIngredient.get(pi.ingredientId) || 0) + (pi.quantity * old.quantity);
          incrementsByIngredient.set(pi.ingredientId, inc);
        }
      }

      // aplicar increments (uno por ingrediente)
      for (const [ingredientId, totalInc] of incrementsByIngredient.entries()) {
        await db.ingredient.update({
          where: { id: ingredientId },
          data: { quantity: { increment: totalInc } },
        });
      }
    }

    // 2.b Descontar inventario por los nuevos productos (restar)
    if (Array.isArray(txResult.newSaleProducts) && txResult.newSaleProducts.length > 0) {
      const productIdsToDeduct = [...new Set(txResult.newSaleProducts.map(p => p.productId))];

      const productIngredientsForNew = await db.productIngredient.findMany({
        where: { productId: { in: productIdsToDeduct } },
        select: { productId: true, ingredientId: true, quantity: true },
      });

      // calcular decrementos por ingredientId
      const decrementsByIngredient = new Map(); // ingredientId -> totalToSubtract

      for (const np of txResult.newSaleProducts) {
        const related = productIngredientsForNew.filter(pi => pi.productId === np.productId);
        for (const pi of related) {
          const dec = (decrementsByIngredient.get(pi.ingredientId) || 0) + (pi.quantity * np.quantity);
          decrementsByIngredient.set(pi.ingredientId, dec);
        }
      }

      // Aplicar decrementos en lote (uno por ingrediente)
      for (const [ingredientId, totalDec] of decrementsByIngredient.entries()) {
        // obtener cantidad actual
        const current = await db.ingredient.findUnique({
          where: { id: ingredientId },
          select: { quantity: true },
        });

        if (!current) continue;

        const newQty = Math.max(0, (current.quantity || 0) - totalDec);

        await db.ingredient.update({
          where: { id: ingredientId },
          data: { quantity: newQty },
        });
      }
    }

    return NextResponse.json({ message: 'Venta actualizada exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la venta:', error);
    // Enviar detalles de error minimalistas
    const msg = error instanceof Error ? error.message : 'Error desconocido al actualizar la venta';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

export default null; // no handler de Pages Router aquí
