// src/app/api/sale/route.js
import { NextResponse } from 'next/server';
import db from '@/libs/db';
import { nanoid } from 'nanoid';

// Función para obtener las ventas del día (sin cambios)
export async function GET() {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const sales = await db.sale.findMany({
            include: {
                products: {
                    include: {
                        product: true,
                    },
                },
                game: true,
            },
        });

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
            game,
            orderType,
        } = data;

        if (!products || products.length === 0) {
            return NextResponse.json({ message: 'Debe seleccionar al menos un producto' }, { status: 400 });
        }

        const gameId = game ? parseInt(game, 10) : null;
        if (game && isNaN(gameId)) {
            return NextResponse.json({ message: 'ID de juego inválido' }, { status: 400 });
        }

        const newSale = await db.sale.create({
            data: {
                totalAmount,
                status: saleStatus || 'en proceso',
                table: String(tableNumber),
                generalObservation,
                gameId,
                orderType,
            },
        });

        for (const product of products) {
            const saleProduct = await db.saleProduct.create({
                data: {
                    id: nanoid(),
                    saleId: newSale.id,
                    productId: product.id,
                    quantity: product.quantity,
                    observation: product.observation || '',
                },
            });

            await Promise.all(product.additions.map((addition) => {
                return db.saleProductAddition.create({
                    data: {
                        saleProductId: saleProduct.id,
                        name: addition.name,
                        price: addition.price,
                        additionId: addition.id,
                    },
                });
            }));

            // Descontar ingredientes del inventario
            const ingredients = await db.productIngredient.findMany({
                where: { productId: product.id },
            });

            for (const ing of ingredients) {
                await db.ingredient.update({
                    where: { id: ing.ingredientId },
                    data: {
                        quantity: {
                            decrement: ing.quantity * product.quantity,
                        },
                    },
                });
            }
        }

        const finalSale = await db.sale.findUnique({
            where: { id: newSale.id },
            include: {
                game: true,
                products: {
                    include: {
                        product: true,
                        additions: true,
                    }
                }
            }
        });

        return NextResponse.json(finalSale, { status: 201 });

    } catch (error) {
        console.error('Error al crear la venta:', error);
        if (error.code === 'P2003' && error.meta?.field_name === 'gameId') {
            return NextResponse.json({ message: 'El ID de juego proporcionado no existe.' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error al crear la venta' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const saleIdInt = parseInt(id);

        if (isNaN(saleIdInt)) {
            return NextResponse.json(
                { message: "ID de venta inválido o no proporcionado en la URL" },
                { status: 400 }
            );
        }

        await db.$transaction(async (prisma) => {
            const saleProducts = await prisma.saleProduct.findMany({
                where: { saleId: saleIdInt },
                include: {
                    product: true,
                }
            });

            for (const sp of saleProducts) {
                const ingredients = await prisma.productIngredient.findMany({
                    where: { productId: sp.productId },
                });

                for (const ing of ingredients) {
                    await prisma.ingredient.update({
                        where: { id: ing.ingredientId },
                        data: {
                            quantity: {
                                increment: ing.quantity * sp.quantity,
                            },
                        },
                    });
                }
            }

            await prisma.saleProductAddition.deleteMany({
                where: {
                    saleProduct: {
                        saleId: saleIdInt
                    }
                }
            });

            await prisma.saleProduct.deleteMany({
                where: {
                    saleId: saleIdInt
                }
            });

            await prisma.sale.delete({
                where: { id: saleIdInt },
            });
        });

        return NextResponse.json(
            { message: `Venta con ID ${saleIdInt} eliminada exitosamente` },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error al eliminar la venta:', error);
        if (error.code === 'P2025') {
            return NextResponse.json(
                { message: `Venta con ID ${id} no encontrada.` },
                { status: 404 }
            );
        }
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar la venta';
        return NextResponse.json(
            { message: errorMessage },
            { status: 500 }
        );
    }
}
