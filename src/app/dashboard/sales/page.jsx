"use client";
import { useState, useEffect } from "react";
import { FaCashRegister } from "react-icons/fa"; // Importar el ícono de caja registradora
import SaleForm from "./SaleForm";
import { IoClose } from "react-icons/io5";

function SaleTable() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editingSale, setEditingSale] = useState(null); // Para editar una venta
  const [isNewSale, setIsNewSale] = useState(false); // Para crear una nueva venta
  const [editingStatus, setEditingStatus] = useState(""); // Para el estado de la venta
const [editingTableNumber, setEditingTableNumber] = useState("");

  // Función para obtener la fecha de hoy sin la hora (solo día, mes y año)
  const getTodayDate = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  useEffect(() => {
    // Obtener las ventas
    fetch("/api/sale")
      .then((res) => res.json())
      .then((data) => {
        // Filtrar las ventas para que solo se muestren las del día de hoy
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
    // Deshabilitar el scroll en el fondo
    document.body.style.overflow = "hidden";
  };

  const handleCloseForm = () => {
    setIsNewSale(false);
    // Habilitar el scroll en el fondo
    document.body.style.overflow = "auto";
  };

  const handleEditSale = (sale) => {
    // Asegúrate de que la venta incluye los productos
    if (sale.products && sale.products.length > 0) {
      setSelectedProducts(
        sale.products.map((saleProduct) => ({
          ...saleProduct.product, // Aquí accedemos al producto asociado
          quantity: saleProduct.quantity || 0, // La cantidad que ya estaba
        }))
      );
    } else {
      setSelectedProducts([]); // En caso de que no haya productos
    }
  
    // Setear el estado de la venta y el número de mesa
    setEditingSale(parseInt(sale.id)); // Guardar la venta que se está editando
    setIsNewSale(true);
    
    // Aquí debes actualizar el estado y la mesa en SaleForm
    setEditingStatus(sale.status); // Nuevo estado para 'status'
    setEditingTableNumber(sale.table); // Nuevo estado para 'tableNumber'
  
    document.body.style.overflow = "hidden"; // Deshabilitar scroll
  };
  

  const handleDeleteSale = async (saleId) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta venta?")) {
      try {
        const response = await fetch(`/api/sale?id=${saleId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setSales(sales.filter((sale) => sale.id !== saleId)); // Actualizar la lista de ventas
        } else {
          console.error("Error al eliminar la venta:", response.statusText);
        }
      } catch (error) {
        console.error("Error al eliminar la venta:", error.message);
      }
    }
  };

  const handleAddProduct = (product) => {
    setSelectedProducts([...selectedProducts, { ...product, quantity: 0 }]);
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

  // ...el resto del código permanece igual...

  const handleSaleSubmit = async (saleData) => {
    const saleId = editingSale;

    const url = saleId ? `/api/sale?id=${saleId}` : `/api/sale`; // Usar POST para nuevas ventas
    const method = saleId ? "PUT" : "POST"; // Usar PUT para actualizar y POST para crear
    console.log(saleData);
    const sanitizedSaleData = {
      totalAmount: saleData.totalAmount,
      products: saleData.products.map(({ productId, quantity }) => ({
        productId,
        quantity,
      })), // Asegúrate de que solo estás enviando lo necesario
      status: saleData.status, // Asegúrate de que estás utilizando el nombre correcto aquí
      table: saleData.tableNumber, // Asegúrate de que estás utilizando el nombre correcto aquí
    };

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizedSaleData), // Utiliza el objeto sanitizado aquí
    });

    if (!response.ok) {
      console.error("Error en la solicitud:", response.statusText);
    } else {
      console.log("Venta enviada con éxito");
      // Cierra el formulario después de guardar
      handleCloseForm();
      // Actualiza la lista de ventas (opcional, podrías hacerlo con un fetch)
    }
  };

  // ...el resto del componente permanece igual...

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
              className="flex items-center mb-4 cursor-pointer"
              onClick={() => handleEditSale(sale)}
            >
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
                      e.stopPropagation(); // Evita que el evento de clic se propague
                      handleDeleteSale(sale.id);
                    }}
                    className="text-gray-600 hover:text-gray-200 text-3xl ml-4"
                  >
                    &times;
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
            {/* Contenedor para el título y el botón de cerrar */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-2xl font-semibold">
                {editingSale ? "Editar Venta" : "Nueva Venta"}
              </h2>
              {/* Botón de cerrar en la esquina derecha */}
              <button
                className="text-white hover:text-gray-400"
                onClick={handleCloseForm}
              >
                <IoClose size={30} />
              </button>
            </div>
            <div className="h-full overflow-y-auto">
            <SaleForm
  selectedProducts={selectedProducts}
  onAddProduct={handleAddProduct}
  onUpdateQuantity={handleUpdateQuantity}
  onRemoveProduct={handleRemoveProduct}
  onSubmit={handleSaleSubmit}
  products={products} // Pasar los productos disponibles al formulario
  initialStatus={editingStatus} // Pasa el estado de la venta
  initialTableNumber={editingTableNumber} // Pasa el número de mesa de la venta
/>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SaleTable;
