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
      generalObservation,
      orderType,
    }) => {
      try {
        // 1️⃣ Obtener IP automáticamente
        const ipRes = await fetch("/api/print-ip");
        if (!ipRes.ok) throw new Error("No se pudo obtener la IP de la impresora");

        const ipData = await ipRes.json();
        const printerIp = ipData.ip;

        if (!printerIp) {
          alert("No hay impresora configurada.");
          return;
        }

        // 2️⃣ Formatear productos
        const formattedProducts = products.map((p) => ({
          name: p.name,
          quantity: p.quantity,
          price: p.price,
          observation: p.observation,
          additions: p.additions || [],
        }));

        const requestBody = {
          products: formattedProducts,
          total,
          tableNumber: tableNumber || 0,
          availableGames: game
            ? [
                availableGames.find((g) => g.id.toString() === game)?.name ||
                  "Sin juego",
              ]
            : [],
          generalObservation,
          orderType,
        };

        // 3️⃣ Enviar a la impresora
        const res = await fetch(`${printerIp}/print`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        const data = await res.json();

        if (data.success) {
          alert("🖨️ Ticket enviado a la impresora");
        } else {
          alert("Error al imprimir: " + (data.message || "Error desconocido"));
        }
      } catch (err) {
        console.error("Error al imprimir:", err);
        alert(
          "Error al conectar con el servicio de impresión: " + err.message
        );
      }
    },
    []
  );

  return { printTicket };
}
