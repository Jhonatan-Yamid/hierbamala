import { FaUtensils, FaEdit, FaTrash } from "react-icons/fa"; // Asegúrate de que la ruta sea correcta

const ProductItem = ({ product, onEdit, onDelete }) => {
  return (
    <div className="relative flex p-4 rounded-lg">
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-14 h-14 rounded-full mr-4" // Ajusta el tamaño según necesites
        />
      ) : (
        <div className="flex items-center justify-center w-14 h-14 bg-gray-800 rounded-md mr-4">
          <FaUtensils className="text-white" size={20} />
        </div>
      )}
      <div className="flex flex-col justify-between flex-1">
        <h2
          className="text-slate-200 cursor-pointer text-xl font-semibold"
          onClick={() => onEdit(product)} // Al hacer clic en el título, se editará el producto
        >
          {product.name}
        </h2>
        <div className="flex justify-left text-slate-300 text-sm">
          <span className="font-light mr-3">{product.description}</span>
          <span className="font-semibold">
            {new Intl.NumberFormat("es-CL", {
              style: "currency",
              currency: "CLP",
            }).format(product.price)}
          </span>
        </div>
      </div>
      {/* Íconos de acción en la esquina superior derecha */}
      <div className="absolute top-2 right-2 flex">
        <button
          className="absolute top-2 right-0 text-gray-600 hover:text-gray-200 text-3xl"
          onClick={() => onDelete(ingredient.id)}
        >
          &times; {/* Símbolo "X" para eliminar */}
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
