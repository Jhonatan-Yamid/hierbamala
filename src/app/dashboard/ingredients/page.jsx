"use client";
import IngredientForm from "./IngredientForm";
import { useState, useEffect } from "react";
import IngredientItem from "./IngredientItem";

function IngredientTable() {
  const [ingredients, setIngredients] = useState([]);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [isNewIngredient, setIsNewIngredient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [providers, setProviders] = useState([]);

  useEffect(() => {
  fetch("/api/providers")
    .then(res => res.json())
    .then(data => setProviders(data));
}, []);

  useEffect(() => {
    fetch("/api/ingredient")
      .then((res) => res.json())
      .then((data) => {
        setIngredients(data);
      })
      .catch((error) => {
        console.error("Error al obtener los ingredientes:", error);
      });
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch("/api/ingredient", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setIngredients((prev) => prev.filter((ing) => ing.id !== id));
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...editedIngredient, actualizar: true }),
      });

      if (response.ok) {
        const updated = await response.json();
        setIngredients((prev) =>
          prev.map((ing) => (ing.id === updated.id ? updated : ing))
        );
        setEditingIngredient(updated);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newIngredient),
      });
      if (response.ok) {
        const created = await response.json();
        setIngredients((prev) => [...prev, created]);
        setEditingIngredient(null);
        setIsNewIngredient(false);
      } else {
        console.error("Error al crear:", response.statusText);
      }
    } catch (error) {
      console.error("Error al crear:", error.message);
    }
  };

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ingredientes</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleNewIngredient}
        >
          Nuevo Ingrediente
        </button>
      </div>

      {(editingIngredient || isNewIngredient) && (
        <IngredientForm
          key={editingIngredient?.id || "new"}
          ingredient={editingIngredient}
          onSubmit={
            isNewIngredient
              ? handleNewIngredientFormSubmit
              : handleEditFormSubmit
          }
          isNewIngredient={isNewIngredient}
          providers={providers}
        />
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar ingrediente..."
          className="w-full px-4 py-2 border border-gray-500 rounded bg-gray-900 text-white placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredIngredients.map((ingredient) => (
          <IngredientItem
            key={ingredient.id}
            ingredient={ingredient}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {filteredIngredients.length === 0 && (
          <p className="text-gray-400">No se encontraron ingredientes.</p>
        )}
      </div>
    </div>
  );
}

export default IngredientTable;
