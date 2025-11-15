"use client";
import React from "react";
import { FaPrint, FaShareAlt, FaTimes } from "react-icons/fa";

/**
 * Simple modal de vista previa del ticket.
 * - Recibe formatTicket, onPrint, onShare, onClose (igual que antes)
 * - UI Dark Premium
 */
const TicketPreviewModal = ({ formatTicket, onPrint, onShare, onClose }) => {
  const content = formatTicket?.() || "No hay ticket disponible";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl bg-[#06070a] border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold">Vista Previa del Ticket</h3>
          <div className="flex items-center gap-3">
            <button onClick={onPrint} className="px-3 py-2 bg-emerald-500 rounded-md text-black font-semibold flex items-center gap-2"><FaPrint /> Imprimir</button>
            <button onClick={onShare} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 flex items-center gap-2"><FaShareAlt /> Compartir</button>
            <button onClick={onClose} className="p-2 text-gray-300 hover:text-white"><FaTimes /></button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-gray-200 bg-[#06070a]">{content}</pre>
        </div>
      </div>
    </div>
  );
};

export default TicketPreviewModal;
