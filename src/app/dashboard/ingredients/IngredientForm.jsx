import { useState } from "react";

const ORIGINS = [
  "Carne",
  "Cerveza Artesanal",
  "D1",
  "Desconocido",
  "Desechables",
  "Gaseosas",
  "Licores",
  "Pulpas",
  "Terceros",
  "Verdura",
];

function IngredientForm({ ingredient, onSubmit, isNewIngredient }) {

  const normalizeOrigin = (value) => {
    if (!value) return "Desconocido";

    const match = ORIGINS.find(
      (o) => o.toLowerCase() === value.trim().toLowerCase()
    );

    return match || "Desconocido";
  };
  const initialFormData = isNewIngredient
    ? {
      name: "",
      description: "",
      quantity: 0,
      price: 0,
      typeUnity: "",
      Origin: "Desconocido",
    }
    : {
      id: ingredient?.id || null,
      name: ingredient.name,
      description: ingredient.description,
      quantity: ingredient.quantity,
      price: ingredient.price,
      typeUnity: ingredient.typeUnity,
      Origin: normalizeOrigin(ingredient.Origin),
    };


  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
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
        {/* Nombre */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Nombre
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
            required
          />
        </div>

        {/* Unidad */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Unidad de medida
          </label>
          <input
            type="text"
            name="typeUnity"
            value={formData.typeUnity}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
            required
          />
        </div>

        {/* ORIGIN */}
        <div>
          <label
            htmlFor="Origin"
            className="block mb-1 text-sm font-medium text-gray-300"
          >
            Categoría (Origen)
          </label>

          <select
            id="Origin"
            name="Origin"
            value={formData.Origin}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
            required
          >
            {ORIGINS.map((origin) => (
              <option key={origin} value={origin}>
                {origin}
              </option>
            ))}
          </select>
        </div>


        {/* Cantidad */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Cantidad disponible
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Descripción
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
          />
        </div>

        {/* Precio */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Precio
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition w-full"
      >
        Guardar Ingrediente
      </button>
    </form>
  );
}

export default IngredientForm;
