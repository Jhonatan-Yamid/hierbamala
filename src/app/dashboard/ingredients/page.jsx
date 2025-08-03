"use client";

import IngredientForm from "./IngredientForm";
import { useState, useEffect } from "react";
import IngredientItem from "./IngredientItem";

function IngredientTable() {
  const [ingredients, setIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [isNewIngredient, setIsNewIngredient] = useState(false);

  // Obtener ingredientes
  useEffect(() => {
    fetch("/api/ingredient")
      .then((res) => res.json())
      .then((data) => {
        setIngredients(data);
        setFilteredIngredients(data); // Para mostrar inicialmente todos
      })
      .catch((error) => {
        console.error("Error al obtener los datos del servidor:", error);
      });
  }, []);

  // Filtrar ingredientes según el término de búsqueda
  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = ingredients.filter((ingredient) =>
      ingredient.name.toLowerCase().includes(lowerTerm)
    );
    setFilteredIngredients(filtered);
  }, [searchTerm, ingredients]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch("/api/ingredient", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        const updated = ingredients.filter((ingredient) => ingredient.id !== id);
        setIngredients(updated);
      } else {
        console.error("Error al eliminar:", response.statusText);
      }
    } catch (error) {
      console.error("Error al eliminar:", error.message);
    }
  };

  const handleEdit = (ingredient) => {
    setEditingIngredient(ingredient);
    setIsNewIngredient(false);
  };

  const handleNewIngredient = () => {
    setEditingIngredient(null);
    setIsNewIngredient(true);
  };

  const handleEditFormSubmit = async (editedIngredient) => {
    try {
      const response = await fetch("/api/ingredient", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editedIngredient, actualizar: true }),
      });

      if (response.ok) {
        const updatedIngredient = await response.json();
        const updatedIngredients = ingredients.map((ingredient) =>
          ingredient.id === updatedIngredient.id ? updatedIngredient : ingredient
        );
        setIngredients(updatedIngredients);
        setEditingIngredient(updatedIngredient);
        setIsNewIngredient(false);
      } else {
        console.error("Error al editar:", response.statusText);
      }
    } catch (error) {
      console.error("Error al editar:", error.message);
    }
  };

  const handleNewIngredientFormSubmit = async (newIngredient) => {
    try {
      const response = await fetch("/api/ingredient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIngredient),
      });

      if (response.ok) {
        const createdIngredient = await response.json();
        setIngredients([...ingredients, createdIngredient]);
        setIsNewIngredient(false);
        setEditingIngredient(null);
      } else {
        console.error("Error al crear:", response.statusText);
      }
    } catch (error) {
      console.error("Error al crear:", error.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-slate-200 font-semibold text-3xl">Ingredientes</h1>
        <button
          className="bg-gray-800 text-gray-200 flex items-center rounded-md px-4 py-1 hover:bg-gray-600 hover:text-white"
          onClick={handleNewIngredient}
        >
          Nuevo +
        </button>
      </div>

      {/* 🔍 Input de búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar ingrediente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-400 text-gray-900"
        />
      </div>

      {/* Formulario dinámico */}
      {(editingIngredient !== null || isNewIngredient) && (
        <IngredientForm
          key={editingIngredient?.id || "new"}
          ingredient={editingIngredient || null}
          onSubmit={
            isNewIngredient
              ? handleNewIngredientFormSubmit
              : handleEditFormSubmit
          }
          isNewIngredient={isNewIngredient}
        />
      )}

      {/* Listado filtrado */}
      <div className="flex flex-col gap-4 border-solid border rounded-md border-gray-600 p-5">
        <h1 className="text-slate-200 font-medium text-xl">Listado Actualizado</h1>
        {filteredIngredients.map((ingredient) => (
          <IngredientItem
            key={ingredient.id}
            ingredient={ingredient}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default IngredientTable;
