"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import InventoryTable from "./components/InventoryTable";
import AddProductModal from "./components/AddProductModal";
import { type Product } from "./components/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchInventoryStocks, fetchSuppliers } from "@/lib/dashboard-api";
import {
  createInventoryStockCommand,
  deleteInventoryStockCommand,
} from "@/lib/dashboard-client-commands";
import type {
  InventoryStockRecord,
  SupplierRecord,
} from "@/lib/dashboard-types";
import { filterInventoryProducts } from "@/lib/patterns/strategies/dashboard-filter-strategies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const toProduct = (record: InventoryStockRecord): Product => ({
    id: record.id,
    supplierProductId: record.supplierProductId,
    name: record.name,
    sku: record.sku,
    category: record.category,
    quantity: record.quantity,
    unit: record.unit,
    price: record.price,
    expiration: record.expiration,
    supplier: record.supplierName,
    batchId: record.batchId,
    reorderLevel: record.reorderLevel,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [inventoryItems, supplierItems] = await Promise.all([
        fetchInventoryStocks(),
        fetchSuppliers(),
      ]);

      setProducts(inventoryItems.map(toProduct));
      setSuppliers(supplierItems);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load inventory",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const addProduct = async (payload: {
    supplierProductId: string;
    quantity: number;
    batchId: string;
    expiration?: string;
    reorderLevel: number;
  }) => {
    try {
      await createInventoryStockCommand(payload).execute();
      toast.success("product has been saved");
      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save inventory item",
      );
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteInventoryStockCommand(id).execute();
      toast.success("product has been deleted");
      setPendingDeleteId(null);
      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete inventory item",
      );
    }
  };

  const requestDeleteProduct = (id: string) => {
    setPendingDeleteId(id);
  };

  const filteredProducts = useMemo(
    () =>
      filterInventoryProducts(products, {
        search,
        categoryFilter,
        statusFilter,
        allCategoryLabel: "All",
        allStatusLabel: "All",
      }),
    [products, search, categoryFilter, statusFilter],
  );

  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category))],
    [products],
  );
  const statuses = useMemo(
    () => ["All", "In Stock", "Low Stock", "Out of Stock"],
    [],
  );

  return (
    <div className="space-y-5 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Inventory Management
        </h1>
      </div>
      <p className="text-sm text-muted-foreground">
        {loading
          ? "Loading inventory..."
          : `${filteredProducts.length} of ${products.length} products`}
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
        deleteProduct={requestDeleteProduct}
      />

      <AddProductModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addProduct}
        suppliers={suppliers}
      />

      {pendingDeleteId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="w-[370px] rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
            <p className="text-sm font-medium text-slate-900">
              are you sure you want to delete this product
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPendingDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  void deleteProduct(pendingDeleteId);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
