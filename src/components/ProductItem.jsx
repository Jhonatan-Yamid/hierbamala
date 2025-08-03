"use client";

const ProductItem = ({ product, onEdit, onDelete }) => {
  return (
    <div className="relative flex p-4 bg-slate-800 rounded-lg text-white">
      <div className="flex flex-col flex-1">
        <h2 className="text-xl font-bold cursor-pointer" onClick={() => onEdit(product)}>
          {product.name}
        </h2>
        <p className="text-sm">{product.description}</p>
        <p className="text-sm mt-1 font-medium text-green-300">
          ${product.price?.toFixed(2)} – {product.category}
        </p>
      </div>
      <button
        onClick={() => onDelete(product.id)}
        className="absolute top-2 right-2 text-2xl text-red-400 hover:text-red-600"
      >
        &times;
      </button>
    </div>
  );
};

export default ProductItem;
