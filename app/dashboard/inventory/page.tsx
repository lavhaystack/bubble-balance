"use client";
import { useEffect, useMemo, useState } from "react";
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
import {
  SUPPLIERS_UPDATED_EVENT,
  getStoredSuppliers,
  saveSuppliers,
  type SupplierRecord,
} from "@/lib/suppliers-store";
import {
  INVENTORY_UPDATED_EVENT,
  getStoredInventoryProducts,
  saveInventoryProducts,
} from "@/lib/inventory-store";

export default function Page() {
  const [products, setProducts] = useState<Product[]>(() => getStoredInventoryProducts());

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [storedSuppliers, setStoredSuppliers] = useState<SupplierRecord[]>([]);
  const [pendingDeleteSku, setPendingDeleteSku] = useState<string | null>(null);

  useEffect(() => {
    const syncSuppliers = () => {
      setStoredSuppliers(getStoredSuppliers());
    };

    syncSuppliers();
    window.addEventListener("storage", syncSuppliers);
    window.addEventListener(SUPPLIERS_UPDATED_EVENT, syncSuppliers);

    return () => {
      window.removeEventListener("storage", syncSuppliers);
      window.removeEventListener(SUPPLIERS_UPDATED_EVENT, syncSuppliers);
    };
  }, []);

  useEffect(() => {
    const syncInventory = () => {
      setProducts(getStoredInventoryProducts());
    };

    syncInventory();
    window.addEventListener("storage", syncInventory);
    window.addEventListener(INVENTORY_UPDATED_EVENT, syncInventory);

    return () => {
      window.removeEventListener("storage", syncInventory);
      window.removeEventListener(INVENTORY_UPDATED_EVENT, syncInventory);
    };
  }, []);

  const addProduct = (product: Product) => {
    const nextProducts = [...products, product];
    setProducts(nextProducts);
    saveInventoryProducts(nextProducts);

    const normalizedSupplierName = product.supplier.trim();
    const existingSuppliers = getStoredSuppliers();

    const updatedSuppliers = (() => {
      const existingSupplierIndex = existingSuppliers.findIndex(
        (supplier) => supplier.name.toLowerCase() === normalizedSupplierName.toLowerCase(),
      );

      if (existingSupplierIndex === -1) {
        const generatedId = `${normalizedSupplierName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

        const newSupplier: SupplierRecord = {
          id: generatedId,
          name: normalizedSupplierName,
          contactPerson: "TBD",
          email: "tbd@supplier.com",
          phone: "TBD",
          products: [
            {
              name: product.name,
              price: product.price,
            },
          ],
        };

        return [...existingSuppliers, newSupplier];
      }

      return existingSuppliers.map((supplier, index) => {
        if (index !== existingSupplierIndex) {
          return supplier;
        }

        const productExists = supplier.products.some(
          (item) => item.name.toLowerCase() === product.name.toLowerCase(),
        );

        if (productExists) {
          return {
            ...supplier,
            products: supplier.products.map((item) =>
              item.name.toLowerCase() === product.name.toLowerCase()
                ? { ...item, price: product.price }
                : item,
            ),
          };
        }

        return {
          ...supplier,
          products: [
            ...supplier.products,
            {
              name: product.name,
              price: product.price,
            },
          ],
        };
      });
    })();

    saveSuppliers(updatedSuppliers);
  };

  const deleteProduct = (sku: string) => {
    const nextProducts = products.filter((p) => p.sku !== sku);
    setProducts(nextProducts);
    saveInventoryProducts(nextProducts);
  };

  const requestDeleteProduct = (sku: string) => {
    setPendingDeleteSku(sku);
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
  const suppliers = useMemo(() => {
    return [...new Set([...storedSuppliers.map((supplier) => supplier.name), ...products.map((p) => p.supplier)])].sort(
      (a, b) => a.localeCompare(b),
    );
  }, [products, storedSuppliers]);

  const supplierProductsByName = useMemo(() => {
    return storedSuppliers.reduce<Record<string, SupplierRecord["products"]>>((acc, supplier) => {
      acc[supplier.name] = supplier.products;
      return acc;
    }, {});
  }, [storedSuppliers]);
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
        deleteProduct={requestDeleteProduct}
      />

      <AddProductModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addProduct}
        categories={categories.filter((category) => category !== "All")}
        suppliers={suppliers}
        supplierProductsByName={supplierProductsByName}
        existingSkus={products.map((product) => product.sku)}
      />

      {pendingDeleteSku && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="w-[370px] rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
            <p className="text-sm font-medium text-slate-900">
              are you sure you want to delete this product
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setPendingDeleteSku(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  deleteProduct(pendingDeleteSku);
                  setPendingDeleteSku(null);
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