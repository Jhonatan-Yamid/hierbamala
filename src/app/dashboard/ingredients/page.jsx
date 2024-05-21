"use client";
import IngredientForm from "@/app/components/IngredientForm";
import { useState, useEffect } from "react";

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
    // Enviar los datos actualizados del ingredient al servidor
    try {
      const response = await fetch("/api/ingredient", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedIngredient),
      });
      if (response.ok) {
        // Actualizar la lista de ingredients después de editar
        const updatedIngredients = ingredients.map((ingredient) =>
          ingredient.id === editedIngredient.id ? editedIngredient : ingredient
        );
        setIngredients(updatedIngredients);
        // Reiniciar el estado de edición
        setEditingIngredient(null);
      } else {
        console.error("Error al editar el ingredient:", response.statusText);
      }
    } catch (error) {
      console.error("Error al editar el ingredient:", error.message);
    }
  };
  const handleNewIngredientFormSubmit = async (newIngredient) => {
    // Enviar los datos nuevos del ingredient al servidor
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
    <div className="p-4">
      <h1 className="text-slate-200 font-bold text-4xl mb-4">Ingredientes</h1>
      <button
        className="bg-green-500 text-white p-2 rounded mb-4"
        onClick={handleNewIngredient}
      >
        Nuevo
      </button>
      <table className="w-full bg-slate-800 text-slate-200">
        <thead>
          <tr>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-left">Descripción</th>
            <th className="p-3 text-left">Cantidad</th>
            <th className="p-3 text-left">Precio</th>
            <th className="p-3 text-left">Unidad de Medida</th>
            <th className="p-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient) => (
            <tr key={ingredient.id}>
              <td className="p-3">{ingredient.name}</td>
              <td className="p-3">{ingredient.description}</td>
              <td className="p-3">{ingredient.quantity}</td>
              <td className="p-3">{ingredient.price}</td>
              <td className="p-3">{ingredient.typeUnity}</td>
              <td className="p-3">
                <button
                  className="bg-yellow-500 text-white p-2 rounded mr-2"
                  onClick={() => handleEdit(ingredient)}
                >
                  Editar
                </button>
                <button
                  className="bg-red-500 text-white p-2 rounded"
                  onClick={() => handleDelete(ingredient.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Resto de tu tabla */}
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
