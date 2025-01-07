"use client";

import React, { useState, useEffect } from "react";

const IngredientInventory = () => {
  const [ingredients, setIngredients] = useState([]);
  const [groupedIngredients, setGroupedIngredients] = useState({});
  const [modifiedFields, setModifiedFields] = useState(new Map());
  const [searchTerm, setSearchTerm] = useState("");

  const getCurrentDate = () => new Date().toISOString().split("T")[0];

  const daysAgo = (date) => {
    const today = new Date();
    const lastUpdated = new Date(date);
    today.setHours(0, 0, 0, 0);
    lastUpdated.setHours(0, 0, 0, 0);
    return Math.floor((today - lastUpdated) / (1000 * 3600 * 24));
  };

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch("/api/ingredient");
        const data = await response.json();
        if (Array.isArray(data)) {
          setIngredients(data);

          const grouped = data.reduce((acc, ingredient) => {
            const { Origin } = ingredient;
            if (!acc[Origin]) acc[Origin] = [];
            acc[Origin].push(ingredient);
            return acc;
          }, {});
          setGroupedIngredients(grouped);
        } else {
          console.error("El formato de los datos no es válido:", data);
        }
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };
    fetchIngredients();
  }, []);

  const handleQuantityChange = (e, ingredientId) => {
    const newValue = e.target.value;

    setIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.id === ingredientId
          ? { ...ingredient, quantity: newValue }
          : ingredient
      )
    );

    setGroupedIngredients((prev) => {
      const updatedGrouped = { ...prev };
      Object.keys(updatedGrouped).forEach((origin) => {
        updatedGrouped[origin] = updatedGrouped[origin].map((ingredient) =>
          ingredient.id === ingredientId
            ? { ...ingredient, quantity: newValue }
            : ingredient
        );
      });
      return updatedGrouped;
    });

    // Marcar como modificado
    setModifiedFields((prev) => {
      const updated = new Map(prev);
      updated.set(ingredientId, true);
      return updated;
    });
  };

  const handleQuantityBlur = (e, ingredientId) => {
    const finalValue = e.target.value.trim();

    if (!/^(\d+(\.\d{0,2})?|Insuficiente)?$/.test(finalValue)) {
      alert("Por favor, ingresa un valor válido (número o 'Insuficiente').");
      return;
    }

    setIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.id === ingredientId
          ? {
              ...ingredient,
              quantity: finalValue === "Insuficiente" ? null : parseFloat(finalValue) || 0,
            }
          : ingredient
      )
    );

    setModifiedFields((prev) => {
      const updated = new Map(prev);
      updated.set(ingredientId, true);
      return updated;
    });

    setGroupedIngredients((prev) => {
      const updatedGrouped = { ...prev };
      Object.keys(updatedGrouped).forEach((origin) => {
        updatedGrouped[origin] = updatedGrouped[origin].map((ingredient) =>
          ingredient.id === ingredientId
            ? {
                ...ingredient,
                quantity: finalValue === "Insuficiente" ? null : parseFloat(finalValue) || 0,
              }
            : ingredient
        );
      });
      return updatedGrouped;
    });
  };

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const modifiedData = Array.from(modifiedFields.entries())
      .filter(([, modified]) => modified)
      .map(([id]) => {
        const ingredient = ingredients.find((ing) => ing.id === id);
        return {
          id,
          quantity: ingredient.quantity,
        };
      });

    try {
      const response = await fetch("/api/ingredient", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modifiedData),
      });

      if (response.ok) {
        alert("Inventario actualizado exitosamente.");
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error enviando datos:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-slate-200">
        Inventario de Ingredientes
      </h1>
      <input
        type="text"
        placeholder="Buscar ingrediente..."
        className="mb-6 p-2 rounded border border-white text-slate-200 bg-gray-700"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        {Object.keys(groupedIngredients).map((origin) => (
          <div
            key={origin}
            className="relative p-4 rounded-lg border border-white bg-gray-950 mb-6"
          >
            <div className="mb-3">
              <h2 className="text-slate-200 text-xl font-semibold">{origin}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredIngredients
                .filter((ingredient) => ingredient.Origin === origin)
                .map((ingredient) => {
                  const isModified = modifiedFields.get(ingredient.id) || false;
                  const lastUpdated = ingredient.updatedAt;
                  const daysSinceUpdate = daysAgo(lastUpdated);
                  return (
                    <div key={ingredient.id} className="flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <div className={`text-sm font-medium ${
                          isModified ? "text-red-500" : "text-slate-300"
                        } `}>
                          {ingredient.name}{" "}
                          <small className="text-[0.6rem] font-normal text-slate-400">
                            {ingredient.typeUnity}
                          </small>
                        </div>
                        <div className="text-xs text-gray-400">
                          <small className="text-[0.6rem] font-normal text-slate-400">
                            {daysSinceUpdate === 0
                              ? "(Hoy)"
                              : `(Hace ${daysSinceUpdate} día${
                                  daysSinceUpdate > 1 ? "s)" : ")"
                                }`}
                          </small>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={
                          ingredient.quantity === null
                            ? "Insuficiente"
                            : ingredient.quantity
                        }
                        onChange={(e) => handleQuantityChange(e, ingredient.id)}
                        onBlur={(e) => handleQuantityBlur(e, ingredient.id)}
                        placeholder="Número o Insuficiente"
                        className={`border p-2 rounded bg-gray-700 text-slate-200 ${
                          isModified ? "border-red-500" : "border-white"
                        }`}
                      />
                    </div>
                  );
                })}
            </div>
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
