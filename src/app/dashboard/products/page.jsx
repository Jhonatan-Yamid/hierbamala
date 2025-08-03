"use client";
import { useEffect, useState } from "react";
import ProductItem from "@/components/ProductItem";
import { useRouter } from "next/navigation";

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setFilteredProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleDelete = async (id) => {
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchProducts();
  };

  const handleEdit = (product) => {
    router.push(`/dashboard/products/${product.id}/edit`);
  };

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Productos</h1>
        <button
          onClick={() => router.push("/dashboard/products/new")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Nuevo Producto
        </button>
      </div>

      {/* Buscador de productos */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar producto por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md"
        />
      </div>

      {/* Lista filtrada */}
      <div className="space-y-4">
        {filteredProducts.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {filteredProducts.length === 0 && (
          <p className="text-gray-400">No se encontraron productos.</p>
        )}
      </div>
    </div>
  );
}
