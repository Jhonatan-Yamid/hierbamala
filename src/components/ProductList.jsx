"use client";
import React from "react";

const ProductList = ({ products, setProducts, availableAdditions, availableProducts }) => {
  const updateQuantity = (productId, newQty) => {
    setProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== productId);
      const instances = prev.filter((p) => p.id === productId);
      if (newQty > instances.length) {
        const more = Array(newQty - instances.length).fill(null).map(() => ({
          ...instances[0],
          observation: "",
        }));
        return [...filtered, ...instances, ...more];
      } else {
        return [...filtered, ...instances.slice(0, newQty)];
      }
    });
  };

  const updateObservation = (index, value) => {
    const copy = [...products];
    copy[index].observation = value;
    setProducts(copy);
  };

  const handleAdditionSearch = (productIndex, searchTerm) => {
    setProducts((prev) => {
      const newProducts = [...prev];
      newProducts[productIndex].additionSearchTerm = searchTerm;
      newProducts[productIndex].additionSuggestions = availableAdditions.filter((a) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return newProducts;
    });
  };

  const addAdditionToProduct = (index, addition) => {
    setProducts((prev) => {
      const newProducts = [...prev];
      const product = newProducts[index];
      newProducts[index] = {
        ...product,
        additions: [...(product.additions || []), addition],
        additionSearchTerm: "",
        additionSuggestions: [],
      };
      return newProducts;
    });
  };

  const removeAddition = (productIndex, additionIndex) => {
    setProducts((prev) => {
      const copy = [...prev];
      copy[productIndex].additions.splice(additionIndex, 1);
      return copy;
    });
  };

  const removeProduct = (index) => {
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold">Productos Añadidos</h3>
      {availableProducts.map((product) => {
        const instances = products.filter((p) => p.id === product.id);
        if (instances.length === 0) return null;
        return (
          <div key={product.id} className="p-2 mt-2 bg-gray-900 border border-gray-700 rounded-md">
            <p>{product.name} (${product.price} c/u)</p>
            <input
              type="number"
              min="1"
              value={instances.length}
              onChange={(e) => updateQuantity(product.id, parseInt(e.target.value))}
              className="w-16 p-1 mt-1 bg-gray-800 border border-gray-700 rounded-md"
            />
            {instances.map((instance, index) => (
              <div key={index} className="mt-2">
                <input
                  type="text"
                  placeholder="Observaciones"
                  value={instance.observation}
                  onChange={(e) => updateObservation(products.indexOf(instance), e.target.value)}
                  className="w-full p-1 bg-gray-800 border border-gray-700 rounded-md"
                />
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Buscar adición..."
                    className="w-full p-1 bg-gray-800 border border-gray-700 rounded-md mt-1"
                    onChange={(e) => handleAdditionSearch(products.indexOf(instance), e.target.value)}
                    value={instance.additionSearchTerm || ""}
                  />
                  {instance.additionSuggestions?.length > 0 && (
                    <ul className="mt-1 bg-gray-800 border border-gray-700 rounded-md max-h-40 overflow-y-auto">
                      {instance.additionSuggestions.map((add, i) => (
                        <li
                          key={add.id + i}
                          onClick={() => addAdditionToProduct(products.indexOf(instance), add)}
                          className="p-2 hover:bg-gray-700 cursor-pointer"
                        >
                          {add.name} (+${add.price})
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-2 space-y-1">
                    {instance.additions?.map((add, i) => (
                      <div
                        key={`${add.id}-${i}`}
                        className="flex justify-between items-center text-sm bg-gray-800 p-1 rounded-md"
                      >
                        <span>{add.name} (+${add.price})</span>
                        <button
                          type="button"
                          onClick={() => removeAddition(products.indexOf(instance), i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(products.indexOf(instance))}
                  className="text-red-500 hover:underline ml-2 text-2xl"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default ProductList;
