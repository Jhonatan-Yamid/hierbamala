"use client";

import React, { useState, useEffect, useMemo } from "react";

const ProductInventory = () => {
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [modifiedFields, setModifiedFields] = useState(new Map());
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsed, setCollapsed] = useState({});

  const daysAgo = (date) => {
    const today = new Date();
    const lastUpdated = new Date(date);
    today.setHours(0, 0, 0, 0);
    lastUpdated.setHours(0, 0, 0, 0);
    return Math.floor((today - lastUpdated) / (1000 * 3600 * 24));
  };

  // =========================================================
  // FETCH INITIAL DATA
  // =========================================================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/product");
        const data = await response.json();

        if (Array.isArray(data)) {
          setProducts(data);

          const grouped = data.reduce((acc, product) => {
            const { category } = product;
            const catName = category || "Sin Categoría";
            if (!acc[catName]) acc[catName] = [];
            acc[catName].push(product);
            return acc;
          }, {});

          setGroupedProducts(grouped);

          // Inicializa todas colapsadas
          const initState = {};
          Object.keys(grouped).forEach((cat) => (initState[cat] = true));
          setCollapsed(initState);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // =========================================================
  // FILTER by search
  // =========================================================
  const filteredGrouped = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    const result = {};

    Object.keys(groupedProducts).forEach((cat) => {
      result[cat] = groupedProducts[cat].filter((prod) =>
        prod.name.toLowerCase().includes(lower)
      );
    });

    return result;
  }, [searchTerm, groupedProducts]);

  // =========================================================
  // AUTO EXPAND/COLLAPSE on search
  // =========================================================
  useEffect(() => {
    if (searchTerm.trim() === "") {
      const allClosed = {};
      Object.keys(groupedProducts).forEach((cat) => (allClosed[cat] = true));
      setCollapsed(allClosed);
      return;
    }

    const expanded = {};
    Object.keys(groupedProducts).forEach((cat) => {
      expanded[cat] = groupedProducts[cat].some((prod) =>
        prod.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ? false : true;
    });

    setCollapsed(expanded);
  }, [searchTerm, groupedProducts]);

  // =========================================================
  // HANDLE CHANGE & BLUR
  // =========================================================
  const handleQuantityChange = (e, productId) => {
    const newValue = e.target.value;

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: newValue } : p))
    );

    setGroupedProducts((prev) => {
      const updated = {};
      Object.keys(prev).forEach((cat) => {
        updated[cat] = prev[cat].map((p) =>
          p.id === productId ? { ...p, quantity: newValue } : p
        );
      });
      return updated;
    });

    setModifiedFields((prev) => {
      const updated = new Map(prev);
      updated.set(productId, true);
      return updated;
    });
  };

  const handleQuantityBlur = (e, productId) => {
    const finalValue = e.target.value.trim();
    
    // Validamos que sea un número válido o esté vacío
    if (finalValue !== "" && isNaN(parseFloat(finalValue))) {
        alert("Por favor, ingresa un número válido.");
        return;
    }

    const parsedValue = finalValue === "" ? null : parseFloat(finalValue);

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: parsedValue } : p))
    );

    setGroupedProducts((prev) => {
      const updated = {};
      Object.keys(prev).forEach((cat) => {
        updated[cat] = prev[cat].map((p) =>
          p.id === productId ? { ...p, quantity: parsedValue } : p
        );
      });
      return updated;
    });
  };

  // =========================================================
  // SUBMIT (Actualización masiva)
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const modifiedData = Array.from(modifiedFields.entries())
      .filter(([, modified]) => modified)
      .map(([id]) => {
        const product = products.find((p) => p.id === id);
        // Enviamos el objeto completo como espera tu PUT
        return { 
            ...product,
            quantity: product.quantity === "" ? null : parseFloat(product.quantity)
        };
      });

    if (modifiedData.length === 0) {
        alert("No hay cambios para guardar.");
        return;
    }

    try {
      // Nota: Tu API actualiza de a uno. Para masivo podrías iterar o ajustar el API.
      // Aquí iteramos sobre los modificados llamando a tu PUT:
      const promises = modifiedData.map(prod => 
        fetch("/api/product", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(prod),
        })
      );

      const results = await Promise.all(promises);
      
      if (results.every(res => res.ok)) {
        alert("Inventario de productos actualizado exitosamente.");
        setModifiedFields(new Map());
        window.location.reload();
      } else {
        alert("Hubo un error al actualizar algunos productos.");
      }
    } catch (error) {
      console.error("Error enviando datos:", error);
    }
  };

  return (
    <div className="p-4 bg-gray-950 min-h-screen text-slate-200">
      <h1 className="text-2xl font-bold mb-4">Inventario de Productos</h1>

      <input
        type="text"
        placeholder="Buscar producto por nombre..."
        className="mb-6 p-2 rounded border border-gray-700 text-slate-200 bg-gray-900 w-full focus:border-blue-500 outline-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(groupedProducts).map((category) => {
          const productsInCategory = filteredGrouped[category];

          return (
            <div key={category} className="p-3 rounded-lg border border-gray-800 bg-gray-900">
              <div
                className="flex justify-between items-center cursor-pointer py-2"
                onClick={() =>
                  setCollapsed((prev) => ({
                    ...prev,
                    [category]: !prev[category],
                  }))
                }
              >
                <h2 className="text-md font-semibold uppercase tracking-wider text-blue-400">
                  {category}
                </h2>
                <span className="text-slate-500 text-sm">
                  {collapsed[category] ? "▶" : "▼"}
                </span>
              </div>

              <div
                className={`transition-all duration-300 ${
                  collapsed[category] ? "max-h-0 overflow-hidden opacity-0" : "max-h-none opacity-100"
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-3">
                  {productsInCategory.length === 0 ? (
                    <p className="text-slate-500 text-sm col-span-full italic">
                      No hay productos en esta categoría...
                    </p>
                  ) : (
                    productsInCategory.map((product) => {
                      const isModified = modifiedFields.get(product.id) || false;
                      const daysSinceUpdate = daysAgo(product.updatedAt);

                      return (
                        <div key={product.id} className="bg-gray-800 p-3 rounded-md border border-gray-700">
                          <div className="flex justify-between items-start mb-2">
                            <div className={`text-sm font-bold ${isModified ? "text-yellow-400" : "text-slate-200"}`}>
                              {product.name}
                              <div className="text-[0.65rem] font-normal text-slate-400 uppercase">
                                {product.typeUnity || "Unid."}
                              </div>
                            </div>
                            <small className="text-[0.6rem] text-slate-500 bg-gray-950 px-1 rounded">
                              {daysSinceUpdate === 0 ? "HOY" : `${daysSinceUpdate}d`}
                            </small>
                          </div>

                          <input
                            type="text"
                            value={product.quantity ?? ""}
                            placeholder="0.00"
                            onChange={(e) => handleQuantityChange(e, product.id)}
                            onBlur={(e) => handleQuantityBlur(e, product.id)}
                            className={`w-full p-2 rounded bg-gray-950 text-slate-200 text-center font-mono ${
                              isModified ? "border-2 border-yellow-500" : "border border-gray-700"
                            }`}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div className="sticky bottom-4 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform active:scale-95"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductInventory;