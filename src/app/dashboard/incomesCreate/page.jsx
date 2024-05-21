"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

function CreateProductPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();

  const onSubmit = handleSubmit(async (data) => {
    const res = await fetch("/api/incomes", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      router.push("/dashboard/incomes");
    }
  });

  return (
    <div className="h-screen flex justify-center items-center">
      <form onSubmit={onSubmit} className="w-full max-w-md px-4">
        <h1 className="text-slate-200 font-bold text-4xl mb-4">Create Product</h1>

        <label htmlFor="name" className="text-slate-500 mb-2 block text-sm">
          Name:
        </label>
        <input
          type="text"
          {...register("name", {
            required: {
              value: true,
              message: "Name is required",
            },
          })}
          className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
          placeholder="Product Name"
        />
        {errors.name && (
          <span className="text-red-500 text-xs">{errors.name.message}</span>
        )}

        <label htmlFor="description" className="text-slate-500 mb-2 block text-sm">
          Description:
        </label>
        <textarea
          {...register("description")}
          className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
          placeholder="Product Description"
        ></textarea>

        <label htmlFor="quantity" className="text-slate-500 mb-2 block text-sm">
          Quantity:
        </label>
        <input
          type="number"
          {...register("quantity", {
            required: {
              value: true,
              message: "Quantity is required",
            },
          })}
          className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
          placeholder="Product Quantity"
        />
        {errors.quantity && (
          <span className="text-red-500 text-xs">{errors.quantity.message}</span>
        )}

        <label htmlFor="price" className="text-slate-500 mb-2 block text-sm">
          Price:
        </label>
        <input
          type="number"
          {...register("price", {
            required: {
              value: true,
              message: "Price is required",
            },
          })}
          className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
          placeholder="Product Price"
        />
        {errors.price && (
          <span className="text-red-500 text-xs">{errors.price.message}</span>
        )}

        <label htmlFor="typeUnity" className="text-slate-500 mb-2 block text-sm">
          Type Unity:
        </label>
        <input
          type="text"
          {...register("typeUnity")}
          className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
          placeholder="Type Unity"
        />

        <button className="w-full bg-blue-500 text-white p-3 rounded-lg mt-2">
          Create
        </button>
      </form>
    </div>
  );
}

export default CreateProductPage;
