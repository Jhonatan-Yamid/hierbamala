"use client";

import { useState, useEffect } from "react";
import { Copy, ShoppingCart, Pencil, Trash2, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProviderForm() {
  const router = useRouter();

  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
    accountNumber: "",
    phone: "",
  });

  const [selectedProvider, setSelectedProvider] = useState(null);
  const [orderItems, setOrderItems] = useState({});

  // ---------------- FETCH ----------------
  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    const res = await fetch("/api/providers");
    const data = await res.json();
    setProviders(data);
    setFilteredProviders(data);
  };

  // ---------------- SEARCH ----------------
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = providers.filter((p) =>
      p.name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredProviders(filtered);
  };

  // ---------------- FORM ----------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = isEditing ? "PUT" : "POST";

    const res = await fetch("/api/providers", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      await fetchProviders();
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      description: "",
      accountNumber: "",
      phone: "",
    });
    setIsEditing(false);
    setIsFormVisible(false);
  };

  const handleEdit = (provider) => {
    setFormData({
      id: provider.id,
      name: provider.name || "",
      description: provider.description || "",
      accountNumber: provider.accountNumber || "",
      phone: provider.phone || "",
    });

    setIsEditing(true);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este proveedor?")) return;

    await fetch("/api/providers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    fetchProviders();
  };

  const handleCopy = (accountNumber) => {
    navigator.clipboard.writeText(accountNumber);
  };

  // ---------------- PEDIDOS ----------------
  const openOrderModal = (provider) => {
    setSelectedProvider(provider);
    setOrderItems({});
  };

  const sendOrder = () => {
    if (!selectedProvider.phone) {
      alert("Este proveedor no tiene número registrado");
      return;
    }

    const items = Object.values(orderItems).filter(
      (item) => item.quantity && item.quantity > 0
    );

    if (items.length === 0) {
      alert("Selecciona al menos un ingrediente");
      return;
    }

    let message = `${selectedProvider.name}, Pedido:\n\n`;

    items.forEach((item) => {
      message += `• ${item.quantity} - ${item.name}\n`;
    });

    const encoded = encodeURIComponent(message);
    window.open(
      `https://wa.me/${selectedProvider.phone}?text=${encoded}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-slate-200 p-6">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <h1 className="text-2xl font-semibold">Proveedores</h1>

          <button
            onClick={() => {
              if (isFormVisible) {
                resetForm();
              } else {
                setIsFormVisible(true);
                setIsEditing(false);
              }
            }}
            className="bg-gray-900 hover:bg-gray-800 border border-gray-800 px-4 py-2 rounded-xl transition"
          >
            {isFormVisible ? "Cancelar" : "Agregar proveedor"}
          </button>
        </div>

        {/* FORM */}
        {isFormVisible && (
          <form
            onSubmit={handleSubmit}
            className="bg-gray-900 border border-gray-800 p-6 rounded-2xl mb-10"
          >
            <h2 className="text-lg font-semibold mb-6">
              {isEditing ? "Editar proveedor" : "Nuevo proveedor"}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nombre"
                required
                className="inputStyle"
              />

              <input
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Número de cuenta"
                required
                className="inputStyle"
              />

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Celular (57300...)"
                className="inputStyle"
              />

              <input
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción"
                className="inputStyle"
              />
            </div>

            <button
              type="submit"
              className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl transition"
            >
              {isEditing ? "Actualizar" : "Guardar"}
            </button>
          </form>
        )}

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Buscar proveedor..."
          value={searchTerm}
          onChange={handleSearch}
          className="inputStyle mb-8"
        />

        {/* GRID */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <div
              key={provider.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {provider.name}
                  </h3>

                  {provider.phone && (
                    <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                      <Phone size={14} />
                      {provider.phone}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Pencil
                    size={18}
                    className="cursor-pointer text-gray-400 hover:text-white"
                    onClick={() => handleEdit(provider)}
                  />
                  <Trash2
                    size={18}
                    className="cursor-pointer text-gray-400 hover:text-red-400"
                    onClick={() => handleDelete(provider.id)}
                  />
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-2">
                {provider.description || "Sin descripción"}
              </p>

              <p className="text-sm text-gray-500 mb-4">
                Cuenta: {provider.accountNumber}
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleCopy(provider.accountNumber)}
                  className="btnSecondary"
                >
                  <Copy size={16} />
                  Copiar cuenta
                </button>

                {provider.ingredients?.length > 0 && (
                  <button
                    onClick={() => openOrderModal(provider)}
                    className="btnSecondary"
                  >
                    <ShoppingCart size={16} />
                    Realizar pedido
                  </button>
                )}

                <button
                  onClick={() =>
                    router.push(`/dashboard/providers/${provider.id}`)
                  }
                  className="btnPrimary"
                >
                  Ver movimientos
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* MODAL PEDIDO */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 w-full max-w-lg rounded-2xl p-6 border border-gray-800">

            <h2 className="text-lg font-semibold mb-4">
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
                      Stock: {ing.quantity ?? "Insuficiente"}
                    </div>
                  </div>

                  {orderItems[ing.id] && (
                    <input
                      type="number"
                      placeholder="Cantidad"
                      className="w-20 p-1 rounded bg-gray-800 border border-gray-700"
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

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-4 py-2 bg-gray-800 rounded-xl"
              >
                Cancelar
              </button>

              <button
                onClick={sendOrder}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                Enviar pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS REUTILIZABLES */}
      <style jsx>{`
        .inputStyle {
          width: 100%;
          padding: 10px 14px;
          background: #111827;
          border: 1px solid #1f2937;
          border-radius: 12px;
          outline: none;
          color: white;
        }

        .btnPrimary {
          background: #2563eb;
          padding: 10px;
          border-radius: 12px;
          transition: 0.2s;
        }

        .btnPrimary:hover {
          background: #1d4ed8;
        }

        .btnSecondary {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          background: #111827;
          border: 1px solid #1f2937;
          padding: 10px;
          border-radius: 12px;
          transition: 0.2s;
        }

        .btnSecondary:hover {
          background: #1f2937;
        }
      `}</style>
    </div>
  );
}
