import { useState } from "react";
import { PencilIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/solid";

export default function ProductRow({ product, updateProduct, deleteProduct }: any) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(product);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const getStatus = (quantity: number) => {
    if (quantity <= 35) return "Low";
    return "In Stock";
  };

  return (
    <tr className="hover:bg-gray-50 border-b">
      {/* Product Name + Supplier */}
      <td className="px-10 py-2">
        {editing ? (
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border px-2 py-5 rounded w-full"
          />
        ) : (
          <div>
            <span className="text-xl font-bold">{product.name}</span>
            <div className="text-sm text-gray-600">{product.supplier}</div>
          </div>
        )}
      </td>

      {/* SKU */}
      <td className="px-3 py-2">
        {editing ? (
          <input
            name="sku"
            value={form.sku}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />
        ) : (
          product.sku
        )}
      </td>

      {/* Category */}
      <td className="px-3 py-2">
        {editing ? (
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />
        ) : (
          product.category
        )}
      </td>

      {/* Quantity */}
      <td className="px-3 py-2">
        {editing ? (
          <input
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-20"
          />
        ) : (
          product.quantity
        )}
      </td>

      {/* Price */}
      <td className="px-3 py-2">
        {editing ? (
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-24"
          />
        ) : (
          `$${Number(product.price).toFixed(2)}`
        )}
      </td>

      {/* Status */}
      <td className="px-3 py-2">
        {editing ? (
          <input
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />
        ) : (
          getStatus(product.quantity)
        )}
      </td>

      {/* Expiration */}
      <td className="px-3 py-2">
        {editing ? (
          <input
            name="expiration"
            type="date"
            value={form.expiration}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          />
        ) : (
          product.expiration
        )}
      </td>

      {/* Actions */}
      <td className="px-3 py-2 flex gap-2 justify-center">
        {editing ? (
          <button
            onClick={() => {
              updateProduct(form);
              setEditing(false);
            }}
            className="bg-blue-600 text-white w-8 h-8 rounded flex items-center justify-center"
          >
            <CheckIcon className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="bg-yellow-500 text-white w-8 h-8 rounded flex items-center justify-center"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => deleteProduct(product.sku)}
          className="bg-red-600 text-white w-8 h-8 rounded flex items-center justify-center"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}