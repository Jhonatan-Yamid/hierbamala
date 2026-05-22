"use client";
import React, { useEffect, useState } from "react";

const ProductSearch = ({ searchTerm, setSearchTerm, suggestions, setSuggestions, availableProducts, setProducts }) => {

  const [beerStock, setBeerStock] = useState({});

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

  const addProduct = (product) => {
    // IMPORTANTE: Usamos una función de actualización para asegurar que siempre 
    // tenemos el estado más reciente de la lista de productos (vital para scanners rápidos)
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
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    

    if (term.length > 0) {
      const cleanTerm = term.trim();

      // 1. PRIORIDAD SCANNER: 
      // Agregamos .toLowerCase() y comprobamos que barcode exista
      const exactMatch = availableProducts.find(
        (p) => p.barcode && p.barcode.toString().trim().toLowerCase() === cleanTerm.toLowerCase()
      );

      if (exactMatch) {
        addProduct(exactMatch);
        return; 
      }

      // 2. BÚSQUEDA MANUAL
      const filtered = availableProducts.filter((p) =>
        p.name.toLowerCase().includes(cleanTerm.toLowerCase()) ||
        (p.barcode && p.barcode.toString().includes(cleanTerm))
      ).slice(0, 8);

      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // Función manejadora para presionar Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Evita que se envíe un formulario padre
      
      const cleanTerm = searchTerm.trim().toLowerCase();
      console.log(availableProducts)
      if (cleanTerm.length > 0) {
        // Busca una coincidencia exacta por código de barras
        const exactMatch = availableProducts.find(
          (p) => p.barcode && p.barcode.toString().trim().toLowerCase() === cleanTerm
        );

        if (exactMatch) {
          addProduct(exactMatch);
        }
      }
    }
  };

  return (
    <div className="w-full">
      <label htmlFor="productSearch" className="block text-sm font-medium text-gray-300">Buscar Producto</label>
      <div className="relative mt-2">
        <input
          type="text"
          id="productSearch"
          value={searchTerm}
          autoComplete="off" // Evita sugerencias del navegador
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown} // Asignamos la nueva función aquí
          className="w-full p-3 bg-[#050607] border border-gray-800 rounded-xl placeholder:text-gray-500 focus:ring-1 focus:ring-emerald-500 text-white"
          placeholder="Escribe o escanea un producto..."
          autoFocus // Útil para que el scanner funcione de inmediato
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-30 left-0 right-0 mt-2 bg-[#040506] border border-gray-800 rounded-xl shadow-xl max-h-56 overflow-y-auto border-emerald-500/20">
            {suggestions.map(product => (
              <li
                key={product.id}
                onClick={() => addProduct(product)}
                className="p-3 hover:bg-gray-900 cursor-pointer flex justify-between items-center border-b border-gray-800/50 last:border-0"
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