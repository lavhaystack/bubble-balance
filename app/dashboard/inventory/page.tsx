"use client";
import { useState } from "react";
import { Plus, Search } from "lucide-react";

import InventoryTable from "./components/InventoryTable";
import AddProductModal from "./components/AddProductModal";
import { getStockStatus, type Product } from "./components/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Page() {
  const [products, setProducts] = useState<Product[]>([
    {
      name: "Lavender Essential Oil Soap",
      sku: "LAV-001",
      category: "Essential Oil",
      quantity: 45,
      unit: "bars",
      price: 8.99,
      expiration: "2026-08-15",
      supplier: "Natural Supplies Co.",
      reorderLevel: 15,
    },
    {
      name: "Tea Tree Antibacterial Soap",
      sku: "TEA-002",
      category: "Antibacterial",
      quantity: 12,
      unit: "bars",
      price: 9.99,
      expiration: "2025-04-20",
      supplier: "Pure Botanicals",
      reorderLevel: 14,
    },
    {
      name: "Chamomile and Honey Moisturizing Soap",
      sku: "CHA-003",
      category: "Moisturizing",
      quantity: 67,
      unit: "bars",
      price: 7.49,
      expiration: "2026-12-10",
      supplier: "Organic Essence Ltd.",
      reorderLevel: 20,
    },
    {
      name: "Activated Charcoal Detox Soap",
      sku: "CHA-004",
      category: "Detox",
      quantity: 8,
      unit: "bars",
      price: 10.99,
      expiration: "2025-05-30",
      supplier: "Natural Supplies Co.",
      reorderLevel: 12,
    },
    {
      name: "Eucalyptus Mint Soap",
      sku: "EUC-008",
      category: "Essential Oil",
      quantity: 52,
      unit: "bars",
      price: 8.99,
      expiration: "2026-07-18",
      supplier: "Natural Supplies Co.",
      reorderLevel: 12,
    },
    {
      name: "Sweet Orange Soap",
      sku: "SWE-009",
      category: "Essential Oil",
      quantity: 0,
      unit: "bars",
      price: 7.99,
      expiration: "2025-12-10",
      supplier: "Pure Botanicals",
      reorderLevel: 10,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const updateProduct = (updated: Product) => {
    setProducts(products.map(p => p.sku === updated.sku ? updated : p));
  };

  const deleteProduct = (sku: string) => {
    setProducts(products.filter((p) => p.sku !== sku));
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.supplier.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || p.category === categoryFilter;

    const stockStatus = getStockStatus(p);
    const matchesStatus = statusFilter === "All" || stockStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ["All", ...new Set(products.map(p => p.category))];
  const suppliers = [...new Set(products.map((p) => p.supplier))];
  const statuses = ["All", "In Stock", "Low Stock", "Out of Stock"];

  return (
    <div className="space-y-5 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Inventory Management</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        {filteredProducts.length} of {products.length} products
      </p>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, SKU, or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[420px]">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          className="bg-emerald-700 text-white hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <InventoryTable
        products={filteredProducts}
        updateProduct={updateProduct}
        deleteProduct={deleteProduct}
      />

      <AddProductModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addProduct}
        categories={categories.filter((category) => category !== "All")}
        suppliers={suppliers}
      />
    </div>
  );
}