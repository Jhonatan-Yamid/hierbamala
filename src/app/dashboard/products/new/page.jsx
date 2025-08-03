"use client";
import ProductForm from "@/components/ProductForm";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();

  const handleSubmit = async (formData) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      router.push("/dashboard/products");
    }
  };

  return <ProductForm onSubmit={handleSubmit} isNewProduct />;
}
