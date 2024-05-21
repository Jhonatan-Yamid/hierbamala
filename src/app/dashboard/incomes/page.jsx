"use client";
// import Button from "@/app/components/button";
import { useState, useEffect } from "react";

function ProductTable() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetch("/api/ingredients")
      .then((res) => res.json())
      .then((data) => {
        console.log("Datos recibidos del servidor:", data);
        setProducts(data);
      })
      .catch((error) => {
        console.error("Error al obtener los datos del servidor:", error);
      });
  }, []);

  const handleDelete = async (id) => {
    await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    setProducts(products.filter((product) => product.id !== id));
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleEditFormSubmit = async (editedProduct) => {
    // Enviar los datos actualizados del producto al servidor
    try {
      const response = await fetch(`/api/products/${editedProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedProduct),
      });
      if (response.ok) {
        // Actualizar la lista de productos después de editar
        const updatedProducts = products.map((product) =>
          product.id === editedProduct.id ? editedProduct : product
        );
        setProducts(updatedProducts);
        // Reiniciar el estado de edición
        setEditingProduct(null);
      } else {
        console.error("Error al editar el producto:", response.statusText);
      }
    } catch (error) {
      console.error("Error al editar el producto:", error.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-slate-200 font-bold text-4xl mb-4">Activos</h1>
      {/* <Button /> */}
      <table className="w-full bg-slate-800 text-slate-200">
        <thead>
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-left">Quantity</th>
            <th className="p-3 text-left">Price</th>
            <th className="p-3 text-left">Type Unity</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="p-3">{product.name}</td>
              <td className="p-3">{product.description}</td>
              <td className="p-3">{product.quantity}</td>
              <td className="p-3">{product.price}</td>
              <td className="p-3">{product.typeUnity}</td>
              <td className="p-3">
                <button
                  className="bg-yellow-500 text-white p-2 rounded mr-2"
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white p-2 rounded"
                  onClick={() => handleDelete(product.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          onSubmit={handleEditFormSubmit}
        />
      )}
    </div>
  );
}

export default ProductTable;
