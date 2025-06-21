// hooks/useSalesFormLogic.js
"use client";

import React, { useEffect, useState, useCallback } from "react";

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
  const [availableFetchedAdditions, setAvailableFetchedAdditions] = useState([]);
  // NUEVO: Estado para orderType
  const [orderType, setOrderType] = useState("En mesa"); // Default a "En mesa"

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

      // 4. Cargar Adiciones desde la API
      const additionsRes = await fetch('/api/product?category=adiciones');
      if (!additionsRes.ok) throw new Error('Error cargando adiciones');
      const additionsData = await additionsRes.json();
      if (!Array.isArray(additionsData)) throw new Error('Formato de adiciones inválido');
      setAvailableFetchedAdditions(additionsData);

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
            id: a.id || a.name, // Asegúrate de que el id sea adecuado para tu frontend
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
        setOrderType(saleData.orderType || "En mesa"); // NUEVO: Setear el tipo de pedido
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
    ticket += `Tipo de Pedido: ${orderType}\n`; // NUEVO: Añadir al ticket
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
    availableAdditions: availableFetchedAdditions,
    availableGames,
    calculateTotal,
    formatTicket,
    ipPrint,
    // NUEVO: Exportar orderType y setOrderType
    orderType,
    setOrderType,
  };
};

export default useSalesFormLogic;