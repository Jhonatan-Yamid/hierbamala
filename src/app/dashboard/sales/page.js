"use client";

import React, { useEffect, useState } from "react";

const SalesForm = () => {
  const [products, setProducts] = useState([]); // Lista de productos añadidos a la venta
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda
  const [suggestions, setSuggestions] = useState([]); // Sugerencias de autocompletado
  const [tableNumber, setTableNumber] = useState(""); // Número de mesa
  const [saleStatus, setSaleStatus] = useState("en proceso"); // Estado de la venta
  const [game, setGame] = useState(""); // Juego de mesa seleccionado
  const [generalObservation, setGeneralObservation] = useState(""); // Observaciones generales
  const [error, setError] = useState(""); // Error de validación
  const [showPreview, setShowPreview] = useState(false); // Estado para mostrar/ocultar la modal
  const [availableProducts, setAvailableProducts] = useState([]); // Productos disponibles desde la base de datos


  useEffect(() => {
    // Función para obtener los productos desde la API
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/product"); // Asumiendo que este es el endpoint correcto
        const data = await response.json();
        setAvailableProducts(data); // Guardamos los productos en el estado
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts(); // Llamamos a la función para obtener los productos al cargar el componente
  }, []); // El array vacío [] asegura que solo se ejecute una vez al montar el componente


  // Simulación de productos disponibles
  // const availableProducts = [
  //   { id: 1, name: "Hamburguesa", price: 15000 },
  //   { id: 2, name: "Asado", price: 25000 },
  //   { id: 3, name: "Refresco", price: 5000 },
  // ];

  // Simulación de juegos de mesa
  const availableGames = [
    { id: 1, name: "Ajedrez" },
    { id: 2, name: "Damas Chinas" },
    { id: 3, name: "Monopoly" },
  ];

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 0) {
      const filtered = availableProducts.filter((product) =>
        product.name.toLowerCase().includes(term.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const addProduct = (product) => {
    setProducts((prev) => [
      ...prev,
      { ...product, observation: "", quantity: 1 },  // Asegúrate de asignar una cantidad predeterminada
    ]);
    setSearchTerm("");
    setSuggestions([]);
  };
  

  const updateQuantity = (productId, newQuantity) => {
    setProducts((prevProducts) => {
      const filteredProducts = prevProducts.filter((p) => p.id !== productId);
      const existingInstances = prevProducts.filter((p) => p.id === productId);

      if (newQuantity > existingInstances.length) {
        const additionalProducts = Array(newQuantity - existingInstances.length)
          .fill(null)
          .map(() => ({
            ...existingInstances[0],
            observation: "",
          }));
        return [...filteredProducts, ...existingInstances, ...additionalProducts];
      } else if (newQuantity < existingInstances.length) {
        return [
          ...filteredProducts,
          ...existingInstances.slice(0, newQuantity),
        ];
      }

      return prevProducts;
    });
  };

  const updateObservation = (index, value) => {
    const updatedProducts = [...products];
    updatedProducts[index].observation = value;
    setProducts(updatedProducts);
  };

  const removeProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const calculateTotal = () => {
    return products.reduce(
      (total, product) => total + product.price,
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const saleData = {
      tableNumber: tableNumber,
      saleStatus: saleStatus,
      generalObservation: generalObservation,
      totalAmount: products.reduce((total, product) => total + product.price * (product.quantity || 1), 0),  // Asume 1 como valor por defecto
      products: products.map(product => ({
        id: product.id,
        quantity: product.quantity || 1,
        observation: product.observation,
      })),
    };
  
    try {
      const existingSale = await prisma.sale.findUnique({
        where: { id: saleId }, // si tienes un id de venta preexistente
        include: { products: true },
      });
  
      if (existingSale) {
        // Si la venta ya tiene productos, actualiza las cantidades de los productos existentes
        for (let product of saleData.products) {
          const existingProduct = existingSale.products.find(p => p.productId === product.id);
          if (existingProduct) {
            // Si el producto ya existe en la venta, actualiza la cantidad
            await prisma.saleProduct.update({
              where: {
                saleId_productId: { saleId: existingSale.id, productId: product.id },
              },
              data: {
                quantity: existingProduct.quantity + product.quantity,  // Actualiza la cantidad
                observation: product.observation || existingProduct.observation,  // Actualiza la observación
              },
            });
          } else {
            // Si el producto no existe, agrega uno nuevo
            await prisma.saleProduct.create({
              data: {
                saleId: existingSale.id,
                productId: product.id,
                quantity: product.quantity,
                observation: product.observation,
              },
            });
          }
        }
      } else {
        // Si no existe una venta, crea una nueva venta
        const newSale = await prisma.sale.create({
          data: {
            tableNumber: saleData.tableNumber,
            saleStatus: saleData.saleStatus,
            generalObservation: saleData.generalObservation,
            totalAmount: saleData.totalAmount,
            products: {
              create: saleData.products.map(product => ({
                productId: product.id,
                quantity: product.quantity,
                observation: product.observation,
              })),
            },
          },
          include: {
            products: true,
          },
        });
        console.log('Nueva venta creada:', newSale);
      }
    } catch (error) {
      console.error('Error al crear o actualizar la venta:', error);
    }
  };
  
  
  

  const handlePay = async () => {
    // Primero, enviar los datos de la venta al backend
    const saleData = {
      tableNumber: tableNumber,
      saleStatus: saleStatus,
      generalObservation: generalObservation,
      totalAmount: calculateTotal(),
      products: products.map(product => ({
        id: product.id,
        quantity: product.quantity,
        observation: product.observation,
      })),
    };
  
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
        console.log('Venta creada:', newSale);
        // Después de que la venta se haya guardado, mostramos la vista previa
        setShowPreview(true);
      } else {
        const errorData = await response.json();
        console.error('Error al crear la venta:', errorData.message);
        setError("Hubo un problema al guardar la venta.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setError("Hubo un error al conectar con el servidor.");
    }
  };
  


  
  const handlePrint = () => {
    const ticket = formatTicket();
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`<pre>${ticket}</pre>`);
    newWindow.document.close();
    newWindow.print();
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  // const handleShare = () => {
  //   const message = `
  //     Comanda:
  //     Mesa: ${tableNumber}
  //     Juego: ${game}
  //     Productos:
  //     ${products
  //       .map(
  //         (product, index) =>
  //           ` - ${product.name} (${product.price}): ${product.observation || "Sin observaciones"}`
  //       )
  //       .join("\n")}
  //     Total: $${calculateTotal()}
  //   `;
  //   const encodedMessage = encodeURIComponent(message);
  //   window.open(`https://wa.me/?text=${encodedMessage}`);
  // };
  const formatTicket = () => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString("es-CO");
    const formattedTime = date.toLocaleTimeString("es-CO");

    let ticket = `Hierba Mala Gastrobar\n`;
    ticket += `*** ${formattedDate} ${formattedTime} ***\n`;
    ticket += `Mesa: ${tableNumber}\n`;
    ticket += `Juego: ${
      availableGames.find((g) => g.id.toString() === game)?.name || "N/A"
    }\n`;
    ticket += `------------------------------------------\n`;
    ticket += "Cant\t Productos\n";

    // Agrupar productos por nombre
    const groupedProducts = products.reduce((acc, product) => {
      const key = product.name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(product);
      return acc;
    }, {});

    Object.entries(groupedProducts).forEach(([productName, instances]) => {
      ticket += `${instances.length} ${productName}\n`;
      instances.forEach((instance, index) => {
        ticket += `\t|${index + 1}. $${instance.price.toLocaleString()} (${
          instance.observation || "sin observaciones"
        })\n`;
      });
    });

    ticket += `------------------------------------------\n`;
    ticket += `\t\t\t\tTotal: $${calculateTotal().toLocaleString()}\n`;

    return ticket;
  };

  const handleShare = async () => {
    const ticketContent = formatTicket();
    const blob = new Blob([ticketContent], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const encodedMessage = encodeURIComponent(
      `Aquí tienes el ticket:\n${ticketContent}`
    );
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-950 text-slate-200 p-6 rounded-md space-y-4">
      <h2 className="text-xl font-bold">Nueva Venta</h2>

      <div>
        <label htmlFor="productSearch" className="block text-sm font-medium">
          Buscar Producto
        </label>
        <input
          type="text"
          id="productSearch"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded-md"
          placeholder="Escribe para buscar productos..."
        />
        {suggestions.length > 0 && (
          <ul className="mt-2 bg-gray-800 border border-gray-700 rounded-md">
            {suggestions.map((product) => (
              <li
                key={product.id}
                onClick={() => addProduct(product)}
                className="p-2 hover:bg-gray-700 cursor-pointer"
              >
                {product.name} - ${product.price}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold">Productos Añadidos</h3>
        {availableProducts.map((product) => {
          const productInstances = products.filter((p) => p.id === product.id);
          return productInstances.length > 0 ? (
            <div key={product.id} className="p-2 mt-2 bg-gray-900 border border-gray-700 rounded-md">
              <p>{product.name} (${product.price} c/u)</p>
              <input
                type="number"
                min="1"
                value={productInstances.length}
                onChange={(e) => updateQuantity(product.id, parseInt(e.target.value, 10))}
                className="w-16 p-1 mt-1 bg-gray-800 border border-gray-700 rounded-md"
              />
              {productInstances.map((instance, index) => (
                <div key={index} className="flex items-center mt-2">
                  <span className="text-sm font-medium mr-2">{`Observación ${index + 1}:`}</span>
                  <input
                    type="text"
                    placeholder="Observaciones"
                    value={instance.observation}
                    onChange={(e) => updateObservation(products.indexOf(instance), e.target.value)}
                    className="w-full p-1 bg-gray-800 border border-gray-700 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeProduct(products.indexOf(instance))}
                    className="text-red-500 hover:underline ml-2 text-2xl"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          ) : null;
        })}
      </div>

      <div>
        <label htmlFor="tableNumber" className="block text-sm font-medium">
          Número de Mesa
        </label>
        <input
          type="text"
          id="tableNumber"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="game" className="block text-sm font-medium">
          Juego de Mesa
        </label>
        <select
          id="game"
          value={game}
          onChange={(e) => setGame(e.target.value)}
          className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded-md"
        >
          <option value="">Selecciona un juego</option>
          {availableGames.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="generalObservation" className="block text-sm font-medium">
          Observaciones Generales
        </label>
        <textarea
          id="generalObservation"
          value={generalObservation}
          onChange={(e) => setGeneralObservation(e.target.value)}
          className="w-full p-2 mt-1 bg-gray-900 border border-gray-700 rounded-md"
          placeholder="Escribe aquí observaciones generales..."
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="button"
        onClick={handlePay}
        className="w-full p-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md"
      >
        Pagar
      </button>

          {/* Modal de vista previa */}
          {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 text-slate-200 p-4 rounded-md w-96">
            <h3 className="text-lg font-bold mb-2">Vista Previa del Ticket</h3>
            <pre className="bg-gray-800 p-2 rounded-md whitespace-pre-wrap">
              {formatTicket()}
            </pre>
            <div className="mt-4 flex justify-between">
              <button
                onClick={handlePrint}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md"
              >
                Imprimir
              </button>
              <button
                onClick={handleShare}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-md"
              >
                Compartir por WhatsApp
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handlePreview}
        className="w-full p-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md"
      >
        Ver Vista Previa
      </button>
    </form>
  );
};

export default SalesForm;
