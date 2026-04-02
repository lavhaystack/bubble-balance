import { useState } from "react";

export default function AddProductModal({ onClose, onAdd }: any) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: 0,
    price: 0,
    expiration: "",
    supplier: "",
    status: "In Stock",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleSubmit = () => {
    if (!form.name || !form.sku) {
      alert("Name and SKU are required");
      return;
    }
    onAdd(form);   
    onClose();    
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[600px]">
        <h2 className="text-xl font-bold mb-2">Add New Product</h2>
        <p className="text-gray-600 mb-4">Fill in product details</p>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col">
            <span className="text-sm font-semibold">Product Name*</span>
            <input name="name" onChange={handleChange} className="border px-2 py-1 rounded"/>
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-semibold">SKU*</span>
            <input name="sku" onChange={handleChange} className="border px-2 py-1 rounded"/>
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-semibold">Category*</span>
            <input name="category" onChange={handleChange} className="border px-2 py-1 rounded"/>
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-semibold">Quantity*</span>
            <input name="quantity" type="number" onChange={handleChange} className="border px-2 py-1 rounded"/>
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-semibold">Price*</span>
            <input name="price" type="number" step="0.01" onChange={handleChange} className="border px-2 py-1 rounded"/>
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-semibold">Expiration*</span>
            <input name="expiration" type="date" onChange={handleChange} className="border px-2 py-1 rounded"/>
          </label>
          <label className="flex flex-col col-span-2">
            <span className="text-sm font-semibold">Supplier*</span>
            <input name="supplier" onChange={handleChange} className="border px-2 py-1 rounded"/>
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded">
            Cancel
          </button>
          <button onClick={handleSubmit} className="bg-teal-600 text-white px-4 py-2 rounded">
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}