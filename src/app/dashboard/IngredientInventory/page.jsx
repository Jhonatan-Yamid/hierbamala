"use client";

import React, { useState, useEffect, useMemo } from "react";

const IngredientInventory = () => {
  const [ingredients, setIngredients] = useState([]);
  const [groupedIngredients, setGroupedIngredients] = useState({});
  const [modifiedFields, setModifiedFields] = useState(new Map());
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsed, setCollapsed] = useState({});

  const daysAgo = (date) => {
    const today = new Date();
    const lastUpdated = new Date(date);
    today.setHours(0, 0, 0, 0);
    lastUpdated.setHours(0, 0, 0, 0);
    return Math.floor((today - lastUpdated) / (1000 * 3600 * 24));
  };

  // =========================================================
  // FETCH INITIAL DATA
  // =========================================================
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

          // Inicializa todas colapsadas
          const initState = {};
          Object.keys(grouped).forEach((o) => (initState[o] = true));
          setCollapsed(initState);
        }
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchIngredients();
  }, []);

  // =========================================================
  // FILTER by search
  // =========================================================
  const filteredGrouped = useMemo(() => {
    const lower = searchTerm.toLowerCase();

    const result = {};

    Object.keys(groupedIngredients).forEach((origin) => {
      result[origin] = groupedIngredients[origin].filter((ing) =>
        ing.name.toLowerCase().includes(lower)
      );
    });

    return result;
  }, [searchTerm, groupedIngredients]);

  // =========================================================
  // AUTO EXPAND/COLLAPSE on search
  // =========================================================
useEffect(() => {
  if (searchTerm.trim() === "") {
    // 🔒 Colapsar todo
    const allClosed = {};
    Object.keys(groupedIngredients).forEach(
      (origin) => (allClosed[origin] = true)
    );
    setCollapsed(allClosed);
    return;
  }

  // 🔓 Expandir solo categorías con coincidencias
  const expanded = {};
  Object.keys(groupedIngredients).forEach((origin) => {
    expanded[origin] = groupedIngredients[origin].some((ing) =>
      ing.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
      ? false
      : true;
  });

  setCollapsed(expanded);
}, [searchTerm]);


  // =========================================================
  // HANDLE CHANGE & BLUR
  // =========================================================
const handleQuantityChange = (e, ingredientId) => {
  const newValue = e.target.value;

  setIngredients((prev) =>
    prev.map((ingredient) =>
      ingredient.id === ingredientId
        ? { ...ingredient, quantity: newValue }
        : ingredient
    )
  );

  // 🔥 SINCRONIZA groupedIngredients
  setGroupedIngredients((prev) => {
    const updated = {};
    Object.keys(prev).forEach((origin) => {
      updated[origin] = prev[origin].map((ingredient) =>
        ingredient.id === ingredientId
          ? { ...ingredient, quantity: newValue }
          : ingredient
      );
    });
    return updated;
  });

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

  const parsedValue =
    finalValue === "Insuficiente"
      ? null
      : parseFloat(finalValue) || 0;

  setIngredients((prev) =>
    prev.map((ingredient) =>
      ingredient.id === ingredientId
        ? { ...ingredient, quantity: parsedValue }
        : ingredient
    )
  );

  // 🔥 SINCRONIZA groupedIngredients
  setGroupedIngredients((prev) => {
    const updated = {};
    Object.keys(prev).forEach((origin) => {
      updated[origin] = prev[origin].map((ingredient) =>
        ingredient.id === ingredientId
          ? { ...ingredient, quantity: parsedValue }
          : ingredient
      );
    });
    return updated;
  });
};


  // =========================================================
  // SUBMIT
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const modifiedData = Array.from(modifiedFields.entries())
      .filter(([, modified]) => modified)
      .map(([id]) => {
        const ingredient = ingredients.find((ing) => ing.id === id);
        return { id, quantity: ingredient.quantity };
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

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-slate-200">
        Inventario de Ingredientes
      </h1>

      {/* SEARCH INPUT */}
      <input
        type="text"
        placeholder="Buscar ingrediente..."
        className="mb-6 p-2 rounded border border-white text-slate-200 bg-gray-700 w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <form onSubmit={handleSubmit} className="space-y-3">
        {Object.keys(groupedIngredients).map((origin) => {
          const ingredientsInCategory = filteredGrouped[origin];

          return (
            <div
              key={origin}
              className="p-3 rounded-lg border border-white bg-gray-950"
            >
              {/* HEADER */}
              <div
                className="flex justify-between items-center cursor-pointer py-2"
                onClick={() =>
                  setCollapsed((prev) => ({
                    ...prev,
                    [origin]: !prev[origin],
                  }))
                }
              >
                <h2 className="text-slate-200 text-md font-semibold">
                  {origin}
                </h2>

                <span className="text-slate-300 text-sm">
                  {collapsed[origin] ? "▶" : "▼"}
                </span>
              </div>

              {/* COLLAPSABLE */}
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  collapsed[origin]
                    ? "max-h-0 opacity-0"
                    : "max-h-[1500px] opacity-100"
                }`}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-2">
                  {ingredientsInCategory.length === 0 ? (
                    <p className="text-slate-500 text-sm col-span-full px-2">
                      No hay coincidencias...
                    </p>
                  ) : (
                    ingredientsInCategory.map((ingredient) => {
                      const isModified =
                        modifiedFields.get(ingredient.id) || false;

                      const daysSinceUpdate = daysAgo(ingredient.updatedAt);

                      return (
                        <div key={ingredient.id} className="flex flex-col">
                          <div className="flex justify-between items-center mb-1">
                            <div
                              className={`text-sm font-medium ${
                                isModified ? "text-red-500" : "text-slate-300"
                              }`}
                            >
                              {ingredient.name}{" "}
                              <small className="text-[0.6rem] text-slate-400">
                                {ingredient.typeUnity}
                              </small>
                            </div>

                            <small className="text-[0.65rem] text-slate-400">
                              {daysSinceUpdate === 0
                                ? "(Hoy)"
                                : `(${daysSinceUpdate} días)`}
                            </small>
                          </div>

                          <input
                            type="text"
                            value={
                              ingredient.quantity === null
                                ? "Insuficiente"
                                : ingredient.quantity
                            }
                            onChange={(e) =>
                              handleQuantityChange(e, ingredient.id)
                            }
                            onBlur={(e) =>
                              handleQuantityBlur(e, ingredient.id)
                            }
                            className={`border p-2 rounded bg-gray-700 text-slate-200 ${
                              isModified ? "border-red-500" : "border-white"
                            }`}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default IngredientInventory;
