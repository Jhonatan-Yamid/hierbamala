"use client";

import React from "react";
import useSalesFormLogic from "@/hooks/useSalesFormLogic";
import ProductSearch from "@/components/ProductSearch";
import ProductList from "@/components/ProductList";
import SaleInfoFields from "@/components/SaleInfoFields";
import TicketPreviewModal from "@/components/TicketPreviewModal";

const SalesForm = ({ saleId }) => {
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
  } = useSalesFormLogic(saleId);
  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Cargando datos de la venta...</p>
      </div>
    );
  }

  const getPrintIP = async () => {
  try {
    const response = await fetch('/api/print-ip');  
    const data = await response.json();
    return data.ip || 'localhost';
  } catch (error) {
    return 'localhost';
  }
};

  const handlePay = async () => {
    const saleData = {
      tableNumber,
      saleStatus,
      generalObservation,
      totalAmount: calculateTotal(),
      products: products.map((p) => ({
        id: p.id,
        quantity: p.quantity || 1,
        observation: p.observation,
        additions: p.additions?.map((a) => ({ name: a.name, price: a.price })) || [],
      })),
    };

    try {
      const url = isEditing ? `/api/sale/${saleId}` : '/api/sale';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });

      if (res.ok) {
        const newSale = await res.json();
        console.log("Venta creada:", newSale);
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
      availableGames: game ? [availableGames.find((g) => g.id.toString() === game)?.name || "Sin juego"] : [],
    };

    try {
      alert(getPrintIP())
      return
      const res = await fetch(getPrintIP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      alert(data.success ? "Ticket enviado a la impresora" : "Error al imprimir");
    } catch (err) {
      console.error("Error al imprimir:", err);
      alert("Error al conectar con el servicio de impresión.");
    }
  };

  const handleShare = async () => {
    const ticketContent = formatTicket();
    const encoded = encodeURIComponent(`Aquí tienes el ticket:\n${ticketContent}`);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  return (
    <form className="bg-gray-950 text-slate-200 p-6 rounded-md space-y-4">
      <h2 className="text-xl font-bold">
        {isEditing ? 'Editar Venta' : 'Nueva Venta'}
      </h2>

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
      />

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="button"
        onClick={handlePay}
        className="w-full p-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md"
      >
        Pagar
      </button>

      {showPreview && (
        <TicketPreviewModal
          formatTicket={formatTicket}
          onPrint={handlePrint}
          onShare={handleShare}
          onClose={() => setShowPreview(false)}
        />
      )}

      <button
        type="button"
        onClick={() => setShowPreview(true)}
        className="w-full p-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md"
      >
        Ver Vista Previa
      </button>
    </form>
  );
};

export default SalesForm;
