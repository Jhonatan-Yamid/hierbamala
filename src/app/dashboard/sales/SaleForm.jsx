import { useState } from "react";

function SaleForm({
  selectedProducts,
  onAddProduct,
  onUpdateQuantity,
  onRemoveProduct,
  onSubmit,
  products,
}) {
  const [totalAmount, setTotalAmount] = useState(() =>
    selectedProducts.reduce(
      (acc, product) => acc + (product.price || 0) * (product.quantity || 1), 
      0
    )
  );

  const handleQuantityChange = (id, value) => {
    const newQuantity = parseInt(value, 10);
    if (isNaN(newQuantity) || newQuantity < 1) return;

    onUpdateQuantity(id, newQuantity);

    // Recalcular el total
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
    };
    onSubmit(saleData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-slate-700 text-slate-200">
      <h2 className="text-2xl font-bold mb-4">Nueva Venta</h2>

      {/* Listado de productos disponibles para añadir a la venta */}
      <div className="mb-4">
        <label htmlFor="product" className="block mb-2">Añadir Producto:</label>
        <select
          id="product"
          onChange={
            (e) =>
            onAddProduct(products.find((p) => p.id === parseInt(e.target.value)))
          }
          className="w-full p-2 bg-slate-800 text-slate-200 rounded"
        >
          <option value="">Selecciona un producto</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} - ${product.price}
            </option>
          ))}
        </select>
      </div>

      {/* Listado de productos seleccionados */}
      <ul>
        {selectedProducts.map((product) => (
          <li key={product.id} className="mb-4 flex justify-between">
            <span>{product.name}</span>
            <input
              type="number"
              value={product.quantity}
              min="1"
              onChange={(e) => handleQuantityChange(product.id, e.target.value)}
              className="bg-slate-800 text-slate-200 p-2 rounded w-20"
            />
            <button
              type="button"
              onClick={() => onRemoveProduct(product.id)}
              className="bg-red-500 text-white p-2 rounded"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      {/* Total */}
      <div className="flex justify-between text-xl font-semibold mt-4">
        <span>Total:</span>
        <span>{totalAmount}</span>
      </div>

      <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-4">
        Guardar Venta
      </button>
    </form>
  );
}

export default SaleForm;
