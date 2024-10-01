"use client";
import ProductForm from "@/app/dashboard/products/ProductForm";
import { useState, useEffect } from "react";
import ProductItem from "./ProductItem"; // Asegúrate de que la ruta sea correcta

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-slate-200 font-semibold text-3xl">Productos</h1>
        <button
          className="bg-gray-800 text-gray-200 flex items-center rounded-md px-4 py-1 hover:bg-gray-600 hover:text-white"
          onClick={handleNewProduct}
        >
          Nuevo +
        </button>
      </div>
      <div className="flex flex-col gap-4 border-solid border rounded-md border-gray-600 p-5">
        <h1 className="text-slate-200 font-medium text-xl">Listado de Productos</h1>
        {products.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

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
