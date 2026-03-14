"use client";

import { useCallback } from "react";

export default function useTicketPrinter() {
  const printTicket = useCallback(
    async ({
      products,
      total,
      tableNumber,
      game,
      availableGames = [],
      availableProducts = [],
      generalObservation,
      orderType,
    }) => {
      try {
        // 1. Obtener IP de la impresora
        const ipRes = await fetch("/api/print-ip");
        if (!ipRes.ok) throw new Error("No se pudo obtener la IP de la impresora");

        const ipData = await ipRes.json();
        const printerIp = ipData.ip;

        if (!printerIp) {
          alert("No hay impresora configurada.");
          return;
        }

        // 2. Enriquecer cada producto con su precio y categoría reales
        //    (los que vienen de la instancia en el formulario a veces no tienen category)
        const enrichedProducts = products.map((p) => {
          const template = availableProducts.find((ap) => ap.id === p.id);
          return {
            id:          p.id,
            name:        p.name        || template?.name     || "Producto",
            price:       p.price       ?? template?.price    ?? 0,   // precio unitario
            category:    p.category    || template?.category || "Otros",
            quantity:    p.quantity    || 1,
            observation: p.observation || "",
            additions:   (p.additions  || []).map((a) => ({
              name:  a.name,
              price: Number(a.price) || 0,
            })),
          };
        });

        // 3. Nombre del juego seleccionado
        const gameName = game
          ? availableGames.find((g) => g.id.toString() === game)?.name || ""
          : "";

        const requestBody = {
          products:           enrichedProducts,
          total:              Number(total) || 0,
          tableNumber:        tableNumber   || 0,
          availableGames:     gameName ? [gameName] : [],
          generalObservation: generalObservation || "",
          orderType:          orderType          || "En mesa",
        };

        // 4. Enviar al servidor de impresión
        const res = await fetch(`${printerIp}/print`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(requestBody),
        });

        const data = await res.json();

        if (data.success) {
          alert("🖨️ Ticket enviado a la impresora");
        } else {
          alert("Error al imprimir: " + (data.message || "Error desconocido"));
        }
      } catch (err) {
        console.error("Error al imprimir:", err);
        alert("Error al conectar con el servicio de impresión: " + err.message);
      }
    },
    []
  );

  return { printTicket };
}
