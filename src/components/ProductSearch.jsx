"use client";
import React from "react";

const ProductSearch = ({
  searchTerm,
  setSearchTerm,
  suggestions,
  setSuggestions,
  availableProducts,
  setProducts,
}) => {
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 0) {
      const filtered = availableProducts.filter((product) =>
        product.name.toLowerCase().includes(term.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const addProduct = (product) => {
    setProducts((prev) => [
      ...prev,
      { ...product, observation: "", quantity: 1, additions: [] },
    ]);
    setSearchTerm("");
    setSuggestions([]);
  };

  return (
    <div>
      <label htmlFor="productSearch" className="block text-sm font-medium">
        Buscar Producto
      </label>
      <input
        type="text"
        id="productSearch"
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded-md"
        placeholder="Escribe para buscar productos..."
      />
      {suggestions.length > 0 && (
        <ul className="mt-2 bg-gray-800 border border-gray-700 rounded-md">
          {suggestions.map((product) => (
            <li
              key={product.id}
              onClick={() => addProduct(product)}
              className="p-2 hover:bg-gray-700 cursor-pointer"
            >
              {product.name} - ${product.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductSearch;
