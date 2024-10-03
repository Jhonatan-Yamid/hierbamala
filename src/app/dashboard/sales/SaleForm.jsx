import { useState, useEffect } from "react";

function SaleForm({
    selectedProducts,
    onAddProduct,
    onUpdateQuantity,
    onRemoveProduct,
    onSubmit,
    products,
    initialStatus, // Recibir el estado inicial de la venta
  initialTableNumber, // Recibir el número de mesa inicial
}) {
    const [totalAmount, setTotalAmount] = useState(0);
    const [searchTerm, setSearchTerm] = useState(""); 
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [status, setStatus] = useState(initialStatus || "en proceso"); // Usar el valor inicial
  const [tableNumber, setTableNumber] = useState(initialTableNumber || ""); // Usar el valor inicial
    console.log(status);
    useEffect(() => {
        const calculatedTotal = selectedProducts.reduce(
            (acc, product) => acc + (product.price || 0) * (product.quantity || 1),
            0
        );
        setTotalAmount(calculatedTotal);
    }, [selectedProducts]);
    useEffect(() => {
        setStatus(initialStatus || "en proceso"); // Actualizar el estado cuando cambie initialStatus
        setTableNumber(initialTableNumber || ""); // Actualizar la mesa cuando cambie initialTableNumber
      }, [initialStatus, initialTableNumber]);
    

    const handleQuantityChange = (id, value) => {
        const newQuantity = parseInt(value, 10);
        if (isNaN(newQuantity) || newQuantity < 1) return;

        onUpdateQuantity(id, newQuantity);

        const updatedTotal = selectedProducts.reduce(
            (acc, product) => acc + (product.id === id ? newQuantity : product.quantity) * product.price,
            0
        );
        setTotalAmount(updatedTotal);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const saleData = {
            totalAmount,
            products: selectedProducts.map((product) => ({
                productId: product.id,
                quantity: product.quantity,
            })),
            status, // Asegúrate de que este nombre sea consistente
            tableNumber, // Asegúrate de que este nombre sea consistente
        };
        onSubmit(saleData);
    };
    

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value) {
            const filtered = products.filter((product) =>
                product.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts([]);
        }
    };

    const handleProductSelect = (product) => {
        onAddProduct(product);
        setSearchTerm("");
        setFilteredProducts([]);
    };

    return (
        <form onSubmit={handleSubmit} className="text-slate-200 p-6 border-solid border rounded-md border-gray-600">
            <h1 className="text-slate-200 font-medium text-xl mb-4">Formulario</h1>

            <div className="mb-4">
                <label htmlFor="product" className="block mb-2">Añadir Producto:</label>
                <input
                    type="text"
                    id="product"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full p-2 bg-slate-800 text-slate-200 rounded"
                    placeholder="Buscar producto..."
                />
                {filteredProducts.length > 0 && (
                    <ul className="absolute bg-gray-900 rounded-md w-full mt-1 max-h-60 overflow-y-auto z-10">
                        {filteredProducts.map((product) => (
                            <li
                                key={product.id}
                                className="p-2 cursor-pointer hover:bg-gray-700"
                                onClick={() => handleProductSelect(product)}
                            >
                                {product.name} - ${product.price}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <ul>
                {selectedProducts.map((product) => (
                    <li key={product.id} className="mb-4 flex justify-between">
                        <span>{product.name}</span>
                        <input
                            type="number"
                            value={product.quantity}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            className="bg-slate-800 text-slate-200 p-2 rounded w-20"
                        />
                        <button
                            type="button"
                            onClick={() => onRemoveProduct(product.id)}
                            className="text-gray-600 hover:text-gray-200 text-3xl"
                        >
                            &times;
                        </button>
                    </li>
                ))}
            </ul>

            <div className="flex justify-between text-xl font-semibold mt-4">
                <span>Total:</span>
                <span>{totalAmount}</span>
            </div>

            <div className="mb-4">
                <label htmlFor="saleStatus" className="block mb-2">Estado de la Venta:</label>
                <select
                    id="saleStatus"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2 bg-slate-800 text-slate-200 rounded"
                >
                    <option value="en proceso">En Proceso</option>
                    <option value="finalizada">Finalizada</option>
                </select>
            </div>

            <div className="mb-4">
                <label htmlFor="tableNumber" className="block mb-2">Número de Mesa:</label>
                <input
                    type="number"
                    id="tableNumber"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full p-2 bg-slate-800 text-slate-200 rounded"
                    placeholder="Número de mesa..."
                />
            </div>

            <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-4">
                Guardar Venta
            </button>
        </form>
    );
}

export default SaleForm;
