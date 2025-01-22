"use client";
import { useState, useEffect } from "react";
import { FaCashRegister, FaEdit, FaEye } from "react-icons/fa"; // Importar los íconos
import { IoClose } from "react-icons/io5";
import SalesForm from "../sales/page"; // Importar el formulario de ventas
import Link from "next/link";

function DailySales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editingSale, setEditingSale] = useState(null); // Para editar una venta
  const [isNewSale, setIsNewSale] = useState(false); // Para crear una nueva venta
  const [editingStatus, setEditingStatus] = useState("");
  const [editingTableNumber, setEditingTableNumber] = useState("");
  const [showPreview, setShowPreview] = useState(false); // Para controlar la vista previa

  // Función para obtener la fecha de hoy sin la hora
  const getTodayDate = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  useEffect(() => {
    // Obtener las ventas del día
    fetch("/api/sale")
      .then((res) => res.json())
      .then((data) => {
        const today = getTodayDate();
        const filteredSales = data.filter((sale) => {
          const saleDate = new Date(sale.updatedAt);
          const saleDateWithoutTime = new Date(
            saleDate.getFullYear(),
            saleDate.getMonth(),
            saleDate.getDate()
          );
          return saleDateWithoutTime.getTime() === today.getTime(); // Comparar fechas sin tiempo
        });
        setSales(filteredSales);
      })
      .catch((error) => {
        console.error("Error al obtener las ventas:", error);
      });

    // Obtener productos disponibles
    fetch("/api/product")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.error("Error al obtener los productos:", error);
      });
  }, []);

  const handleNewSale = () => {
    setSelectedProducts([]);
    setEditingSale(null);
    setIsNewSale(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseForm = () => {
    setIsNewSale(false);
    document.body.style.overflow = "auto";
  };

  const handleEditSale = (sale) => {
    if (sale.products && sale.products.length > 0) {
      setSelectedProducts(
        sale.products.map((saleProduct) => ({
          ...saleProduct.product,
          quantity: saleProduct.quantity || 0,
        }))
      );
    } else {
      setSelectedProducts([]);
    }
    setEditingSale(parseInt(sale.id));
    setIsNewSale(true);
    setEditingStatus(sale.status);
    setEditingTableNumber(sale.table);
    document.body.style.overflow = "hidden";
  };

  const handlePreview = (sale) => {
    setSelectedProducts(sale.products || []);
    setShowPreview(true);
  };

  const handleDeleteSale = async (saleId) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta venta?")) {
      try {
        const response = await fetch(`/api/sale?id=${saleId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setSales(sales.filter((sale) => sale.id !== saleId));
        } else {
          console.error("Error al eliminar la venta:", response.statusText);
        }
      } catch (error) {
        console.error("Error al eliminar la venta:", error.message);
      }
    }
  };

  const handleSaleSubmit = async (saleData) => {
    const saleId = editingSale;
    const url = saleId ? `/api/sale?id=${saleId}` : `/api/sale`;
    const method = saleId ? "PUT" : "POST";
    const sanitizedSaleData = {
      totalAmount: saleData.totalAmount,
      products: saleData.products.map(({ productId, quantity }) => ({
        productId,
        quantity,
      })),
      status: saleData.status,
      table: saleData.tableNumber,
    };

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizedSaleData),
    });

    if (!response.ok) {
      console.error("Error en la solicitud:", response.statusText);
    } else {
      handleCloseForm();
    }
  };

  const closePreviewModal = () => {
    setShowPreview(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-slate-200 font-semibold text-3xl">Ventas del Día</h1>
        <button
          className="bg-gray-800 text-gray-200 flex items-center rounded-md px-4 py-1 hover:bg-gray-600 hover:text-white"
        >
          <Link href="/dashboard/sales">Nueva venta +</Link>
        </button>
           
      </div>

      {/* Listado de ventas */}
      <div className="flex flex-col gap-4 border-solid border rounded-md border-gray-600 p-5">
        <h1 className="text-slate-200 font-medium text-xl">Ventas Registradas</h1>
        {sales.length === 0 ? (
          <p className="text-slate-200">No hay ventas registradas</p>
        ) : (
          sales.map((sale) => (
            <div key={sale.id} className="flex items-center mb-4 cursor-pointer">
              <div className="flex items-center justify-center w-14 h-14 bg-gray-800 rounded-md mr-4">
                <FaCashRegister className="text-white" size={20} />
              </div>
              <div className="flex justify-between w-full">
                <div>
                  <h2 className="text-slate-200 text-xl font-semibold">
                    Venta -{" "}
                    {new Date(sale.updatedAt).toLocaleDateString("es-CL")}
                  </h2>
                  <span className="text-slate-300 text-sm">
                    Productos: {sale.products?.length || 0}
                  </span>
                  <div className="text-slate-300 text-sm">
                    Mesa: {sale.table} | Estado: {sale.status}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-200 text-lg font-semibold mr-2">
                    Total:
                  </span>
                  <span className="text-slate-300 text-lg font-semibold">
                    {new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    }).format(sale.totalAmount)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSale(sale.id);
                    }}
                    className="text-gray-600 hover:text-gray-200 text-3xl ml-4"
                  >
                    &times;
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSale(sale);
                    }}
                    className="ml-4 text-gray-600 hover:text-gray-200 text-3xl"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(sale);
                    }}
                    className="ml-4 text-gray-600 hover:text-gray-200 text-3xl"
                  >
                    <FaEye />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mostrar formulario de nueva venta o edición */}
      {isNewSale && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full h-full relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-2xl font-semibold">
                {editingSale ? "Editar Venta" : "Nueva Venta"}
              </h2>
              <button
                className="text-white hover:text-gray-400"
                onClick={handleCloseForm}
              >
                <IoClose size={30} />
              </button>
            </div>
          
          </div>
        </div>
      )}

      {/* Vista previa de la comanda */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-1/2 h-1/2 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-2xl font-semibold">
                Vista Previa de la Comanda
              </h2>
              <button
                className="text-white hover:text-gray-400"
                onClick={closePreviewModal}
              >
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
