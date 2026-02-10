"use client";
import React, { useEffect, useState } from "react";

/**
 * ProductSearch
 * - mantiene la misma API que usas
 * - devuelve sugerencias en una lista estilizada
 */
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

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 0) {
      const filtered = availableProducts.filter((product) =>
        product.name.toLowerCase().includes(term.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const addProduct = (product) => {
    // añade una instancia (sin duplicar el objeto original)
    setProducts(prev => [...prev, { id: product.id, name: product.name, price: product.price, observation: "", additions: [] }]);
    setSearchTerm("");
    setSuggestions([]);
  };

  return (
    <div className="w-full">
      <label htmlFor="productSearch" className="block text-sm font-medium text-gray-300">Buscar Producto</label>
      <div className="relative mt-2">
        <input
          type="text"
          id="productSearch"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-3 bg-[#050607] border border-gray-800 rounded-xl placeholder:text-gray-500 focus:ring-1 focus:ring-emerald-500"
          placeholder="Escribe para buscar productos..."
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-30 left-0 right-0 mt-2 bg-[#040506] border border-gray-800 rounded-xl shadow-xl max-h-56 overflow-y-auto">
            {suggestions.map(product => (
              <li
                key={product.id}
                onClick={() => addProduct(product)}
                className="p-3 hover:bg-gray-900 cursor-pointer flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-gray-400">
                    {product.category || "Sin categoría"}
                    {beerStock[product.id] !== undefined && (
                      <span
                        className={`ml-2 ${beerStock[product.id] > 0
                            ? "text-emerald-400"
                            : "text-red-400"
                          }`}
                      >
                        • Stock: {beerStock[product.id]}
                      </span>
                    )}

                  </div>
                </div>

                <div className="text-sm text-gray-300">
                  {new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  }).format(product.price)}
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
