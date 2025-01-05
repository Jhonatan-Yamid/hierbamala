"use client";

import React, { useState, useEffect } from "react";

const IngredientInventory = () => {
  const [ingredients, setIngredients] = useState([]);
  const [groupedIngredients, setGroupedIngredients] = useState({});
  const [modifiedFields, setModifiedFields] = useState(new Map()); // Map para almacenar ID y cantidad modificada
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda

  // Obtener la fecha actual
  const getCurrentDate = () => new Date().toISOString().split("T")[0]; // Solo fecha, sin hora

  // Calcular la diferencia en días
  const daysAgo = (date) => {
    const today = new Date(); // Fecha actual
    const lastUpdated = new Date(date); // Fecha de última actualización

    // Ajustar ambas fechas al inicio del día (00:00:00)
    today.setHours(0, 0, 0, 0);
    lastUpdated.setHours(0, 0, 0, 0);

    // Calcular la diferencia en milisegundos
    const diffTime = today - lastUpdated;

    // Calcular la diferencia en días
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

    return diffDays;
  };

  // Fetch ingredients from the API
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch("/api/ingredient");
        const data = await response.json();
        setIngredients(data);

        // Agrupar ingredientes por origen
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

  // Actualizar la cantidad de un ingrediente
  const handleQuantityChange = (e, ingredientId) => {
    const newQuantity = e.target.value ? parseInt(e.target.value, 10) : 0;

    // Actualizar ingredientes
    setIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.id === ingredientId
          ? { ...ingredient, quantity: newQuantity }
          : ingredient
      )
    );

    // Marcar como modificado
    setModifiedFields((prev) => {
      const updated = new Map(prev);
      updated.set(ingredientId, newQuantity);
      return updated;
    });

    // Reagrupar los ingredientes para forzar re-renderización
    setGroupedIngredients((prev) => {
      const updatedGrouped = { ...prev };
      Object.keys(updatedGrouped).forEach((origin) => {
        updatedGrouped[origin] = updatedGrouped[origin].map((ingredient) =>
          ingredient.id === ingredientId
            ? { ...ingredient, quantity: newQuantity }
            : ingredient
        );
      });
      return updatedGrouped;
    });
  };

  // Filtrar los ingredientes por nombre según el término de búsqueda
  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Enviar datos al backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Preparar solo los ingredientes modificados
    const modifiedData = Array.from(modifiedFields.entries()).map(([id, quantity]) => ({
      id,
      quantity,
    }));

    try {
      const response = await fetch("/api/ingredient", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modifiedData),
      });

      if (response.ok) {
        alert("Inventario actualizado exitosamente.");
        window.location.reload(); // Opcional: Recargar la página
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

      {/* Campo de búsqueda */}
      <input
        type="text"
        placeholder="Buscar ingrediente..."
        className="mb-6 p-2 rounded border border-white text-slate-200 bg-gray-700"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} // Actualizar el término de búsqueda
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {Object.keys(groupedIngredients).map((origin) => (
          <div
            key={origin}
            className="relative p-4 rounded-lg border border-white bg-gray-950 mb-6"
          >
            {/* Título de la sección en una línea separada */}
            <div className="mb-3">
              <h2 className="text-slate-200 text-xl font-semibold">{origin}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredIngredients
                .filter((ingredient) => ingredient.Origin === origin) // Filtrar por origen
                .map((ingredient) => {
                  const lastUpdated = ingredient.updatedAt;
                  const daysSinceUpdate = daysAgo(lastUpdated);
                  return (
                    <div key={ingredient.id} className="flex flex-col">
                      <label
                        className={`text-sm font-medium mb-1 ${
                          modifiedFields.has(ingredient.id)
                            ? "text-red-500"
                            : "text-slate-300"
                        }`}
                      >
                        {ingredient.name}{" "}
                        <small className="text-[0.6rem] font-normal text-slate-400">
                          {daysSinceUpdate === 0
                            ? "(Hoy)"
                            : `(Hace ${daysSinceUpdate} día${
                                daysSinceUpdate > 1 ? "s)" : ")"
                              }`}
                        </small>
                      </label>
                      <input
                        type="number"
                        value={ingredient.quantity || ""}
                        onChange={(e) => handleQuantityChange(e, ingredient.id)}
                        className="border border-white p-2 rounded bg-gray-700 text-slate-200"
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
