"use client";
import React from "react";

const SaleInfoFields = ({
  tableNumber,
  setTableNumber,
  game,
  setGame,
  availableGames,
  generalObservation,
  setGeneralObservation,
}) => {
  return (
    <>
      <div>
        <label htmlFor="tableNumber" className="block text-sm font-medium">
          Número de Mesa
        </label>
        <input
          type="text"
          id="tableNumber"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="game" className="block text-sm font-medium">
          Juegos de Mesa
        </label>
        <select
          id="game"
          value={game}
          onChange={(e) => setGame(e.target.value)}
          className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded-md"
        >
          <option value="">Selecciona un juego</option>
          {availableGames.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="generalObservation" className="block text-sm font-medium">
          Observaciones Generales
        </label>
        <textarea
          id="generalObservation"
          value={generalObservation}
          onChange={(e) => setGeneralObservation(e.target.value)}
          className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded-md"
          placeholder="Escribe aquí observaciones generales..."
        />
      </div>
    </>
  );
};

export default SaleInfoFields;
