"use client";
import { useState, useEffect } from "react";
import { FaCashRegister } from "react-icons/fa"; // Importar el ícono de caja registradora
import SaleForm from "./SaleForm";

function SaleTable() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editingSale, setEditingSale] = useState(null); // Para editar una venta
  const [isNewSale, setIsNewSale] = useState(false); // Para crear una nueva venta

  useEffect(() => {
    // Obtener las ventas
    fetch("/api/sale")
      .then((res) => res.json())
      .then((data) => {
        setSales(data);
      })
      .catch((error) => {
        console.error("Error al obtener las ventas:", error);
      });

    // Obtener los productos
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
  };

  const handleAddProduct = (product) => {
    setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
  };

  const handleRemoveProduct = (id) => {
    setSelectedProducts(
      selectedProducts.filter((product) => product.id !== id)
    );
  };

  const handleUpdateQuantity = (id, quantity) => {
    setSelectedProducts(
      selectedProducts.map((product) =>
        product.id === id ? { ...product, quantity } : product
      )
    );
  };

  const handleSaleSubmit = async (saleData) => {
    try {
      const response = await fetch("/api/sale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });
      if (response.ok) {
        const newSale = await response.json();
        setSales([...sales, newSale]); // Agregar la nueva venta a la lista
        setIsNewSale(false); // Ocultar el formulario después de crear la venta
      } else {
        console.error("Error al crear la venta:", response.statusText);
      }
    } catch (error) {
      console.error("Error al crear la venta:", error.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-slate-200 font-semibold text-3xl">Ventas</h1>
        <button
          className="bg-gray-800 text-gray-200 flex items-center rounded-md px-4 py-1 hover:bg-gray-600 hover:text-white"
          onClick={handleNewSale}
        >
          Nueva Venta +
        </button>
      </div>

      {/* Listado de ventas */}
      <div className="flex flex-col gap-4 border-solid border rounded-md border-gray-600 p-5">
        <h1 className="text-slate-200 font-medium text-xl">
          Listado de Ventas
        </h1>
        {sales.length === 0 ? (
          <p className="text-slate-200">No hay ventas registradas</p>
        ) : (
          sales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center mb-4"
            >
              <div className="flex items-center justify-center w-14 h-14 bg-gray-800 rounded-md mr-4">
          <FaCashRegister className="text-white" size={20} />{" "}
          {/* Icono de comida */}
        </div>
              <div className="flex justify-between w-full">
                <div>
                  <h2 className="text-slate-200 text-xl font-semibold">
                    Venta - {new Date(sale.updatedAt).toLocaleDateString("es-CL")} {/* Mostrar la fecha */}
                  </h2>
                  <span className="text-slate-300 text-sm">
                    Productos: {sale.products.length}
                  </span>
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
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mostrar formulario de nueva venta o edición */}
      {isNewSale ? (
        <SaleForm
          selectedProducts={selectedProducts}
          onAddProduct={handleAddProduct}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveProduct={handleRemoveProduct}
          onSubmit={handleSaleSubmit}
          products={products} // Pasar los productos disponibles al formulario
        />
      ) : null}
    </div>
  );
}

export default SaleTable;
