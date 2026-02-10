"use client";
import React from "react";
import { FaChair, FaTruck, FaGamepad, FaStickyNote } from "react-icons/fa";

const SaleInfoFields = ({
  tableNumber,
  setTableNumber,
  game,
  setGame,
  availableGames = [],
  generalObservation,
  setGeneralObservation,
  orderType,
  setOrderType,
  tableInputRef, // 👈 NUEVO
}) => {
  return (
    <div className="w-full bg-[#0b0f12] border border-gray-800 rounded-2xl p-4 md:p-6 space-y-6 shadow-sm">

      <h3 className="text-lg font-semibold text-gray-100">
        Información del Pedido
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Número de Mesa */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium flex items-center gap-2 text-gray-300">
            <FaChair className="text-gray-400" />
            Número de Mesa <span className="text-red-400">*</span>
          </label>

          <input
            ref={tableInputRef}
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Ej: 12"
            className="p-2.5 bg-[#050607] border border-gray-800 rounded-lg w-full 
            focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Tipo de Pedido */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium flex items-center gap-2 text-gray-300">
            <FaTruck className="text-gray-400" />
            Tipo de Pedido
          </label>

          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="p-2.5 bg-[#050607] border border-gray-800 rounded-lg w-full 
            focus:ring-1 focus:ring-emerald-500"
          >
            <option value="En mesa">En mesa</option>
            <option value="Llevar">Llevar</option>
            <option value="Mixto">Mixto</option>
          </select>
        </div>

        {/* Juegos */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm font-medium flex items-center gap-2 text-gray-300">
            <FaGamepad className="text-gray-400" />
            Juegos de Mesa
          </label>

          <select
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="p-2.5 bg-[#050607] border border-gray-800 rounded-lg w-full 
            focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Selecciona un juego</option>
            {availableGames.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Observaciones */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium flex items-center gap-2 text-gray-300">
          <FaStickyNote className="text-gray-400" />
          Observaciones Generales
        </label>

        <textarea
          value={generalObservation}
          onChange={(e) => setGeneralObservation(e.target.value)}
          placeholder="Instrucciones generales para cocina o servicio..."
          className="p-3 bg-[#050607] border border-gray-800 rounded-lg w-full min-h-[90px] 
          focus:ring-1 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
};

export default SaleInfoFields;
