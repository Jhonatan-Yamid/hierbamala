'use client';
import IngredientForm from "./IngredientForm";
import { useState, useEffect } from "react";
import IngredientItem from "./IngredientItem";
// import { PlusIcon } from "@heroicons/react/outline"; // Asegúrate de tener este paquete

function IngredientTable() {
  const [ingredients, setIngredients] = useState([]);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [isNewIngredient, setIsNewIngredient] = useState(false);

  useEffect(() => {
    fetch("/api/ingredient")
      .then((res) => res.json())
      .then((data) => {
        console.log("Datos recibidos del servidor:", data);
        setIngredients(data);
      })
      .catch((error) => {
        console.error("Error al obtener los datos del servidor:", error);
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
        setIngredients(ingredients.filter((ingredient) => ingredient.id !== id));
      } else {
        console.error("Error al eliminar el ingredient:", response.statusText);
      }
    } catch (error) {
      console.error("Error al eliminar el ingredient:", error.message);
    }
  };

  const handleEdit = (ingredient) => {
    setEditingIngredient(ingredient);
  };

  const handleNewIngredient = () => {
    setEditingIngredient(null); // Limpiar el ingredient en edición
    setIsNewIngredient(true); // Establecer que se está creando un nuevo ingredient
  };

  const handleEditFormSubmit = async (editedIngredient) => {
    try {
      const response = await fetch("/api/ingredient", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedIngredient),
      });
      if (response.ok) {
        const updatedIngredients = ingredients.map((ingredient) =>
          ingredient.id === editedIngredient.id ? editedIngredient : ingredient
        );
        setIngredients(updatedIngredients);
        setEditingIngredient(null);
      } else {
        console.error("Error al editar el ingredient:", response.statusText);
      }
    } catch (error) {
      console.error("Error al editar el ingredient:", error.message);
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
        const createdIngredient = await response.json();
        setIngredients([...ingredients, createdIngredient]); // Agregar el nuevo ingredient a la lista
        setIsNewIngredient(false); // Salir del modo de creación de nuevo ingredient
      } else {
        console.error("Error al crear el ingredient:", response.statusText);
      }
    } catch (error) {
      console.error("Error al crear el ingredient:", error.message);
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
          Nuevo
          +
        </button>
      </div>
      <div className="flex flex-col gap-4 border-solid border rounded-md border-gray-600 p-5">
      <h1 className="text-slate-200 font-medium text-xl">Listado Actualizado</h1>
        {ingredients.map((ingredient) => (
          <IngredientItem
            key={ingredient.id}
            ingredient={ingredient}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {editingIngredient !== null || isNewIngredient ? (
        <IngredientForm
          ingredient={editingIngredient || null}
          onSubmit={
            isNewIngredient ? handleNewIngredientFormSubmit : handleEditFormSubmit
          }
          isNewIngredient={isNewIngredient}
        />
      ) : null}
    </div>
  );
}

export default IngredientTable;
