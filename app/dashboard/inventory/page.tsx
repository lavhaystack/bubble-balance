"use client";
import { useState } from "react";
import InventoryTable from "./components/InventoryTable";
import AddProductModal from "./components/AddProductModal";

export default function Page() {
  const [products, setProducts] = useState([
    {
      name: "Lavender Essential Oil Soap",
      sku: "LAV-001",
      category: "Essential Oil",
      quantity: 45,
      price: 8.99,
      status: "In Stock",
      expiration: "2026-08-15",
      supplier: "Natural Supplies Co.",
    },
    {
      name: "Rose Bath Bomb",
      sku: "ROS-002",
      category: "Bath",
      quantity: 35,
      price: 5.5,
      status: "In Stock",
      expiration: "2026-09-01",
      supplier: "Natural Supplies Co.",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const addProduct = (product: any) => {
    setProducts([...products, product]);
  };

  const updateProduct = (updated: any) => {
    setProducts(products.map(p => p.sku === updated.sku ? updated : p));
  };

  const deleteProduct = (sku: string) => {
    setProducts(products.filter((p) => p.sku !== sku));
  };

  // ✅ Filtering logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.supplier.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || p.category === categoryFilter;

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Low" && p.quantity <= 35) ||
      (statusFilter === "In Stock" && p.quantity > 35);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ["All", ...new Set(products.map(p => p.category))];
  const statuses = ["All", "In Stock", "Low"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Inventory Management</h1>
      <p className="text-gray-600 mb-4">
        {filteredProducts.length} of {products.length} products
      </p>
      <div className="flex justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="Search by name, SKU, or supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-1/3"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-600 text-white px-4 py-1.5 rounded"
        >
          + Add Product
        </button>
      </div>

      <InventoryTable
        products={filteredProducts}
        updateProduct={updateProduct}
        deleteProduct={deleteProduct}
      />

      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onAdd={addProduct}
        />
      )}
    </div>
  );
}