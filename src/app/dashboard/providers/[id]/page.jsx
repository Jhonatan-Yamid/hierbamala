"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function ProviderDetail() {
    const { id } = useParams();

    const [movements, setMovements] = useState([]);
    const [balance, setBalance] = useState(0);
    const [providerName, setProviderName] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [movementType, setMovementType] = useState("INVOICE");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [selectedMovement, setSelectedMovement] = useState(null);
    const [date, setDate] = useState(
        new Date().toISOString().slice(0, 16)
    );
    const [isImageOpen, setIsImageOpen] = useState(false);



    // ---------------- FETCH DATA ----------------
    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            const movRes = await fetch(
                `/api/provider-movements?providerId=${id}`
            );
            const movData = await movRes.json();

            const providerRes = await fetch(`/api/providers`);
            const providers = await providerRes.json();
            const provider = providers.find(p => p.id === parseInt(id));
            setProviderName(provider?.name || "Proveedor");

            setMovements(movData);

            const total = movData.reduce((acc, mov) => {
                if (mov.type === "INVOICE") return acc + mov.amount;
                if (mov.type === "PAYMENT") return acc - mov.amount;
                return acc;
            }, 0);

            setBalance(total);
        };

        fetchData();
    }, [id]);

    // ---------------- IMAGE UPLOAD ----------------
    const uploadImage = async () => {
        if (!imageFile) return null;

        const formData = new FormData();
        formData.append("file", imageFile);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        return data.url;
    };

    // ---------------- CREATE MOVEMENT ----------------
    const createMovement = async () => {
        let imageUrl = null;

        if (imageFile) {
            imageUrl = await uploadImage();
        }

        await fetch("/api/provider-movements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                providerId: parseInt(id),
                type: movementType,
                amount,
                description,
                imageUrl,
                createdAt: date,
            }),
        });

        setIsModalOpen(false);
        setAmount("");
        setDescription("");
        setImageFile(null);
        window.location.reload();
    };


    // ---------------- UI ----------------
    return (
        <div className="min-h-screen bg-gray-950 text-slate-200 px-4 md:px-8 py-6">

            {/* HEADER WALLET */}
            <div className="max-w-2xl mx-auto">

                <p className="text-sm text-gray-400">Proveedor</p>
                <h1 className="text-2xl font-semibold mb-4">{providerName}</h1>

                <p className="text-sm text-gray-400">Saldo actual</p>

                <div className={`text-4xl font-bold mt-1 mb-6 ${balance > 0 ? "text-red-400" : "text-green-400"}`}>
                    ${balance.toLocaleString("es-CO")}
                </div>

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => {
                            setMovementType("INVOICE");
                            setIsModalOpen(true);
                        }}
                        className="bg-gray-900 hover:bg-gray-800 border border-gray-800 p-4 rounded-2xl flex flex-col items-center gap-2 transition"
                    >
                        <ArrowUpRight className="w-6 h-6 text-green-400" />
                        <span className="text-sm">Registrar Factura</span>
                    </button>

                    <button
                        onClick={() => {
                            setMovementType("PAYMENT");
                            setIsModalOpen(true);
                        }}
                        className="bg-gray-900 hover:bg-gray-800 border border-gray-800 p-4 rounded-2xl flex flex-col items-center gap-2 transition"
                    >
                        <ArrowDownLeft className="w-6 h-6 text-red-400" />
                        <span className="text-sm">Registrar Pago</span>
                    </button>
                </div>

                {/* ACTIVITY */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Actividad</h2>
                    </div>

                    <div className="space-y-3">
                        {movements.map((mov) => (
                            <div
                                key={mov.id}
                                className="relative bg-gray-900 hover:bg-gray-800 transition p-4 rounded-2xl flex justify-between items-center cursor-pointer"
                                onClick={() => setSelectedMovement(mov)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${mov.type === "INVOICE" ? "bg-green-900/40" : "bg-red-900/40"}`}>
                                        {mov.type === "INVOICE" ? (
                                            <ArrowUpRight className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <ArrowDownLeft className="w-4 h-4 text-red-400" />
                                        )}
                                    </div>

                                    <div>
                                        <p className="font-medium">
                                            {mov.type === "INVOICE" ? "Factura registrada" : "Pago realizado"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(mov.createdAt).toLocaleDateString("es-CO")}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className={`font-semibold ${mov.type === "INVOICE"
                                        ? "text-green-400"
                                        : "text-red-400"
                                        }`}
                                >
                                    {mov.type === "INVOICE" ? "+" : "-"}$
                                    {mov.amount.toLocaleString("es-CO")}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm("¿Seguro que quieres eliminar este movimiento?")) {
                                            fetch(`/api/provider-movements?id=${mov.id}`, {
                                                method: "DELETE",
                                            }).then(() => window.location.reload());
                                        }
                                    }}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xs"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CREATE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
                    <div className="bg-gray-900 w-full max-w-md rounded-2xl p-6 border border-gray-800 max-h-[90vh] overflow-y-auto">


                        <h2 className="text-lg font-semibold mb-4">
                            {movementType === "INVOICE" ? "Nueva Factura" : "Nuevo Pago"}
                        </h2>

                        <input
                            type="number"
                            placeholder="Valor"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full mb-3 p-3 rounded-xl bg-gray-800 border border-gray-700 outline-none"
                        />
                        <input
                            type="datetime-local"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full mb-3 p-3 rounded-xl bg-gray-800 border border-gray-700 outline-none"
                        />

                        <textarea
                            placeholder="Descripción"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full mb-3 p-3 rounded-xl bg-gray-800 border border-gray-700 outline-none"
                        />

                        <input
                            type="file"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            className="w-full mb-4 text-sm"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-800 rounded-xl"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={createMovement}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAIL MODAL */}
            {/* DETAIL MODAL */}
            {selectedMovement && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 z-50">

                    <div className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-800 
                    max-h-[90vh] flex flex-col">

                        {/* HEADER */}
                        <div className="p-6 border-b border-gray-800">
                            <h2 className="text-lg font-semibold">
                                {selectedMovement.type === "INVOICE" ? "Factura" : "Pago"}
                            </h2>

                            <p className="text-sm text-gray-400 mt-1">
                                {new Date(selectedMovement.createdAt).toLocaleString("es-CO")}
                            </p>
                        </div>

                        {/* SCROLLABLE CONTENT */}
                        <div className="p-6 overflow-y-auto flex-1">

                            <p className="text-2xl font-bold mb-4">
                                ${selectedMovement.amount.toLocaleString("es-CO")}
                            </p>

                            {selectedMovement.description && (
                                <p className="text-sm text-gray-300 mb-4">
                                    {selectedMovement.description}
                                </p>
                            )}

                            {selectedMovement.imageUrl && (
                                <div className="mb-4">
                                    <img
                                        src={selectedMovement.imageUrl}
                                        onClick={() => setIsImageOpen(true)}
                                        className="rounded-xl border border-gray-800 cursor-zoom-in w-full object-cover max-h-64"
                                    />
                                    <p className="text-xs text-gray-500 mt-1 text-center">
                                        Toca la imagen para ampliar
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* FOOTER */}
                        <div className="p-4 border-t border-gray-800">
                            <button
                                onClick={() => setSelectedMovement(null)}
                                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-xl transition"
                            >
                                Cerrar
                            </button>
                        </div>

                    </div>
                </div>
            )}
            {isImageOpen && (
                <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setIsImageOpen(false)}>

                    {/* Botón cerrar */}
                    <button
                        onClick={() => setIsImageOpen(false)}
                        className="absolute top-6 right-6 text-white text-3xl font-bold"
                    >
                        ✕
                    </button>

                    {/* Imagen grande */}
                    <img
                        onClick={(e) => e.stopPropagation()}
                        src={selectedMovement.imageUrl}
                        className="max-h-[90vh] max-w-[95vw] object-contain rounded-xl"
                    />

                </div>
            )}

        </div>
    );
}
