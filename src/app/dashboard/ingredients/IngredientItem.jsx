import { FaUtensils } from "react-icons/fa";

const IngredientItem = ({ ingredient, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-900 rounded-xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition">
      {/* Imagen o ícono */}
      <div className="flex items-center space-x-4">
        {ingredient.image ? (
          <img
            src={ingredient.image}
            alt={ingredient.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
            <FaUtensils className="text-white text-xl" />
          </div>
        )}

        {/* Detalles */}
        <div className="text-left">
          <h3
            className="text-lg font-bold text-white cursor-pointer hover:underline"
            onClick={() => onEdit(ingredient)}
          >
            {ingredient.name}
          </h3>
          <p className="text-gray-400 text-sm">
            {ingredient.description} ·{" "}
            
          </p>
          <p className="text-sm mt-1 font-medium text-green-300">{(ingredient.quantity !== null) ? ingredient.quantity+" "+ingredient.typeUnity : "Insuficiente"}</p>
        </div>
      </div>

      {/* Botón eliminar */}
      <button
        onClick={() => onDelete(ingredient.id)}
        className="text-gray-400 hover:text-red-400 text-2xl font-bold transition"
      >
        &times;
      </button>
    </div>
  );
};

export default IngredientItem;
