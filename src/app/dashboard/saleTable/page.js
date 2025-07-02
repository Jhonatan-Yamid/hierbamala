// components/DailySales.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { FaCashRegister, FaEdit, FaEye, FaTrashAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

function DailySales() {
    const { data: session } = useSession();
    const [subTab, setSubTab] = useState("pendientes");
    const [sales, setSales] = useState([]);
    const [todaySales, setTodaySales] = useState([]);
    const [pastSales, setPastSales] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [activeTab, setActiveTab] = useState("today");

    const getTodayDate = () => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    };
    const getOperationalDayRange = () => {
        const now = new Date();

        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15); // 3:00 p.m.
        const endOfToday = new Date(startOfToday);
        endOfToday.setDate(endOfToday.getDate() + 1);
        endOfToday.setHours(6, 0, 0, 0); // 4:00 a.m. del siguiente día

        if (now < endOfToday && now.getHours() < 6) {
            startOfToday.setDate(startOfToday.getDate() - 1);
            endOfToday.setDate(endOfToday.getDate() - 1);
        }

        return { start: startOfToday, end: endOfToday };
    };

    const fetchSalesData = useCallback(async () => {
        try {
            const res = await fetch("/api/sale");
            const data = await res.json();

            const { start, end } = getOperationalDayRange();

            const salesToday = [];
            const salesPast = [];

            data.forEach((sale) => {
                const saleDate = new Date(sale.updatedAt);
                if (saleDate >= start && saleDate < end) {
                    salesToday.push(sale);
                } else {
                    salesPast.push(sale);
                }
            });

            setSales(data);
            setTodaySales(salesToday);
            setPastSales(salesPast);
        } catch (error) {
            console.error("Error al obtener las ventas:", error);
        }
    }, []);

    useEffect(() => {
        fetchSalesData();
    }, [fetchSalesData]);

    const handlePreview = (sale) => {
        setSelectedProducts(sale.products || []);
        setShowPreview(true);
    };

    const closePreviewModal = () => setShowPreview(false);

    const totalToday = todaySales.reduce((acc, sale) => acc + sale.totalAmount, 0);

    const handleStatusAdvance = async (sale) => {
        let newStatus = "";
        if (sale.status === "en proceso") {
            newStatus = "en mesa";
        } else if (sale.status === "en mesa") {
            newStatus = "pagada";
        } else {
            return;
        }

        try {
            const res = await fetch(`/api/sale/${sale.id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Error al actualizar el estado de la venta.");
            }

            fetchSalesData();
        } catch (error) {
            console.error("Error al actualizar el estado de la venta:", error);
            alert(`No se pudo actualizar el estado: ${error.message}`);
        }
    };

    const handleDeleteSale = async (saleId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar esta venta? Esta acción es irreversible.")) {
            return;
        }

        try {
            const res = await fetch(`/api/sale?id=${saleId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Error al eliminar la venta.");
            }

            alert("Venta eliminada exitosamente.");
            fetchSalesData();
        } catch (error) {
            console.error("Error al eliminar la venta:", error);
            alert(`No se pudo eliminar la venta: ${error.message}`);
        }
    };

    const renderSaleList = (salesList) => (
        <div className="flex flex-col gap-4 border-solid border rounded-md border-gray-600 p-5">
            <h1 className="text-slate-200 font-medium text-xl">Ventas Registradas</h1>
            {session?.user?.image === 1 ? (
                <>
                    {activeTab === "today" && (
                        <div className="text-green-300 font-bold text-lg">
                            Total de hoy:{" "}
                            {new Intl.NumberFormat("es-CL", {
                                style: "currency",
                                currency: "CLP",
                            }).format(totalToday)}
                        </div>
                    )}
                </>
            ) : (
                <></>
            )}

            {salesList.length === 0 ? (
                <p className="text-slate-200">No hay ventas registradas</p>
            ) : (
                salesList.map((sale) => (
                    <div key={sale.id} className="flex items-start mb-4 cursor-pointer p-4 bg-gray-800 rounded-lg shadow-md"> {/* Flex row para mantener ícono a la izquierda */}
                        {/* Contenedor del ícono */}
                        <div className="flex items-center justify-center w-14 h-14 bg-gray-700 rounded-md mr-4 flex-shrink-0 mt-1"> {/* mt-1 para alinear con el texto */}
                            <FaCashRegister className="text-white" size={20} />
                        </div>

                        {/* Contenido principal de la venta (Mesa, Venta, Productos, Estado, Total, Botones) */}
                        <div className="flex flex-col sm:flex-row justify-between w-full">
                            {/* Sección izquierda: Detalles de la venta y botón de estado */}
                            <div className="flex flex-col items-start flex-grow">
                                {/* *** MODIFICACIÓN CLAVE: Número de Mesa resaltado y combinado con el ícono *** */}
                                <h3 className="text-green-400 text-4xl font-extrabold leading-none mb-2">
                                    Mesa: {sale.table}
                                </h3>
                                {/* *** FIN MODIFICACIÓN CLAVE *** */}

                                <h2 className="text-slate-200 text-xl font-semibold">
                                    Venta - {new Date(sale.updatedAt).toLocaleDateString("es-CL")} / {new Date(sale.updatedAt).toLocaleTimeString("es-CL", { hour: '2-digit', minute: '2-digit' })}
                                </h2>
                                <span className="text-slate-300 text-sm">
                                    Productos: {sale.products?.length || 0}
                                </span>
                                <div className="text-slate-300 text-sm">
                                    Estado: {sale.status}
                                </div>
                                {["en proceso", "en mesa"].includes(sale.status) && (
                                    <button
                                        onClick={() => handleStatusAdvance(sale)}
                                        className="mt-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm px-3 py-1 rounded"
                                    >
                                        {sale.status === "en proceso" ? "Orden lista" : "Marcar como pagada"}
                                    </button>
                                )}
                            </div>

                            {/* Sección derecha: Total y botones de acción */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                                <div className="flex items-center mb-4 sm:mb-0 mr-4">
                                    <span className="text-slate-200 text-lg font-semibold mr-2">Total:</span>
                                    <span className="text-slate-300 text-lg font-semibold">
                                        {new Intl.NumberFormat("es-CL", {
                                            style: "currency",
                                            currency: "CLP",
                                        }).format(sale.totalAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-start sm:justify-end w-full sm:w-auto"> {/* Contenedor para los botones de acción */}
                                    <Link href={`/dashboard/sales/${sale.id}`}>
                                        <button className="ml-4 text-gray-600 hover:text-gray-200 text-3xl">
                                            <FaEdit />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePreview(sale);
                                        }}
                                        className="ml-4 text-gray-600 hover:text-gray-200 text-3xl"
                                    >
                                        <FaEye />
                                    </button>
                                    {session?.user?.image === 1 ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSale(sale.id);
                                            }}
                                            className="ml-4 text-red-500 hover:text-red-300 text-3xl"
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    ) : (
                                        <></>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    return (
        <div className="p-6 bg-gray-950 min-h-screen text-slate-200">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-slate-200 font-semibold text-3xl">Ventas</h1>
                <Link href="/dashboard/sales">
                    <button className="bg-gray-800 text-gray-200 flex items-center rounded-md px-4 py-1 hover:bg-gray-600 hover:text-white">
                        Nueva venta +
                    </button>
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab("today")}
                    className={`px-4 py-2 rounded-t-md ${activeTab === "today" ? "bg-gray-800 text-white" : "bg-gray-600 text-gray-300"
                        }`}
                >
                    Ventas de Hoy
                </button>
                <button
                    onClick={() => setActiveTab("past")}
                    className={`px-4 py-2 rounded-t-md ${activeTab === "past" ? "bg-gray-800 text-white" : "bg-gray-600 text-gray-300"
                        }`}
                >
                    Ventas Anteriores
                </button>
            </div>

            {activeTab === "today" ? (
                <>
                    {/* Subpestañas */}
                    <div className="flex space-x-3 mb-4">
                        <button
                            onClick={() => setSubTab("todas")}
                            className={`px-3 py-1 rounded-full text-sm ${subTab === "todas" ? "bg-green-700 text-white" : "bg-gray-600 text-gray-200"
                                }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setSubTab("pendientes")}
                            className={`px-3 py-1 rounded-full text-sm ${subTab === "pendientes" ? "bg-yellow-700 text-white" : "bg-gray-600 text-gray-200"
                                }`}
                        >
                            En proceso / En mesa
                        </button>
                        <button
                            onClick={() => setSubTab("pagadas")}
                            className={`px-3 py-1 rounded-full text-sm ${subTab === "pagadas" ? "bg-blue-700 text-white" : "bg-gray-600 text-gray-200"
                                }`}
                        >
                            Pagadas
                        </button>
                    </div>

                    {/* Lista filtrada según subpestaña */}
                    {renderSaleList(
                        todaySales.filter((sale) => {
                            if (subTab === "todas") return true;
                            if (subTab === "pendientes") return sale.status === "en proceso" || sale.status === "en mesa";
                            if (subTab === "pagadas") return sale.status === "pagada";
                            return true;
                        })
                    )}
                </>
            ) : renderSaleList(pastSales)}

            {/* Vista previa (si tienes un componente de modal separado puedes seguir usándolo) */}
            {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-6 rounded-lg w-1/2 h-1/2 relative">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-white text-2xl font-semibold">Vista Previa de la Comanda</h2>
                            <button className="text-white hover:text-gray-400" onClick={closePreviewModal}>
                                <IoClose size={30} />
                            </button>
                        </div>
                        <div className="overflow-auto">
                            <ul className="space-y-4">
                                {selectedProducts.map((product, index) => (
                                    <li key={index} className="text-white">
                                        {product.name} - Cantidad: {product.quantity} |{" "}
                                        {new Intl.NumberFormat("es-CL", {
                                            style: "currency",
                                            currency: "CLP",
                                        }).format(product.price * product.quantity)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DailySales;
