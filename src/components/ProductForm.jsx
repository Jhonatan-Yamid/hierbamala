"use client";
import { useState, useEffect } from "react";

function ProductForm({ initialData, onSubmit, isNewProduct }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    ingredients: [], // { id, name, quantity }
    ...initialData,
  });

  const [ingredientSearch, setIngredientSearch] = useState("");
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);

  useEffect(() => {
    const fetchIngredients = async () => {
      const res = await fetch("/api/ingredient");
      const data = await res.json();
      setAllIngredients(data);

      // Si es edición, enriquecer los ingredientes con su nombre
      if (!isNewProduct && initialData?.ingredients?.length > 0) {
        const enrichedIngredients = initialData.ingredients.map((i) => {
          const fullIngredient = data.find((ing) => ing.id === i.ingredientId);
          return {
            id: i.ingredientId,
            name: fullIngredient?.name || "Ingrediente desconocido",
            quantity: i.quantity,
          };
        });
        setFormData((prev) => ({
          ...prev,
          ingredients: enrichedIngredients,
        }));
      }
    };

    fetchIngredients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setIngredientSearch(term);
    if (term.length > 0) {
      const filtered = allIngredients.filter((ingredient) =>
        ingredient.name.toLowerCase().includes(term.toLowerCase())
      );
      setIngredientSuggestions(filtered);
    } else {
      setIngredientSuggestions([]);
    }
  };

  const handleAddIngredient = (ingredient) => {
    // Evitar duplicados
    if (formData.ingredients.some((ing) => ing.id === ingredient.id)) return;

    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...ingredient, quantity: 1 }],
    }));

    setIngredientSearch("");
    setIngredientSuggestions([]);
  };

  const handleIngredientQuantityChange = (id, quantity) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing) =>
        ing.id === id ? { ...ing, quantity } : ing
      ),
    }));
  };

  const handleRemoveIngredient = (id) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((ing) => ing.id !== id),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      price: parseFloat(formData.price),
      ingredients: formData.ingredients.map((i) => ({
        ingredientId: i.id,
        quantity: Number(i.quantity),
      })),
    };
    await onSubmit(processedData);
  };

  return (
    <form onSubmit={handleSubmit} className="text-white p-6 w-full space-y-4">
      <h2 className="text-2xl font-bold mb-2">
        {isNewProduct ? "Nuevo Producto" : "Editar Producto"}
      </h2>

      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Descripción</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-md"
          placeholder="Describe el producto..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Precio</label>
        <input
          type="number"
          step="0.01"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Categoría</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-md"
        >
          <option value="">Seleccione una categoría</option>
          <option value="Adiciones">Adiciones</option>
          <option value="Asados">Asados</option>
          <option value="Bebidas Calientes">Bebidas Calientes</option>
          <option value="Bebidas Frías y Refrescantes">
            Bebidas Frías y Refrescantes
          </option>
          <option value="Cerveza Artesanal">Cerveza Artesanal</option>
          <option value="Cocktails de Autor">Cocktails de Autor</option>
          <option value="Entradas">Entradas</option>
          <option value="Hamburguesas Artesanales">
            Hamburguesas Artesanales
          </option>
          <option value="Licores">Licores</option>
          <option value="Los Platos de la Casa">Los Platos de la Casa</option>
          <option value="Otros">Otros</option>
        </select>
      </div>

      {/* BUSCADOR DE INGREDIENTES */}
      <div className="p-4 rounded-lg border border-white">
        <div>
          <h3 className="text-lg font-semibold mb-2">
              Ingredientes
            </h3>
          <label className="block text-sm font-medium">
            Buscar Ingredientes
          </label>
          <input
            type="text"
            value={ingredientSearch}
            onChange={handleSearchChange}
            className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-md"
            placeholder="Escribe para buscar ingredientes..."
          />
          {ingredientSuggestions.length > 0 && (
            <ul className="mt-2 bg-gray-800 border border-gray-700 rounded-md">
              {ingredientSuggestions.map((ingredient) => (
                <li
                  key={ingredient.id}
                  onClick={() => handleAddIngredient(ingredient)}
                  className="p-2 hover:bg-gray-700 cursor-pointer"
                >
                  {ingredient.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* INGREDIENTES AGREGADOS */}
        {formData.ingredients.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium">
              Ingredientes asignados
            </label>
            <ul className="space-y-2">
              {formData.ingredients.map((ing) => (
                <li
                  key={ing.id}
                  className="flex items-center justify-between bg-gray-800 p-2 rounded-md"
                >
                  <span>{ing.name}</span>
                  <input
                    type="number"
                    min={1}
                    value={ing.quantity}
                    onChange={(e) =>
                      handleIngredientQuantityChange(ing.id, e.target.value)
                    }
                    className="w-20 ml-4 mr-2 p-1 bg-gray-900 border border-gray-600 rounded text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(ing.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
      >
        Guardar Producto
      </button>
    </form>
  );
}

export default ProductForm;
