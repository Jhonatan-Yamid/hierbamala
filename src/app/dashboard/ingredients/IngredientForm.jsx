import { useState } from "react";

function IngredientForm({ ingredient, onSubmit, isNewIngredient  }) {
    const initialFormData = isNewIngredient
    ? {
        name: "",
        description: "",
        quantity: 0,
        price: 0,
        typeUnity: "",
      }
    : {
        id:ingredient?.id || null,
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
    <form onSubmit={handleSubmit} className="p-4 bg-slate-700 text-slate-200">
      <h2 className="text-2xl font-bold mb-4">{isNewIngredient ? "New Ingredient" : "Edit Ingredient"}</h2>
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
        <label htmlFor="quantity" className="block mb-1">
          Quantity:
        </label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
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
      <div className="mb-4">
        <label htmlFor="typeUnity" className="block mb-1">
          Type Unity:
        </label>
        <input
          type="text"
          id="typeUnity"
          name="typeUnity"
          value={formData.typeUnity}
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-800 text-slate-200"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Save
      </button>
    </form>
  );
}

export default IngredientForm;
