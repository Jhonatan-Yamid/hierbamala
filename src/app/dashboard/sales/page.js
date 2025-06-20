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
    game, // Ya tienes 'game' aquí
    setGame, // Ya tienes 'setGame' aquí
    generalObservation,
    setGeneralObservation,
    error,
    setError,
    showPreview,
    setShowPreview,
    availableProducts,
    availableAdditions,
    availableGames, // Ya tienes 'availableGames' aquí
    calculateTotal,
    formatTicket,
    setIpPrint, // Aunque no se usa directamente aquí, es parte del retorno
    ipPrint
  } = useSalesFormLogic(saleId);

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Cargando datos de la venta...</p>
      </div>
    );
  }


  const handlePay = async () => {
    const saleData = {
      tableNumber,
      saleStatus,
      generalObservation,
      totalAmount: calculateTotal(),
      game: game, // <-- AÑADIDO: Incluye el ID del juego de mesa aquí
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
        console.log("Venta guardada exitosamente.");

        // <-- MODIFICACIÓN CLAVE AQUI: Imprimir solo si NO se está editando (es una nueva creación)
        if (!isEditing) {
          handlePrint();
        }
        setShowPreview(true); // Siempre mostrar la vista previa para confirmación
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
      // Asegúrate de que `availableGames` se usa para encontrar el nombre del juego
      availableGames: game ? [availableGames.find((g) => g.id.toString() === game)?.name || "Sin juego"] : [],
      generalObservation: generalObservation, // Asegúrate de enviar la observación general si tu servidor de impresión la necesita
    };
    
    const printUrl = `${ipPrint.ip}/print`;
    console.log("URL de impresión:", printUrl); // Para depuración
    console.log("Datos a imprimir:", requestBody); // Para depuración

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
    <form onSubmit={e => e.preventDefault()} className="bg-gray-950 text-slate-200 p-6 rounded-md space-y-4">
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
        Guardar
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