"use client";

import React, { useState } from "react";

const OpenChecklist = () => {
  const checklistItems = [
    "Abrir tapa principal",
    "Colocar rockola, avisos bold, bancolombia y propinas",
    "Terminar de lavar los trastes faltantes",
    "Barrer grama",
    "Limpiar asador",
    "Limpiar mesas y sillas primer piso",
    "Barrer terraza y escalas",
    "Limpiar mesas, sillas, sofá terraza (también organizarlo que no quede mal puesto)",
    "Encender luces primer piso, segundo piso, cocina, neon Hierba Mala, bafle y televisor",
    "Colocar playlist 'Hierba Mala' en los dos pisos",
    "Sacar ingredientes hamburguesas para el asador (tomate, lechuga, cebolla caramelizada, ripio de papas, salsa blanca)",
    "Rellenar salseros de cocina y asador, limpiarlos y sacarlos",
    "Sacar platos y salseras para el asador",
    "Abrir pipetas asador y cocina",
    "Calentar agua",
    "Cargar todos los servilleteros",
    "Encender nevera cervecera, validar que esté cargada y limpia la puerta y la parte superior sin polvo ni reblujo",
    "Encender nevera Interna, validar que esté cargada de gaseosas y cervezas",
    "Revisar inventario y elementos necesarios faltantes D1, legumbres, etc, para enviar reporte al grupo 'servicio'",
    "Preparar Mise en Place (tomate en cuadros, cebolla en cuadros, rodajas de tomate, lechuga, zumo, cebolla caramelizada, picar papas y pre-asar tocientas y papas, mantequillar panes etc...)",
    "Sacar Carnes necesarias para el día, guarniciones, proteinas etc...",
    "Abrir saran y malla",
    "Precalentar el asador en fuego bajo",
    "Barrer cera y sacar la tijera",
    "Colocar cartel promoción o redibujarlo después de terminar el Mise en Place de ser necesario",
    
  ];

  const [checkedItems, setCheckedItems] = useState(
    new Array(checklistItems.length).fill(false)
  );

  const toggleCheckbox = (index) => {
    const updatedCheckedItems = [...checkedItems];
    updatedCheckedItems[index] = !updatedCheckedItems[index];
    setCheckedItems(updatedCheckedItems);
  };

  const clearChecklist = () => {
    setCheckedItems(new Array(checklistItems.length).fill(false));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-slate-200">
        Checklist de Apertura
      </h1>
      <div className="relative p-4 rounded-lg border border-white bg-gray-950">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checklistItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800 border border-gray-700"
              style={{
                minHeight: "80px", // Altura mínima uniforme
              }}
            >
              <input
                type="checkbox"
                checked={checkedItems[index]}
                onChange={() => toggleCheckbox(index)}
                className="w-6 h-6 text-blue-500 border-gray-500 rounded bg-gray-700 flex-shrink-0"
              />
              <span
                className={`text-slate-200 text-sm ${
                  checkedItems[index] ? "line-through text-slate-400" : ""
                }`}
                style={{
                  whiteSpace: "normal", // Permitir múltiples líneas
                  wordWrap: "break-word", // Ajustar texto largo
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={clearChecklist}
          className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Limpiar Checklist
        </button>
      </div>
    </div>
  );
};

export default OpenChecklist;
