"use client";

import React, { useState, useRef, useEffect } from "react";
import useSalesFormLogic from "@/hooks/useSalesFormLogic";
import ProductSearch from "@/components/ProductSearch";
import ProductList from "@/components/ProductList";
import SaleInfoFields from "@/components/SaleInfoFields";
import TicketPreviewModal from "@/components/TicketPreviewModal";
import useTicketPrinter from "@/hooks/useTicketPrinter";
import { useRouter } from "next/navigation";


const SalesForm = ({ saleId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldPrint, setShouldPrint] = useState(false);
  const [businessType, setBusinessType] = useState("restaurant"); // 👈 Estado para el tipo de negocio
  const router = useRouter();

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
    orderType,
    setOrderType,
  } = useSalesFormLogic(saleId);
  const { printTicket } = useTicketPrinter();
  const tableInputRef = useRef(null);

  // Traer datos del negocio al cargar
  useEffect(() => {
    const fetchBusinessConfig = async () => {
      try {
        const res = await fetch("/api/business");
        if (res.ok) {
          const data = await res.json();
          if (data && data.type) {
            setBusinessType(data.type.toLowerCase());
          }
        }
      } catch (err) {
        console.error("Error cargando configuración de negocio:", err);
      }
    };
    fetchBusinessConfig();
  }, []);

  useEffect(() => {
    if (businessType === "fruver") {
      setShouldPrint(true);
    } else {
      setShouldPrint(false);
    }
  }, [businessType]);

  // ⌨️ Escuchar la combinación Shift + Tab para guardar la venta
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Verifica que presione TAB y que al mismo tiempo tenga SHIFT presionado
      if (event.key === "Tab" && event.shiftKey) {
        event.preventDefault(); // Evita el comportamiento por defecto
        handlePay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [products, tableNumber, generalObservation, businessType, isSubmitting]);


  useEffect(() => {
    if (businessType === "fruver" && !isEditing && availableProducts && availableProducts.length > 0) {

      // 2. Solo agregarlos si la lista de productos actual está vacía (para evitar bucles o sobreescribir)
      if (products.length === 0) {

        // 3. Filtrar los productos que pertenezcan a la categoría "fijos"
        // 💡 NOTA: Asegúrate de si tu API devuelve "fijos", "Fijos" o "FIJOS" y usa .toLowerCase() para asegurar.
        const productosFijos = availableProducts
          .filter(p => p.category?.toLowerCase() === "fijos" || p.categoria?.toLowerCase() === "fijos")
          .map(p => ({
            ...p,
            quantity: 1, // 👈 Forzar cantidad en 1
            observation: null,
            additions: []
          }));

        // 4. Cargarlos al estado del formulario
        if (productosFijos.length > 0) {
          setProducts(productosFijos);
        }
      }
    }
  }, [businessType, isEditing, availableProducts, products.length, setProducts]);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700" />
        <p className="mt-3 text-gray-300">Cargando datos de la venta...</p>
      </div>
    );
  }

  const handlePay = async () => {
    if (isSubmitting) return; // 🔒 Bloquea doble click
    // 💡 Validación dinámica: Solo exigir mesa si NO es fruver
    if (businessType !== "fruver" && (!tableNumber || tableNumber.trim() === "")) {
      alert("Debes ingresar el número de mesa");
      tableInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    const saleData = {
      tableNumber: businessType === "fruver" ? "Mostrador" : tableNumber,
      saleStatus,
      generalObservation,
      totalAmount: calculateTotal(),
      game: businessType === "fruver" ? null : game,
      orderType,
      products: products.map((p) => ({
        id: p.id,
        quantity: p.quantity || 1,
        observation:
          p.observation === "" || p.observation === undefined
            ? null
            : p.observation,
        additions:
          p.additions?.map((a) => ({
            id: a.id || a.name,
            name: a.name,
            price: a.price,
          })) || [],
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

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al guardar la venta");
      }

      // ✅ Si debe imprimir
      if (shouldPrint) {
        await printTicket({
          products,
          total: calculateTotal(),
          tableNumber,
          game,
          availableGames,
          availableProducts,   // ← AGREGAR ESTA LÍNEA
          generalObservation,
          orderType,
        });
      }

      // 🔥 COMPORTAMIENTO DIFERENTE SEGÚN ESCENARIO

      if (!isEditing) {
        if (businessType !== "fruver") {
          router.push("/dashboard/saleTable");
          return;
        } else {
          alert("Venta guardada con éxito");
          router.refresh();
          // O de forma alternativa si quieres limpiar los estados manuales que no dependan del hook:
          setProducts([]);
          setTableNumber("");
          setGeneralObservation("");
          // Si tu hook useSalesFormLogic expone una función para resetear el formulario, la ideal sería llamarla aquí.
          return;
        }
        // 🚀 NUEVA VENTA → redirigir directamente

      }

      // ✏️ EDICIÓN → mostrar preview
      setShowPreview(true);

    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Error al guardar la venta.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleShare = async () => {
    const ticketContent = formatTicket();
    const encoded = encodeURIComponent(`Aquí tienes el ticket:\n${ticketContent}`);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={(e) => e.preventDefault()} className=" text-slate-200 rounded-2xl shadow-xl space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold"> {isEditing ? "Editar Venta" : "Nueva Venta"}</h2>
            <p className="text-sm text-gray-400">{new Date().toLocaleTimeString()} • Raices Campesinas</p>
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
            businessType={businessType}
          />

          <ProductList
            products={products}
            setProducts={setProducts}
            availableAdditions={availableAdditions}
            availableProducts={availableProducts}
            businessType={businessType}
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
            tableInputRef={tableInputRef} // 👈 PASAMOS EL REF
            businessType={businessType}
            saleStatus={saleStatus}     // 👈 Recibimos el estado actual
            setSaleStatus={setSaleStatus}
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
              disabled={isSubmitting}
              className={`ml-auto w-full sm:w-auto px-5 py-2 rounded-lg shadow font-semibold transition-all
    ${isSubmitting
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 text-black"
                }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </div>
              ) : (
                "Guardar"
              )}
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
            businessType={businessType} 
            products={products}
            total={calculateTotal()}
            tableNumber={tableNumber}
            orderType={orderType}
            generalObservation={generalObservation}
            onPrint={() =>
              printTicket({
                products,
                total: calculateTotal(),
                tableNumber,
                game,
                availableGames,
                availableProducts,   // ← AGREGAR ESTA LÍNEA
                generalObservation,
                orderType,
              })
            }
            onShare={handleShare}
            onClose={() => setShowPreview(false)}
          />

        )}
      </form>
    </div>
  );
};

export default SalesForm;
