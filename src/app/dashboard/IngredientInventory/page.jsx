"use client";

import React, { useState, useEffect } from "react";

const IngredientInventory = () => {
  const [ingredients, setIngredients] = useState([]);
  const [groupedIngredients, setGroupedIngredients] = useState({});

  // Fetch ingredients from the API
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch("/api/ingredient");
        const data = await response.json();
        setIngredients(data);

        // Group ingredients by Origin
        const grouped = data.reduce((acc, ingredient) => {
          const { Origin } = ingredient;
          if (!acc[Origin]) acc[Origin] = [];
          acc[Origin].push(ingredient);
          return acc;
        }, {});
        setGroupedIngredients(grouped);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchIngredients();
  }, []);
    // Function to group ingredients by origin
    const groupIngredientsByOrigin = (ingredients) => {
      return ingredients.reduce((acc, ingredient) => {
        const { Origin } = ingredient;
        if (!acc[Origin]) acc[Origin] = [];
        acc[Origin].push(ingredient);
        return acc;
      }, {});
    };

  // Update a specific ingredient's quantity
  const handleQuantityChange = (e, ingredientId) => {
    const newQuantity = e.target.value ? parseInt(e.target.value, 10) : 0; // Ensure it's a number or 0

    // Update ingredients state
    const updatedIngredients = ingredients.map((ingredient) =>
      ingredient.id === ingredientId
        ? { ...ingredient, quantity: newQuantity }
        : ingredient
    );
    setIngredients(updatedIngredients);

    // Re-group ingredients by origin after quantity change
    const updatedGroupedIngredients = groupIngredientsByOrigin(updatedIngredients);
    setGroupedIngredients(updatedGroupedIngredients);
  };

  // Submit updated ingredients to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedIngredients = ingredients.map(({ id, quantity }) => ({
      id,
      quantity,
    }));

    try {
      const response = await fetch("/api/ingredient", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedIngredients),
      });

      if (response.ok) {
        alert("Inventario actualizado exitosamente.");
      } else {
        alert("Error actualizando inventario.");
      }
    } catch (error) {
      console.error("Error submitting updated quantities:", error);
    }
  };

  return (
    <div className="p-4">
    <h1 className="text-2xl font-bold mb-4 text-slate-200">Inventario de Ingredientes</h1>
    <form onSubmit={handleSubmit} className="space-y-6">
      {Object.keys(groupedIngredients).map((origin) => (
        <div key={origin} className="relative flex p-4 rounded-lg border border-white bg-gray-950">
          <h2 className="text-slate-200 text-xl font-semibold mr-4">{origin}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {groupedIngredients[origin].map((ingredient) => (
              <div key={ingredient.id} className="flex flex-col">
                <label className="text-sm font-medium mb-1 text-slate-300">
                  {ingredient.name}
                </label>
                <input
                  type="number"
                  value={ingredient.quantity || ""} // Cambié "0" por una cadena vacía
                  onChange={(e) => handleQuantityChange(e, ingredient.id)}
                  className="border border-white p-2 rounded bg-gray-700 text-slate-200"
                />
              </div>
            ))}
          </div>
          {/* Botón de eliminar en la esquina superior derecha */}
          <button
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-200 text-3xl"
            onClick={() => handleDelete(ingredient.id)}
          >
            &times;
          </button>
        </div>
      ))}
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Enviar
      </button>
    </form>
  </div>
  
  );
};

export default IngredientInventory;
