import React, { useState, useEffect } from "react";

function ProductForm({ product, onSubmit, isNewProduct }) {
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    selectedIngredients: [], // Campo para almacenar los ingredientes seleccionados
  });

  useEffect(() => {
    // Aquí puedes realizar una llamada a tu backend para obtener la lista de ingredientes disponibles
    fetch("/api/ingredient")
      .then((res) => res.json())
      .then((data) => {
        setAvailableIngredients(data);
      })
      .catch((error) => {
        console.error("Error fetching ingredients:", error);
      });
  }, []);

  useEffect(() => {
    // Si se proporciona un producto, establecer los valores del formulario
    if (product) {
      setFormData({
        id: product.id || "",
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        selectedIngredients: product.ingredients
          ? product.ingredients.map((ingredient) => ingredient.id)
          : [],
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleIngredientChange = (e) => {
    const selectedIngredients = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prevFormData) => ({
      ...prevFormData,
      selectedIngredients,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-slate-700 text-slate-200">
      <h2 className="text-2xl font-bold mb-4">
        {isNewProduct ? "New Product" : "Edit Product"}
      </h2>
      <div className="mb-4">
        <label htmlFor="name" className="block mb-1">
          Name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-800 text-slate-200"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block mb-1">
          Description:
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-800 text-slate-200"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="price" className="block mb-1">
          Price:
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-800 text-slate-200"
        />
      </div>

      {/* Selección de ingredientes */}
      <div className="mb-4">
        <label htmlFor="selectedIngredients" className="block mb-1">
          Select Ingredients:
        </label>
        <select
          id="selectedIngredients"
          name="selectedIngredients"
          multiple
          value={formData.selectedIngredients}
          onChange={handleIngredientChange}
          className="w-full p-2 rounded bg-slate-800 text-slate-200"
        >
          {availableIngredients.map((ingredient) => (
            <option key={ingredient.id} value={ingredient.id}>
              {ingredient.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        {isNewProduct ? "Create" : "Update"}
      </button>
    </form>
  );
}

export default ProductForm;
