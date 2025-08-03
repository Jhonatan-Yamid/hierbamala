"use client";
import { useState, useEffect } from "react";

function IngredientSearch({ onAdd }) {
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);

  useEffect(() => {
    const fetchIngredients = async () => {
      const res = await fetch("/api/ingredient");
      const data = await res.json();
      setAllIngredients(data);
    };

    fetchIngredients();
  }, []);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setIngredientSearch(term);
    if (term.length > 0) {
      const filtered = allIngredients.filter((ingredient) =>
        ingredient.name.toLowerCase().includes(term.toLowerCase())
      );
      setIngredientSuggestions(filtered);
    } else {
      setIngredientSuggestions([]);
    }
  };

  const handleSelectIngredient = (ingredient) => {
    onAdd(ingredient);
    setIngredientSearch("");
    setIngredientSuggestions([]);
  };

  return (
    <div>
      <label className="block text-sm font-medium">Buscar Ingredientes</label>
      <input
        type="text"
        value={ingredientSearch}
        onChange={handleSearchChange}
        className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded-md"
        placeholder="Escribe para buscar ingredientes..."
      />
      {ingredientSuggestions.length > 0 && (
        <ul className="mt-2 bg-gray-800 border border-gray-700 rounded-md">
          {ingredientSuggestions.map((ingredient) => (
            <li
              key={ingredient.id}
              onClick={() => handleSelectIngredient(ingredient)}
              className="p-2 hover:bg-gray-700 cursor-pointer"
            >
              {ingredient.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default IngredientSearch;
