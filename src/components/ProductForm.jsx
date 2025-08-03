"use client";
import { useState, useEffect } from "react";

function ProductForm({ initialData, onSubmit, isNewProduct }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    ...initialData,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      price: parseFloat(formData.price),
    };
    await onSubmit(processedData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className=" text-white p-6 w-full space-y-4"
    >
      <h2 className="text-2xl font-bold mb-2 text-white">
        {isNewProduct ? "Nuevo Producto" : "Editar Producto"}
      </h2>

      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-md text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Descripción</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-md text-white"
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
          className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-md text-white"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium">
          Categoría
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-md text-white"
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
