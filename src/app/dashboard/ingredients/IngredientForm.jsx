import { useState } from "react";

function IngredientForm({ ingredient, onSubmit, isNewIngredient }) {
  const initialFormData = isNewIngredient
    ? {
        name: "",
        description: "",
        quantity: 0,
        price: 0,
        typeUnity: "",
      }
    : {
        id: ingredient?.id || null,
        name: ingredient.name,
        description: ingredient.description,
        quantity: ingredient.quantity,
        price: ingredient.price,
        typeUnity: ingredient.typeUnity,
      };

  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mx-auto p-5 shadow-lg text-white space-y-6 rounded-lg border border-white mb-6"
    >
      <h2 className="text-xl font-semibold text-slate-200 mb-4">
        {isNewIngredient ? "Nuevo Ingrediente" : "Editar Ingrediente"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="name"
            className="block mb-1 text-sm font-medium text-gray-300"
          >
            Nombre
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
            required
          />
        </div>
        <div >
          <label
            htmlFor="typeUnity"
            className="block mb-1 text-sm font-medium text-gray-300"
          >
            Unidad de medida
          </label>
          <input
            type="text"
            id="typeUnity"
            name="typeUnity"
            value={formData.typeUnity}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="block mb-1 text-sm font-medium text-gray-300"
          >
            Descripción
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="quantity"
            className="block mb-1 text-sm font-medium text-gray-300"
          >
            Cantidad disponible
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
            required
          />
        </div>

        <div>
          <label
            htmlFor="price"
            className="block mb-1 text-sm font-medium text-gray-300"
          >
            Precio
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="flex justify-center pt-4" >
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg font-semibold transition w-full"
        >
          Guardar Ingrediente
        </button>
      </div>
    </form>
  );
}

export default IngredientForm;
