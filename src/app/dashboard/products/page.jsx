"use client"
import ProductForm from "@/app/components/ProductForm";
import { useState, useEffect } from "react";

function ProductTable() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  useEffect(() => {
    fetch("/api/product")
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
    console.log(id);
    try {
      const response = await fetch(`/api/product`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setProducts(products.filter((product) => product.id !== id));
      } else {
        console.error("Error al eliminar el producto:", response.statusText);
      }
    } catch (error) {
      console.error("Error al eliminar el producto:", error.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleNewProduct = () => {
    setEditingProduct(null); // Limpiar el producto en edición
    setIsNewProduct(true); // Establecer que se está creando un nuevo producto
  };

  const handleEditFormSubmit = async (editedProduct) => {
    console.log(editedProduct);
    try {
      const response = await fetch(`/api/product`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedProduct),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        const updatedProducts = products.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        );
        setProducts(updatedProducts);
        setEditingProduct(null); // Reiniciar el estado de edición
      } else {
        console.error("Error al editar el producto:", response.statusText);
      }
    } catch (error) {
      console.error("Error al editar el producto:", error.message);
    }
  };

  const handleNewProductFormSubmit = async (newProduct) => {
    try {
      const response = await fetch("/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        const createdProduct = await response.json();
        setProducts([...products, createdProduct]); // Agregar el nuevo producto a la lista
        setIsNewProduct(false); // Salir del modo de creación de nuevo producto
      } else {
        console.log(response);
        console.error("Error al crear el producto:", response.statusText);
      }
    } catch (error) {
      console.error("Error al crear el producto:", error.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-slate-200 font-bold text-4xl mb-4">Productos</h1>
      <button
        className="bg-green-500 text-white p-2 rounded mb-4"
        onClick={handleNewProduct}
      >
        New
      </button>
      <table className="w-full bg-slate-800 text-slate-200">
        <thead>
          <tr>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-left">Descripcion</th>
            <th className="p-3 text-left">Precio</th>
            <th className="p-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="p-3">{product.name}</td>
              <td className="p-3">{product.description}</td>
              <td className="p-3">{product.price}</td>
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
      {editingProduct !== null || isNewProduct ? (
        <ProductForm
          product={editingProduct || null}
          onSubmit={isNewProduct ? handleNewProductFormSubmit : handleEditFormSubmit}
          isNewProduct={isNewProduct}
        />
      ) : null}
    </div>
  );
}

export default ProductTable;
