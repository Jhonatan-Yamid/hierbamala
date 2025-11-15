"use client";
import React, { useState, useMemo } from "react";
import {
  FaDrumstickBite,
  FaCoffee,
  FaGlassCheers,
  FaBeer,
  FaCocktail,
  FaUtensils,
  FaHamburger,
  FaWineBottle,
  FaBoxes,
  FaStickyNote,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaMinus,
  FaTimes,
} from "react-icons/fa";

/**
 * ProductList.jsx
 *
 * Props:
 * - products: array of product instances (cada unidad como un item individual)
 * - setProducts: setter for products
 * - availableAdditions: array de adiciones disponibles { id, name, price }
 * - availableProducts: array de productos con { id, name, price, category }
 *
 * UI: Total Dark UI Premium — chips/badges, plus/minus, collapse, responsive
 */

const CATEGORY_ORDER = [
  "Entradas",
  "Los Platos de la Casa",
  "Asados",
  "Hamburguesas Artesanales",
  "Bebidas Calientes",
  "Bebidas Frías y Refrescantes",
  "Cerveza Artesanal",
  "Cocktails de Autor",
  "Licores",
  "Otros",
];

const CATEGORY_META = {
  Asados: { icon: FaDrumstickBite, color: "from-amber-600 to-rose-600" },
  "Bebidas Calientes": { icon: FaCoffee, color: "from-yellow-600 to-amber-400" },
  "Bebidas Frías y Refrescantes": { icon: FaGlassCheers, color: "from-cyan-500 to-blue-500" },
  "Cerveza Artesanal": { icon: FaBeer, color: "from-amber-700 to-yellow-500" },
  "Cocktails de Autor": { icon: FaCocktail, color: "from-pink-500 to-purple-500" },
  Entradas: { icon: FaUtensils, color: "from-red-800 to-yellow-600" },
  "Hamburguesas Artesanales": { icon: FaHamburger, color: "from-red-600 to-orange-400" },
  Licores: { icon: FaWineBottle, color: "from-violet-700 to-red-500" },
  "Los Platos de la Casa": { icon: FaBoxes, color: "from-emerald-700 to-emerald-400" },
  Otros: { icon: FaStickyNote, color: "from-gray-600 to-gray-400" },
};

const formatCLP = (value) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(value || 0);

export default function ProductList({ products, setProducts, availableAdditions = [], availableProducts = [] }) {
  const [openCategory, setOpenCategory] = useState(null);
  const [openInstanceIndex, setOpenInstanceIndex] = useState(null);
  const [additionSearch, setAdditionSearch] = useState({});

  // agrupar availableProducts por categoría
  const groupedProducts = useMemo(() => {
    const map = {};
    for (const prod of availableProducts) {
      const cat = prod.category || "Otros";
      if (!map[cat]) map[cat] = [];
      map[cat].push(prod);
    }
    // ensure standard categories exist
    for (const cat of CATEGORY_ORDER) {
      if (!map[cat]) map[cat] = [];
    }
    return map;
  }, [availableProducts]);

  // contar cuántos items seleccionados por categoría
  const selectedCountByCategory = useMemo(() => {
    const counts = {};
    for (const [cat, items] of Object.entries(groupedProducts)) {
      counts[cat] = 0;
      for (const item of items) {
        counts[cat] += products.filter((p) => p.id === item.id).length;
      }
    }
    return counts;
  }, [groupedProducts, products]);

  // categorias ordenadas para render
  const renderCategories = useMemo(() => {
    const extra = Object.keys(groupedProducts).filter(c => !CATEGORY_ORDER.includes(c)).sort();
    return [...CATEGORY_ORDER.filter(c => groupedProducts[c] !== undefined), ...extra];
  }, [groupedProducts]);

  // helpers para manejar instancias
  const incrementProduct = (productId) => {
    const template = availableProducts.find((p) => p.id === productId) || {};
    const instance = {
      id: productId,
      name: template.name || "Producto",
      price: template.price || 0,
      observation: "",
      additions: [],
      additionSearchTerm: "",
      additionSuggestions: [],
    };
    setProducts((prev) => [...prev, instance]);
  };

  const decrementProduct = (productId) => {
    setProducts((prev) => {
      const i = [...prev].reverse().findIndex((p) => p.id === productId);
      if (i === -1) return prev;
      const idxFromStart = prev.length - 1 - i;
      const copy = [...prev];
      copy.splice(idxFromStart, 1);
      // ajustar índice abierto
      setOpenInstanceIndex((openIdx) => (openIdx === null ? null : openIdx > idxFromStart ? openIdx - 1 : openIdx === idxFromStart ? null : openIdx));
      return copy;
    });
  };

  const getInstanceGlobalIndices = (productId) =>
    products.map((p, idx) => ({ p, idx })).filter(x => x.p.id === productId).map(x => x.idx);

  const toggleInstanceOpen = (globalIndex) => setOpenInstanceIndex(prev => prev === globalIndex ? null : globalIndex);

  const updateObservation = (globalIndex, text) => {
    setProducts(prev => {
      const copy = [...prev];
      copy[globalIndex] = { ...copy[globalIndex], observation: text };
      return copy;
    });
  };

  const handleAdditionSearch = (globalIndex, term) => {
    setAdditionSearch(s => ({ ...s, [globalIndex]: term }));
    setProducts(prev => {
      const copy = [...prev];
      const prod = { ...copy[globalIndex] };
      prod.additionSearchTerm = term;
      prod.additionSuggestions = availableAdditions.filter(a => a.name.toLowerCase().includes((term || "").toLowerCase())).slice(0, 8);
      copy[globalIndex] = prod;
      return copy;
    });
  };

  const addAdditionToInstance = (globalIndex, addition) => {
    setProducts(prev => {
      const copy = [...prev];
      const prod = { ...copy[globalIndex] };
      prod.additions = [...(prod.additions || []), addition];
      prod.additionSearchTerm = "";
      prod.additionSuggestions = [];
      copy[globalIndex] = prod;
      return copy;
    });
    setAdditionSearch(s => ({ ...s, [globalIndex]: "" }));
  };

  const removeAddition = (globalIndex, addIndex) => {
    setProducts(prev => {
      const copy = [...prev];
      const prod = { ...copy[globalIndex] };
      prod.additions = [...(prod.additions || [])];
      prod.additions.splice(addIndex, 1);
      copy[globalIndex] = prod;
      return copy;
    });
  };

  const removeInstance = (globalIndex) => {
    setProducts(prev => {
      const copy = [...prev];
      copy.splice(globalIndex, 1);
      setOpenInstanceIndex(openIdx => openIdx === null ? null : openIdx > globalIndex ? openIdx - 1 : openIdx === globalIndex ? null : openIdx);
      return copy;
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Productos Añadidos</h3>

      {renderCategories.map(category => {
        const items = groupedProducts[category] || [];
        const selectedCount = selectedCountByCategory[category] || 0;
        if (!selectedCount) return null;

        const meta = CATEGORY_META[category] || CATEGORY_META["Otros"];
        const Icon = meta?.icon || FaStickyNote;
        const colorClass = meta?.color || "from-gray-600 to-gray-400";

        return (
          <div key={category} className="bg-[#0b0f12] border border-gray-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenCategory(openCategory === category ? null : category)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-900"
            >
              <div className="flex items-center gap-3">
                <span className={`p-2 rounded-md bg-gradient-to-br ${colorClass} text-white flex items-center justify-center`}>
                  <Icon />
                </span>
                <div>
                  <div className="text-sm font-semibold text-left">{category}</div>
                  <div className="text-xs text-gray-400 hidden sm:block text-left">Agrupado — toca para expandir</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-white/3 to-white/6 text-white/90">
                  {selectedCount} item{selectedCount > 1 ? "s" : ""}
                </span>
                <div className="text-gray-400">{openCategory === category ? <FaChevronUp /> : <FaChevronDown />}</div>
              </div>
            </button>

            {openCategory === category && (
              <div className="p-4 space-y-4">
                {items.map(product => {
                  const instances = products.filter(p => p.id === product.id);
                  if (instances.length === 0) return null;
                  const globalIndices = getInstanceGlobalIndices(product.id);

                  return (
                    <div key={product.id} className="space-y-3">
                      <div className="p-3 bg-gradient-to-r from-white/3 to-white/6 rounded-md border border-gray-800">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-md bg-gray-800 flex items-center justify-center text-lg text-white">
                              <Icon />
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-400">{formatCLP(product.price)}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-gray-900 rounded-md overflow-hidden border border-gray-800">
                              <button onClick={() => decrementProduct(product.id)} className="px-3 py-2 hover:bg-gray-800" aria-label="disminuir"><FaMinus /></button>
                              <div className="px-4 py-2 text-sm font-semibold">{instances.length}</div>
                              <button onClick={() => incrementProduct(product.id)} className="px-3 py-2 hover:bg-gray-800" aria-label="aumentar"><FaPlus /></button>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          {instances.map((inst, i) => {
                            const globalIndex = globalIndices[i];
                            const isOpen = openInstanceIndex === globalIndex;
                            return (
                              <div key={globalIndex} className="bg-gray-900 border border-gray-800 rounded-md p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="text-sm font-medium">#{i + 1}</div>
                                    <div className="text-xs text-gray-400">
                                      {inst.observation ? inst.observation : "Sin observacion"}
                                    </div>

                                    {inst.additions?.length > 0 && (
                                      <div className="flex gap-2 ml-2 flex-wrap">
                                        {inst.additions.slice(0, 3).map((a, ai) => (
                                          <span key={`${globalIndex}-a-${ai}`} className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-white/5 to-white/2 text-white/90">
                                            +{a.name}
                                          </span>
                                        ))}
                                        {inst.additions.length > 3 && <span className="text-xs text-gray-400">+{inst.additions.length - 3} más</span>}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button onClick={() => toggleInstanceOpen(globalIndex)} className="px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-700 flex items-center gap-2 text-xs">
                                      {isOpen ? <><FaChevronUp /><span>Cerrar</span></> : <><FaChevronDown /><span>Abrir</span></>}
                                    </button>

                                    <button onClick={() => removeInstance(globalIndex)} className="text-red-400 hover:text-red-300 px-2" aria-label="Eliminar unidad">
                                      <FaTimes />
                                    </button>
                                  </div>
                                </div>

                                {isOpen && (
                                  <div className="mt-3 space-y-3">
                                    <div>
                                      <label className="text-xs text-gray-400">Observaciones</label>
                                      <textarea value={inst.observation || ""} onChange={(e) => updateObservation(globalIndex, e.target.value)} placeholder="Ej: sin cebolla, bien cocido..." className="w-full mt-1 p-2 bg-[#050607] border border-gray-800 rounded-md text-sm" rows={2} />
                                    </div>

                                    <div>
                                      <label className="text-xs text-gray-400">Agregar adición</label>
                                      <input type="text" value={inst.additionSearchTerm || additionSearch[globalIndex] || ""} onChange={(e) => handleAdditionSearch(globalIndex, e.target.value)} placeholder="Buscar adición..." className="w-full mt-1 p-2 bg-[#050607] border border-gray-800 rounded-md text-sm" />
                                      {inst.additionSuggestions?.length > 0 && (
                                        <ul className="mt-2 bg-[#060708] border border-gray-800 rounded-md max-h-44 overflow-y-auto">
                                          {inst.additionSuggestions.map(add => (
                                            <li key={`${globalIndex}-s-${add.id}`} onClick={() => addAdditionToInstance(globalIndex, add)} className="p-2 hover:bg-gray-800 cursor-pointer flex justify-between">
                                              <span>{add.name}</span>
                                              <span className="text-sm text-gray-400">{formatCLP(add.price)}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>

                                    <div className="flex gap-2 flex-wrap">
                                      {inst.additions?.map((a, ai) => (
                                        <div key={`${globalIndex}-chip-${ai}`} className="flex items-center gap-2 bg-gradient-to-r from-white/5 to-white/2 px-3 py-1 rounded-full">
                                          <span className="text-sm">{a.name}</span>
                                          <span className="text-xs text-gray-400">{formatCLP(a.price)}</span>
                                          <button onClick={() => removeAddition(globalIndex, ai)} className="text-red-400 hover:text-red-300 text-sm"><FaTimes /></button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
