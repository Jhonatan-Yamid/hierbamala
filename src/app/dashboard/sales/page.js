"use client";

import React, { useState } from "react";
import useSalesFormLogic from "@/hooks/useSalesFormLogic";
import ProductSearch from "@/components/ProductSearch";
import ProductList from "@/components/ProductList";
import SaleInfoFields from "@/components/SaleInfoFields";
import TicketPreviewModal from "@/components/TicketPreviewModal";

const SalesForm = ({ saleId }) => {
  const [shouldPrint, setShouldPrint] = useState(false);
  const {
    isLoading,
    isEditing,
    products,
    setProducts,
    searchTerm,
    setSearchTerm,
    suggestions,
    setSuggestions,
    tableNumber,
    setTableNumber,
    saleStatus,
    setSaleStatus,
    game,
    setGame,
    generalObservation,
    setGeneralObservation,
    error,
    setError,
    showPreview,
    setShowPreview,
    availableProducts,
    availableAdditions,
    availableGames,
    calculateTotal,
    formatTicket,
    setIpPrint,
    ipPrint,
    // NUEVO: orderType y setOrderType
    orderType,
    setOrderType,
  } = useSalesFormLogic(saleId);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700" />
        <p className="mt-3 text-gray-300">Cargando datos de la venta...</p>
      </div>
    );
  }

  const handlePay = async () => {
    // Validación front: número de mesa obligatorio
    if (!tableNumber || tableNumber.toString().trim() === "") {
      setError("El número de mesa es obligatorio.");
      // Scroll suave a top del formulario (si aplica)
      window?.scrollTo?.({ top: 0, behavior: "smooth" });
      return;
    }

    const saleData = {
      tableNumber,
      saleStatus,
      generalObservation,
      totalAmount: calculateTotal(),
      game: game,
      orderType,
      products: products.map((p) => ({
        id: p.id,
        quantity: p.quantity || 1,
        observation:
          p.observation === "" || p.observation === undefined
            ? null
            : p.observation,
        additions:
          p.additions?.map((a) => ({ id: a.id || a.name, name: a.name, price: a.price })) ||
          [],
      })),
    };

    try {
      const url = isEditing ? `/api/sale/${saleId}` : "/api/sale";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });

      if (res.ok) {
        // limpiar error y mostrar preview
        setError(null);
        if (shouldPrint) {
          await handlePrint();
        }
        setShowPreview(true);
      } else {
        const err = await res.json();
        setError(err.message || "Error al guardar la venta");
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError("Hubo un error al conectar con el servidor.");
    }
  };

  const handlePrint = async () => {
    const formattedProducts = products.map((p) => ({
      name: p.name,
      quantity: p.quantity,
      price: p.price,
      observation: p.observation,
      additions: p.additions || [],
    }));

    const requestBody = {
      products: formattedProducts,
      total: calculateTotal(),
      tableNumber: tableNumber || 0,
      availableGames: game
        ? [availableGames.find((g) => g.id.toString() === game)?.name || "Sin juego"]
        : [],
      generalObservation: generalObservation,
      orderType: orderType,
    };

    const printUrl = `${ipPrint.ip}/print`;

    try {
      const res = await fetch(printUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      if (data.success) {
        alert("Ticket enviado a la impresora");
      } else {
        alert("Error al imprimir: " + (data.message || "Error desconocido"));
      }
    } catch (err) {
      console.error("Error al imprimir:", err);
      alert("Error al conectar con el servicio de impresión: " + err.message);
    }
  };

  const handleShare = async () => {
    const ticketContent = formatTicket();
    const encoded = encodeURIComponent(`Aquí tienes el ticket:\n${ticketContent}`);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="bg-[#070A0D] text-slate-200 p-6 rounded-2xl shadow-xl space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold"> {isEditing ? "Editar Venta" : "Nueva Venta"}</h2>
          <p className="text-sm text-gray-400">{new Date().toLocaleTimeString()} • Hierba Mala</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400">Total</div>
            <div className="font-bold text-lg text-emerald-400">{new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(calculateTotal())}</div>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        <ProductSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          suggestions={suggestions}
          setSuggestions={setSuggestions}
          availableProducts={availableProducts}
          setProducts={setProducts}
        />

        <ProductList
          products={products}
          setProducts={setProducts}
          availableAdditions={availableAdditions}
          availableProducts={availableProducts}
        />

        <SaleInfoFields
          tableNumber={tableNumber}
          setTableNumber={setTableNumber}
          game={game}
          setGame={setGame}
          availableGames={availableGames}
          generalObservation={generalObservation}
          setGeneralObservation={setGeneralObservation}
          orderType={orderType}
          setOrderType={setOrderType}
        />

        {error && <div className="text-red-400 text-sm rounded-md p-2 bg-red-900/20">{error}</div>}

        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={shouldPrint}
              onChange={(e) => setShouldPrint(e.target.checked)}
              className="w-4 h-4 rounded bg-gray-800 border border-gray-700"
            />
            <span className="text-gray-300">Imprimir al guardar</span>
          </label>

          <button
            type="button"
            onClick={handlePay}
            className="ml-auto w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-5 py-2 rounded-lg shadow"
          >
            Guardar
          </button>

          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="w-full sm:w-auto bg-gray-800 border border-gray-700 hover:bg-gray-700 px-4 py-2 rounded-lg"
          >
            Ver Vista Previa
          </button>
        </div>
      </div>

      {showPreview && (
        <TicketPreviewModal
          formatTicket={formatTicket}
          onPrint={handlePrint}
          onShare={handleShare}
          onClose={() => setShowPreview(false)}
        />
      )}
    </form>
  );
};

export default SalesForm;
