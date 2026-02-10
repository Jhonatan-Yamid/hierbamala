"use client";
import React from "react";
import { FaPrint, FaShareAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const TicketPreviewModal = ({
  products = [],
  total = 0,
  tableNumber,
  orderType,
  generalObservation,
  onPrint,
  onShare,
  onClose,
}) => {
  // Agrupar productos iguales (igual que en DailySales)
  const grouped = [];
  products.forEach((p) => {
    const existing = grouped.find(
      (g) =>
        g.id === p.id &&
        g.observation === p.observation &&
        JSON.stringify(g.additions || []) === JSON.stringify(p.additions || [])
    );

    if (existing) existing.quantity += p.quantity || 1;
    else grouped.push({ ...p, quantity: p.quantity || 1 });
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-gray-900 w-full max-w-3xl h-[90vh] rounded-xl overflow-hidden flex flex-col border border-gray-700">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">
              Vista
            </h2>
            <p className="text-sm text-gray-400">
              Mesa {tableNumber || "-"} • {orderType}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onPrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaPrint /> Imprimir
            </button>

            <button
              onClick={onShare}
              className="bg-gray-800 border border-gray-700 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaShareAlt /> Compartir
            </button>

            <button onClick={onClose} className="text-gray-300 hover:text-white">
              <IoClose size={28} />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {grouped.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">
              No hay productos en esta venta
            </p>
          ) : (
            grouped.map((product, index) => (
              <div
                key={index}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">
                    {product.name}
                  </h3>
                  <span className="text-gray-400 text-sm">
                    x{product.quantity}
                  </span>
                </div>

                {product.observation && (
                  <p className="text-sm text-gray-300 italic mt-1">
                    Obs: {product.observation}
                  </p>
                )}

                {product.additions?.length > 0 && (
                  <ul className="mt-2 ml-4 list-disc text-sm text-gray-400">
                    {product.additions.map((add, i) => (
                      <li key={i}>
                        + {add.name} (
                        {new Intl.NumberFormat("es-CL", {
                          style: "currency",
                          currency: "CLP",
                        }).format(add.price)}
                        )
                      </li>
                    ))}
                  </ul>
                )}

                <div className="text-right text-emerald-400 font-semibold mt-2">
                  {new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  }).format(
                    (product.price +
                      (product.additions?.reduce(
                        (sum, a) => sum + a.price,
                        0
                      ) || 0)) * product.quantity
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-700 bg-gray-800 px-6 py-4 space-y-2">
          {generalObservation && (
            <p className="text-sm text-gray-300 italic">
              Nota general: {generalObservation}
            </p>
          )}

          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-white">Total</span>
            <span className="text-2xl font-bold text-emerald-400">
              {new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
              }).format(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPreviewModal;
