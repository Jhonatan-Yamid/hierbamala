"use client";
import React from "react";

const TicketPreviewModal = ({ formatTicket, onPrint, onShare, onClose }) => (
  <div className="fixed inset-0 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-gray-900 max-h-[90vh] overflow-y-auto text-slate-200 p-4 rounded-md w-96">
      <h3 className="text-lg font-bold mb-2">Vista Previa del Ticket</h3>
      <pre className="bg-gray-800 p-2 rounded-md whitespace-pre-wrap">
        {formatTicket()}
      </pre>
      <div className="mt-4 flex justify-between">
        <button
          onClick={onPrint}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md"
        >
          Imprimir
        </button>
        <button
          onClick={onShare}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-md"
        >
          Compartir por WhatsApp
        </button>
        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-md"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
);

export default TicketPreviewModal;
