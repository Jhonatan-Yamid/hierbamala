"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductForm from "@/components/ProductForm";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`/api/products?id=${id}`)
      .then((res) => res.json())
      .then(setProduct);
  }, [id]);

  const handleSubmit = async (formData) => {
    const res = await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, id: parseInt(id) }),
    });

    if (res.ok) {
      router.push("/dashboard/products");
    }
  };

  if (!product) return <p className="text-white">Cargando...</p>;

  return <ProductForm initialData={product} onSubmit={handleSubmit} />;
}
