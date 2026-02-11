"use client";

import { useState, useEffect } from "react";
import { FaCopy, FaPrint, FaShoppingCart } from "react-icons/fa";

const ProviderForm = () => {
  const [providers, setProviders] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
    accountNumber: "",
    phone: "", // 
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
const [orderItems, setOrderItems] = useState({});

const openOrderModal = (provider) => {
  setSelectedProvider(provider);
  setOrderItems({});
};

const sendOrder = () => {
  if (!selectedProvider.phone) {
    alert("Este proveedor no tiene número registrado");
    return;
  }

  const items = Object.values(orderItems)
    .filter(item => item.quantity && item.quantity > 0);

  if (items.length === 0) {
    alert("Selecciona al menos un ingrediente con cantidad");
    return;
  }

  let message = `Hola ${selectedProvider.name}, Pedido:\n\n`;

  items.forEach(item => {
    message += `• ${item.quantity} - ${item.name}\n`;
  });

  message += `\nGracias.`;

  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${selectedProvider.phone}?text=${encoded}`;

  window.open(url, "_blank");
};


  // Fetch providers on mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch("/api/providers");
        const data = await response.json();
        setProviders(data);
        setFilteredProviders(data);
      } catch (error) {
        console.error("Error fetching providers:", error);
      }
    };
    fetchProviders();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === "") {
      setFilteredProviders(providers);
    } else {
      const filtered = providers.filter((provider) =>
        provider.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProviders(filtered);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/providers` : `/api/providers`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedProvider = await response.json();
        setProviders((prev) =>
          isEditing
            ? prev.map((p) =>
              p.id === updatedProvider.id ? updatedProvider : p
            )
            : [...prev, updatedProvider]
        );
        setFilteredProviders((prev) =>
          isEditing
            ? prev.map((p) =>
              p.id === updatedProvider.id ? updatedProvider : p
            )
            : [...prev, updatedProvider]
        );
        setFormData({ id: null, name: "", description: "", accountNumber: "" });
        setIsEditing(false);
        setIsFormVisible(false);
      } else {
        console.error("Error saving provider");
      }
    } catch (error) {
      console.error("Error saving provider:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch("/api/providers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        const updatedProviders = providers.filter(
          (provider) => provider.id !== id
        );
        setProviders(updatedProviders);
        setFilteredProviders(updatedProviders);
      } else {
        console.error("Error deleting provider");
      }
    } catch (error) {
      console.error("Error deleting provider:", error);
    }
  };

  const handleCopy = (accountNumber) => {
    navigator.clipboard.writeText(accountNumber);
  };

  const handleEdit = (provider) => {
    setFormData(provider);
    setIsEditing(true);
    setIsFormVisible(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-slate-200">
        Gestión de Proveedores
      </h1>

      {/* Botón para mostrar/ocultar el formulario */}
      <button
        onClick={() => setIsFormVisible(!isFormVisible)}
        className="mb-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
      >
        {isFormVisible ? "Cancelar" : "Agregar Nuevo"}
      </button>

      {/* Formulario */}
      {isFormVisible && (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-lg border border-white bg-gray-950 mb-6"
        >
          <h2 className="text-xl font-semibold text-slate-200 mb-4">
            {isEditing ? "Editar Proveedor" : "Agregar Proveedor"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre del Proveedor"
              required
              className="p-2 rounded border border-gray-700 bg-gray-800 text-white"
            />
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción"
              className="p-2 rounded border border-gray-700 bg-gray-800 text-white"
            />
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Número de Cuenta"
              required
              className="p-2 rounded border border-gray-700 bg-gray-800 text-white"
            />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Celular (Ej: 573001234567)"
              className="p-2 rounded border border-gray-700 bg-gray-800 text-white"
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {isEditing ? "Actualizar Proveedor" : "Agregar Proveedor"}
          </button>
        </form>
      )}

      {selectedProvider && (
  <div className="text-white fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-gray-900 p-6 rounded-xl w-full max-w-lg">
      <h2 className="text-xl font-bold mb-4">
        Pedido a {selectedProvider.name}
      </h2>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {selectedProvider.ingredients.map((ing) => (
          <div key={ing.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  setOrderItems(prev => ({
                    ...prev,
                    [ing.id]: { quantity: "", name: ing.name }
                  }));
                } else {
                  const copy = { ...orderItems };
                  delete copy[ing.id];
                  setOrderItems(copy);
                }
              }}
            />

            <div className="flex-1">
              <div>{ing.name}</div>
              <div className="text-xs text-gray-400">
                Stock actual: {ing.quantity ?? "Insuficiente"}
              </div>
            </div>

            {orderItems[ing.id] && (
              <input
                type="number"
                placeholder="Cantidad"
                className="w-20 p-1 rounded bg-gray-800"
                onChange={(e) =>
                  setOrderItems(prev => ({
                    ...prev,
                    [ing.id]: {
                      ...prev[ing.id],
                      quantity: e.target.value
                    }
                  }))
                }
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setSelectedProvider(null)}
          className="bg-gray-700 px-4 py-2 rounded"
        >
          Cancelar
        </button>

        <button
          onClick={sendOrder}
          className="bg-green-500 px-4 py-2 rounded text-black font-semibold"
        >
          Enviar Pedido
        </button>
      </div>
    </div>
  </div>
)}


      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar proveedor..."
        value={searchTerm}
        onChange={handleSearch}
        className="mb-4 p-2 w-full rounded border border-gray-700 bg-gray-800 text-white"
      />

      {/* Lista de proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className="relative p-4 rounded-lg bg-gray-800 border border-gray-700"
          >
            <button
              onClick={() => handleDelete(provider.id)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-200 text-3xl"
            >
              &times; {/* Símbolo "X" para eliminar */}
            </button>
            <h3 className="text-lg font-semibold text-white">
              {provider.name}
            </h3>
            <p className="text-sm text-gray-400">
              {provider.description || "Sin descripción"}
            </p>
            <p className="text-sm text-gray-400">
              Cuenta: {provider.accountNumber}
            </p>
            <button
              onClick={() => handleCopy(provider.accountNumber)}
              className="mt-2 bg-gray-900 text-gray-200 text-white hover:bg-gray-600 hover:text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaCopy />Copiar Número de Cuenta
            </button>
            {provider.ingredients?.length > 0 && (
              <button
                onClick={() => openOrderModal(provider)}
                className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaShoppingCart /> Realizar Pedido
              </button>
            )}

          </div>
        ))}
      </div>
    </div>
  );
};

export default ProviderForm;
