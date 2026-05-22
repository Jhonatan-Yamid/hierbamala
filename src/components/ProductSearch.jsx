"use client";
import React, { useEffect, useState, useRef } from "react";

const ProductSearch = ({ searchTerm, setSearchTerm, suggestions, setSuggestions, availableProducts, setProducts, businessType }) => {
  const [beerStock, setBeerStock] = useState({});
  // 1. Estado para controlar el índice seleccionado con las flechas
  const [activeIndex, setActiveIndex] = useState(-1);
  
  // 2. Referencia para el input de búsqueda
  const inputRef = useRef(null);

  const isFruver = businessType === "fruver";

  useEffect(() => {
    fetch("/api/products/search")
      .then(res => res.json())
      .then(data => {
        const map = {};
        data.forEach(b => {
          map[b.id] = b.stock;
        });
        setBeerStock(map);
      })
      .catch(() => { });
  }, []);

  // Reiniciar el índice seleccionado cada vez que cambien las sugerencias
  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  const addProduct = (product) => {
    setProducts((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === product.id);

      if (existingIndex !== -1) {
        const updatedProducts = [...prev];
        const currentQty = Number(updatedProducts[existingIndex].quantity || 1);
        updatedProducts[existingIndex] = {
          ...updatedProducts[existingIndex],
          quantity: currentQty + 1,
        };
        return updatedProducts;
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          observation: "",
          additions: [],
        },
      ];
    });

    setSearchTerm("");
    setSuggestions([]);

    // 3. ENFOQUE AUTOMÁTICO: Solo si se cumple tu condición de negocio
    if (isFruver && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 0) {
      const cleanTerm = term.trim();

      const exactMatch = availableProducts.find(
        (p) => p.barcode && p.barcode.toString().trim().toLowerCase() === cleanTerm.toLowerCase()
      );

      if (exactMatch) {
        addProduct(exactMatch);
        return;
      }

      const filtered = availableProducts.filter((p) =>
        p.name.toLowerCase().includes(cleanTerm.toLowerCase()) ||
        (p.barcode && p.barcode.toString().includes(cleanTerm))
      ).slice(0, 8);

      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // 4. MANEJO DE TECLADO MEJORADO (Flechas y Enter)
  const handleKeyDown = (e) => {
    // Si la condición de isFruver no se cumple, mantenemos el comportamiento básico que ya tenías
    if (!isFruver) {
      if (e.key === "Enter") {
        e.preventDefault();
        const cleanTerm = searchTerm.trim().toLowerCase();
        if (cleanTerm.length > 0) {
          const exactMatch = availableProducts.find(
            (p) => p.barcode && p.barcode.toString().trim().toLowerCase() === cleanTerm
          );
          if (exactMatch) addProduct(exactMatch);
        }
      }
      return;
    }

    // Comportamiento inteligente con Flechas y Enter (Solo para isFruver)
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prevIndex) => 
          prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prevIndex) => 
          prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        // Si hay un elemento seleccionado en la lista con las flechas, lo agrega
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          addProduct(suggestions[activeIndex]);
        } else {
          // Si no hay ninguno seleccionado con flechas, busca por código de barras exacto como antes
          const cleanTerm = searchTerm.trim().toLowerCase();
          if (cleanTerm.length > 0) {
            const exactMatch = availableProducts.find(
              (p) => p.barcode && p.barcode.toString().trim().toLowerCase() === cleanTerm
            );
            if (exactMatch) addProduct(exactMatch);
          }
        }
      }
    } else if (e.key === "Enter") {
      // Si no hay sugerencias, comportamiento por defecto de Enter
      e.preventDefault();
      const cleanTerm = searchTerm.trim().toLowerCase();
      if (cleanTerm.length > 0) {
        const exactMatch = availableProducts.find(
          (p) => p.barcode && p.barcode.toString().trim().toLowerCase() === cleanTerm
        );
        if (exactMatch) addProduct(exactMatch);
      }
    }
  };

  return (
    <div className="w-full">
      <label htmlFor="productSearch" className="block text-sm font-medium text-gray-300">Buscar Producto</label>
      <div className="relative mt-2">
        <input
          ref={inputRef} // 5. Asignamos la referencia al input
          type="text"
          id="productSearch"
          value={searchTerm}
          autoComplete="off"
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="w-full p-3 bg-[#050607] border border-gray-800 rounded-xl placeholder:text-gray-500 focus:ring-1 focus:ring-emerald-500 text-white"
          placeholder="Escribe o escanea un producto..."
          autoFocus
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-30 left-0 right-0 mt-2 bg-[#040506] border border-gray-800 rounded-xl shadow-xl max-h-56 overflow-y-auto border-emerald-500/20">
            {suggestions.map((product, index) => (
              <li
                key={product.id}
                onClick={() => addProduct(product)}
                // 6. Cambiamos el fondo dinámicamente si el elemento está seleccionado con las flechas
                className={`p-3 cursor-pointer flex justify-between items-center border-b border-gray-800/50 last:border-0 ${
                  index === activeIndex ? "bg-gray-800 text-white" : "hover:bg-gray-900"
                }`}
              >
                <div>
                  <div className="font-medium text-slate-200">{product.name}</div>
                  <div className="text-xs text-gray-400">
                    {product.category || "General"}
                    {beerStock[product.id] !== undefined && (
                      <span className={`ml-2 ${beerStock[product.id] > 0 ? "text-emerald-400" : "text-red-400"}`}>
                        • Stock: {beerStock[product.id]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm font-bold text-emerald-400">
                  {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(product.price)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;