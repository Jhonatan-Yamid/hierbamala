"use client";

import React, { useEffect, useState, useCallback } from "react";

// ELIMINA ESTE ARRAY HARCODEADO
// const availableAdditions = [
//  { id: "Queso Pequeño", name: "Queso Pequeño", price: 1500 },
//  { id: "Tocineta Pequeña", name: "Tocineta Pequeña", price: 1500 },
//  { id: "Queso Grande", name: "Queso Grande", price: 3000 },
//  { id: "Tocineta Grande", name: "Tocineta Grande", price: 3000 },
//  { id: "Carne Desmechada", name: "Carne Desmechada", price: 3000 },
//  { id: "Pollo Desmechada", name: "Pollo Desmechada", price: 3000 },
//  { id: "Maiz", name: "Maiz", price: 3000 },
//  { id: "Champiñones", name: "Champiñones", price: 3000 },
//  { id: "Chorizo", name: "Chorizo", price: 3000 },
//  { id: "Salchicha", name: "Salchicha", price: 3000 },
//  { id: "Jamón", name: "Jamón", price: 3000 },
//  { id: "Papas Francesas pequeñas", name: "Papas Francesas pequeñas", price: 3000 },
//  { id: "Papas Francesas grandes", name: "Papas Francesas grandes", price: 7000 },
//  { id: "Papas Criollas pequeñas", name: "Papas Criollas pequeñas", price: 3000 },
//  { id: "Papas Criollas grandes", name: "Papas Criollas grandes", price: 7000 },
//  { id: "Yucas pequeñas", name: "Yucas pequeñas", price: 3000 },
//  { id: "Yucas grandes", name: "Papas Francesas grandes", price: 7000 },
//  { id: "Medio Chicharrón", name: "Medio Chicharrón", price: 8000 },
// ];


// hooks/useSalesFormLogic.js
const useSalesFormLogic = (saleId) => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [tableNumber, setTableNumber] = useState("");
  const [saleStatus, setSaleStatus] = useState("en proceso");
  const [game, setGame] = useState("");
  const [generalObservation, setGeneralObservation] = useState("");
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availableGames, setAvailableGames] = useState([]);
  const [ipPrint, setIpPrint] = useState({ ip: '' });
  // *** NUEVO: Estado para las adiciones cargadas de la DB ***
  const [availableFetchedAdditions, setAvailableFetchedAdditions] = useState([]);

  const isEditing = !!saleId;

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Cargar productos (todos los productos)
      const productsRes = await fetch("/api/product");
      if (!productsRes.ok) throw new Error('Error cargando productos');
      const productsData = await productsRes.json();
      if (!Array.isArray(productsData)) throw new Error('Formato de productos inválido');
      setAvailableProducts(productsData);

      // 2. Cargar IP de impresora
      const ipRes = await fetch('/api/print-ip');
      if (!ipRes.ok) throw new Error('Error cargando IP');
      const ipData = await ipRes.json();
      setIpPrint({ ip: ipData.ip || '' });

      // 3. Cargar Juegos de Mesa desde la API
      const gamesRes = await fetch('/api/game');
      if (!gamesRes.ok) throw new Error('Error cargando juegos');
      const gamesData = await gamesRes.json();
      if (!Array.isArray(gamesData)) throw new Error('Formato de juegos inválido');
      setAvailableGames(gamesData);

      // 4. *** NUEVO: Cargar Adiciones desde la API (filtrando por categoría) ***
      const additionsRes = await fetch('/api/product?category=adiciones'); // Asume que tu API de producto puede filtrar por categoría
      if (!additionsRes.ok) throw new Error('Error cargando adiciones');
      const additionsData = await additionsRes.json();
      if (!Array.isArray(additionsData)) throw new Error('Formato de adiciones inválido');
      setAvailableFetchedAdditions(additionsData); // Guarda las adiciones en el estado

      // 5. Si es edición, cargar datos de la venta específica
      if (saleId) {
        const numericId = Number(saleId);
        const saleRes = await fetch(`/api/sale/${numericId}`);
        if (!saleRes.ok) throw new Error('Error cargando venta');
        const saleData = await saleRes.json();

        if (!saleData?.products) throw new Error('Estructura de datos de venta inválida');

        const mappedProducts = saleData.products.map(p => ({
          ...p,
          additions: p.additions?.map(a => ({
            id: a.id || a.name,
            name: a.name,
            price: a.price
          })) || [],
          observation: p.observation || "",
          quantity: p.quantity || 1
        }));

        setProducts(mappedProducts);
        setTableNumber(saleData.table?.toString() || "");
        setSaleStatus(saleData.status || "en proceso");
        setGeneralObservation(saleData.generalObservation || "");
        setGame(saleData.gameId?.toString() || "");
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      setError(error.message || 'Error cargando datos iniciales');
    } finally {
      setIsLoading(false);
    }
  }, [saleId]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);


  const calculateTotal = () =>
    products.reduce(
      (total, p) =>
        total +
        (p.price + (p.additions?.reduce((s, a) => s + a.price, 0) || 0)) *
        (p.quantity || 1),
      0
    );

  const formatTicket = () => {
    const date = new Date();
    let ticket = `Hierba Mala Gastrobar\n`;
    ticket += `*** ${date.toLocaleDateString("es-CO")} ${date.toLocaleTimeString(
      "es-CO"
    )} ***\n`;
    ticket += `Mesa: ${tableNumber}\n`;
    ticket += `Juego: ${availableGames.find((g) => g.id.toString() === game)?.name || "N/A"
      }\n`;
    ticket += `------------------------------------------\nCant\t Productos\n`;

    const grouped = products.reduce((acc, p) => {
      acc[p.name] = acc[p.name] || [];
      acc[p.name].push(p);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([name, group]) => {
      ticket += `${group.length} ${name}\n`;
      group.forEach((p, i) => {
        const price =
          p.price + (p.additions?.reduce((s, a) => s + a.price, 0) || 0);
        ticket += `\t|${i + 1}. $${price.toLocaleString()} (${p.observation ||
          "sin observaciones"})\n`;
        p.additions?.forEach((a) => {
          ticket += `\t\t+ ${a.name} ($${a.price})\n`;
        });
      });
    });

    ticket += `------------------------------------------\n`;
    ticket += `\t\t\t\tTotal: $${calculateTotal().toLocaleString()}\n`;

    return ticket;
  };
  return {
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
    // REMPLAZAMOS EL ARRAY HARCODEADO POR LAS ADICIONES CARGADAS DE LA DB
    availableAdditions: availableFetchedAdditions, // <-- ¡Cambio aquí!
    availableGames,
    calculateTotal,
    formatTicket,
    ipPrint,
  };
};

export default useSalesFormLogic;