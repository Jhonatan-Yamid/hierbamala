"use client";

import { useState, useEffect } from "react";

const ProviderForm = () => {
  const [providers, setProviders] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
    accountNumber: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProviders, setFilteredProviders] = useState([]);

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
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
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
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {isEditing ? "Actualizar Proveedor" : "Agregar Proveedor"}
          </button>
        </form>
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
              className="mt-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              Copiar Número de Cuenta
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProviderForm;
