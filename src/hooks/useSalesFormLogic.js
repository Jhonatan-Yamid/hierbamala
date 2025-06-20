"use client";

import React, { useEffect, useState } from "react";

const availableAdditions = [
  { id: "Queso Pequeño", name: "Queso Pequeño", price: 1500 },
  { id: "Tocineta Pequeña", name: "Tocineta Pequeña", price: 1500 },
  { id: "Queso Grande", name: "Queso Grande", price: 3000 },
  { id: "Tocineta Grande", name: "Tocineta Grande", price: 3000 },
  { id: "Carne Desmechada", name: "Carne Desmechada", price: 3000 },
  { id: "Pollo Desmechada", name: "Pollo Desmechada", price: 3000 },
  { id: "Maiz", name: "Maiz", price: 3000 },
  { id: "Champiñones", name: "Champiñones", price: 3000 },
  { id: "Chorizo", name: "Chorizo", price: 3000 },
  { id: "Salchicha", name: "Salchicha", price: 3000 },
  { id: "Jamón", name: "Jamón", price: 3000 },
  { id: "Papas Francesas pequeñas", name: "Papas Francesas pequeñas", price: 3000 },
  { id: "Papas Francesas grandes", name: "Papas Francesas grandes", price: 7000 },
  { id: "Papas Criollas pequeñas", name: "Papas Criollas pequeñas", price: 3000 },
  { id: "Papas Criollas grandes", name: "Papas Criollas grandes", price: 7000 },
  { id: "Yucas pequeñas", name: "Yucas pequeñas", price: 3000 },
  { id: "Yucas grandes", name: "Papas Francesas grandes", price: 7000 },
  { id: "Medio Chicharrón", name: "Medio Chicharrón", price: 8000 },
];

const availableGames = [
  { id: 1, name: "Cartas" },
  { id: 2, name: "Dominó" },
  { id: 3, name: "Ajedrez" },
  { id: 4, name: "Parques" },
  { id: 5, name: "UNO" },
  { id: 6, name: "Jenga" },
  { id: 7, name: "Escalera" },
  { id: 8, name: "Futbolito" },
  { id: 9, name: "Bolos" },
  { id: 10, name: "Escalera" },
  { id: 11, name: "Poker" },
  { id: 12, name: "Naipes" },
  { id: 13, name: "Catapis" },
];

// hooks/useSalesFormLogic.js
const useSalesFormLogic = (saleId) => {
  const [isLoading, setIsLoading] = useState(!!saleId); // Estado nuevo
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
  const [ipPrint, setIpPrint] = useState({ ip: '' }); 

  const isEditing = !!saleId;
  useEffect(() => {
    const loadSaleData = async () => {
      try {
        setIsLoading(true);
        const numericId = Number(saleId); // Convertir a número
        const res = await fetch(`/api/sale/${numericId}`);

        if (!res.ok) throw new Error('Error cargando venta');

        const saleData = await res.json();

        // Validación importante
        if (!saleData?.products) throw new Error('Estructura de datos inválida');

        const mappedProducts = saleData.products.map(p => ({
          ...p,
          additions: p.additions?.map(a => ({
            // Asegurar consistencia con availableAdditions
            id: a.id || a.name,
            name: a.name,
            price: a.price
          })) || [],
          observation: p.observation || "",
          quantity: p.quantity || 1
        }));

        setProducts(mappedProducts);
        setTableNumber(saleData.tableNumber?.toString() || "");
        setSaleStatus(saleData.saleStatus || "en proceso");
        setGeneralObservation(saleData.generalObservation || "");

      } catch (error) {
        console.error('Error loading sale:', error);
        setError(error.message || 'Error cargando datos de la venta');
      } finally {
        setIsLoading(false);
      }
    };

    if (saleId) loadSaleData();
  }, [saleId]);


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product");
        if (!res.ok) throw new Error('Error cargando productos');

        const data = await res.json();
        // Validación básica
        if (!Array.isArray(data)) throw new Error('Formato de productos inválido');

        setAvailableProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError('Error cargando catálogo de productos');
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const getPrintIP = async () => {
      try {
        const res = await fetch('/api/print-ip');
        if (!res.ok) throw new Error('Error cargando Ip');
        const data = await res.json();
        setIpPrint({ ip: data.ip || '' }); 
      } catch (error) {
        console.error("Error Cargando la IP", err);
        setError('Error Cargando la IP');
      }
    };
    getPrintIP();
  }, []);

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
    isLoading, // Añade esto al objeto de retorno
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
    setAvailableProducts,
    availableAdditions,
    availableGames,
    calculateTotal,
    formatTicket,
    ipPrint,
    setIpPrint
  };
};

export default useSalesFormLogic;
