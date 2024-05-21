import { useState } from "react";

function EditProductForm({ product }) {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    quantity: product.quantity,
    price: product.price,
    typeUnity: product.typeUnity,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí puedes enviar el formulario al servidor para editar el producto
    // Utiliza fetch u otra librería para enviar la solicitud PUT al servidor
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      </label>
      <label>
        Description:
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </label>
      <label>
        Quantity:
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
        />
      </label>
      <label>
        Price:
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
        />
      </label>
      <label>
        Type Unity:
        <input
          type="text"
          name="typeUnity"
          value={formData.typeUnity}
          onChange={handleChange}
        />
      </label>
      <button type="submit">Save Changes</button>
    </form>
  );
}

export default EditProductForm;
