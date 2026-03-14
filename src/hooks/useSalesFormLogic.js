// hooks/useSalesFormLogic.js
"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Orden de categorías ─────────────────────────────────────────────────────
const TICKET_CATEGORY_ORDER = [
  "Entradas",
  "Los Platos de la Casa",
  "Asados",
  "Hamburguesas Artesanales",
  "Bebidas Calientes",
  "Bebidas Frías y Refrescantes",
  "Cerveza Artesanal",
  "Cocktails de Autor",
  "Licores",
  "Adiciones",
  "Otros",
];

const CATEGORY_LABEL = {
  "Entradas":                       "ENTRADAS",
  "Los Platos de la Casa":          "PLATOS DE LA CASA",
  "Asados":                         "ASADOS",
  "Hamburguesas Artesanales":       "HAMBURGUESAS",
  "Bebidas Calientes":              "BEBIDAS CALIENTES",
  "Bebidas Frías y Refrescantes":   "BEBIDAS FRÍAS",
  "Cerveza Artesanal":              "CERVEZAS",
  "Cocktails de Autor":             "COCKTAILS",
  "Licores":                        "LICORES",
  "Adiciones":                      "ADICIONES",
  "Otros":                          "OTROS",
};

const formatCLP = (value) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value || 0);

/**
 * Agrupa productos idénticos (mismo id + observación + adiciones)
 * y devuelve precio correcto + categoría.
 */
function groupAndSortProducts(products, availableProducts = []) {
  const grouped = [];

  for (const p of products) {
    const template = availableProducts.find((ap) => ap.id === p.id);
    const price = p.price ?? template?.price ?? 0;
    const category = p.category ?? template?.category ?? "Otros";

    const additionsKey = JSON.stringify(
      (p.additions || []).map((a) => a.name).sort()
    );
    const key = `${p.id}||${p.observation || ""}||${additionsKey}`;

    const existing = grouped.find((g) => g._key === key);
    if (existing) {
      existing.quantity += p.quantity || 1;
    } else {
      grouped.push({
        _key: key,
        id: p.id,
        name: p.name,
        price,
        category,
        observation: p.observation || "",
        additions: p.additions || [],
        quantity: p.quantity || 1,
      });
    }
  }

  grouped.sort((a, b) => {
    const ai = TICKET_CATEGORY_ORDER.indexOf(a.category);
    const bi = TICKET_CATEGORY_ORDER.indexOf(b.category);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return grouped;
}

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
  const [availableFetchedAdditions, setAvailableFetchedAdditions] = useState([]);
  const [orderType, setOrderType] = useState("En mesa");

  const isEditing = !!saleId;

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const productsRes = await fetch("/api/product");
      if (!productsRes.ok) throw new Error("Error cargando productos");
      const productsData = await productsRes.json();
      if (!Array.isArray(productsData)) throw new Error("Formato de productos inválido");
      setAvailableProducts(productsData);

      const gamesRes = await fetch("/api/game");
      if (!gamesRes.ok) throw new Error("Error cargando juegos");
      const gamesData = await gamesRes.json();
      if (!Array.isArray(gamesData)) throw new Error("Formato de juegos inválido");
      setAvailableGames(gamesData);

      const additionsRes = await fetch("/api/product?category=adiciones");
      if (!additionsRes.ok) throw new Error("Error cargando adiciones");
      const additionsData = await additionsRes.json();
      if (!Array.isArray(additionsData)) throw new Error("Formato de adiciones inválido");
      setAvailableFetchedAdditions(additionsData);

      if (saleId) {
        const numericId = Number(saleId);
        const saleRes = await fetch(`/api/sale/${numericId}`);
        if (!saleRes.ok) throw new Error("Error cargando venta");
        const saleData = await saleRes.json();

        if (!saleData?.products) throw new Error("Estructura de datos de venta inválida");

        const mappedProducts = saleData.products.map((p) => ({
          ...p,
          additions:
            p.additions?.map((a) => ({
              id: a.id || a.name,
              name: a.name,
              price: a.price,
            })) || [],
          observation: p.observation || "",
          quantity: p.quantity || 1,
        }));

        setProducts(mappedProducts);
        setTableNumber(saleData.table?.toString() || "");
        setSaleStatus(saleData.status || "en proceso");
        setGeneralObservation(saleData.generalObservation || "");
        setGame(saleData.gameId?.toString() || "");
        setOrderType(saleData.orderType || "En mesa");
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      setError(error.message || "Error cargando datos iniciales");
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

  /**
   * Genera texto del ticket ordenado por categoría, con precios correctos.
   */
  const formatTicket = () => {
    const date = new Date();
    const sep = "─────────────────────────────────";

    let ticket = `    HIERBA MALA GASTROBAR\n`;
    ticket += `${sep}\n`;
    ticket += `Fecha: ${date.toLocaleDateString("es-CO")}  ${date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}\n`;
    ticket += `Mesa: ${tableNumber || "-"}\n`;

    const gameName = availableGames.find((g) => g.id.toString() === game)?.name;
    if (gameName) ticket += `Juego: ${gameName}\n`;
    ticket += `Tipo: ${orderType}\n`;
    ticket += `${sep}\n`;

    const grouped = groupAndSortProducts(products, availableProducts);
    let currentCategory = null;

    for (const item of grouped) {
      // Encabezado de categoría
      if (item.category !== currentCategory) {
        if (currentCategory !== null) ticket += "\n"; // espacio entre categorías
        currentCategory = item.category;
        const label = CATEGORY_LABEL[item.category] || item.category.toUpperCase();
        ticket += `  ▸ ${label}\n`;
      }

      const additionsTotal = item.additions?.reduce((s, a) => s + a.price, 0) || 0;
      const unitPrice = item.price + additionsTotal;
      const lineTotal = unitPrice * item.quantity;

      ticket += `  ${item.quantity}x ${item.name}\n`;
      ticket += `     ${formatCLP(unitPrice)} c/u  →  ${formatCLP(lineTotal)}\n`;

      if (item.observation) {
        ticket += `     ⚠ ${item.observation}\n`;
      }

      for (const a of item.additions) {
        ticket += `     + ${a.name} (${formatCLP(a.price)})\n`;
      }
    }

    ticket += `\n${sep}\n`;

    if (generalObservation) {
      ticket += `Nota: ${generalObservation}\n`;
      ticket += `${sep}\n`;
    }

    ticket += `TOTAL:  ${formatCLP(calculateTotal())}\n`;
    ticket += `${sep}\n`;

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
    orderType,
    setOrderType,
  };
};

export default useSalesFormLogic;
