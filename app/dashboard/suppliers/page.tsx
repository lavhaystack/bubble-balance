"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import AddProductModal from "./components/AddProductModal";
import SupplierTable from "./components/SupplierTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_SUPPLIERS,
  SUPPLIERS_UPDATED_EVENT,
  getStoredSuppliers,
  saveSuppliers,
  type SupplierProduct,
  type SupplierRecord,
} from "@/lib/suppliers-store";
import {
  getStoredInventoryProducts,
  saveInventoryProducts,
} from "@/lib/inventory-store";

type SupplierForm = {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
};

type SupplierProductForm = {
  name: string;
  price: string;
  category: string;
  unit: string;
};

const initialForm: SupplierForm = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
};

const initialProductForm: SupplierProductForm = {
  name: "",
  price: "",
  category: "",
  unit: "bars",
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(() => getStoredSuppliers());
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const defaults = getStoredSuppliers();
    const initialExpanded: Record<string, boolean> = {};

    defaults.slice(0, 2).forEach((supplier) => {
      initialExpanded[supplier.id] = true;
    });

    return initialExpanded;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [activeSupplierId, setActiveSupplierId] = useState<string | null>(null);
  const [editingProductName, setEditingProductName] = useState<string | null>(null);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [pendingRemoveSupplierId, setPendingRemoveSupplierId] = useState<string | null>(null);
  const [form, setForm] = useState<SupplierForm>(initialForm);
  const [productForm, setProductForm] = useState<SupplierProductForm>(initialProductForm);
  const [errors, setErrors] = useState<Partial<Record<keyof SupplierForm, string>>>({});
  const [productErrors, setProductErrors] =
    useState<Partial<Record<keyof SupplierProductForm, string>>>({});

  useEffect(() => {
    const syncSuppliers = () => {
      setSuppliers(getStoredSuppliers());
    };

    syncSuppliers();
    window.addEventListener("storage", syncSuppliers);
    window.addEventListener(SUPPLIERS_UPDATED_EVENT, syncSuppliers);
    window.addEventListener("focus", syncSuppliers);

    return () => {
      window.removeEventListener("storage", syncSuppliers);
      window.removeEventListener(SUPPLIERS_UPDATED_EVENT, syncSuppliers);
      window.removeEventListener("focus", syncSuppliers);
    };
  }, []);

  const rows = useMemo(
    () => (suppliers.length > 0 ? suppliers : DEFAULT_SUPPLIERS),
    [suppliers],
  );

  const toggleExpanded = (supplierId: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [supplierId]: !prev[supplierId],
    }));
  };

  const clearForm = () => {
    setForm(initialForm);
    setErrors({});
  };

  const clearProductForm = () => {
    setProductForm(initialProductForm);
    setProductErrors({});
  };

  const handleCloseModal = () => {
    clearForm();
    setEditingSupplierId(null);
    setModalOpen(false);
  };

  const handleCloseProductModal = () => {
    clearProductForm();
    setActiveSupplierId(null);
    setEditingProductName(null);
    setProductModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (value.trim()) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof SupplierForm];
        return next;
      });
    }
  };

  const openEditSupplierModal = (supplierId: string) => {
    const supplier = suppliers.find((item) => item.id === supplierId);
    if (!supplier) {
      return;
    }

    setEditingSupplierId(supplierId);
    setForm({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
    });
    setErrors({});
    setModalOpen(true);
  };

  const removeSupplier = (supplierId: string) => {
    const supplierToRemove = suppliers.find((supplier) => supplier.id === supplierId);
    if (!supplierToRemove) {
      return;
    }

    setSuppliers((prev) => {
      const next = prev.filter((supplier) => supplier.id !== supplierId);
      saveSuppliers(next);
      return next;
    });

    setExpandedIds((prev) => {
      const next = { ...prev };
      delete next[supplierId];
      return next;
    });

    const inventory = getStoredInventoryProducts();
    const nextInventory = inventory.filter(
      (product) => product.supplier.toLowerCase() !== supplierToRemove.name.toLowerCase(),
    );
    saveInventoryProducts(nextInventory);
  };

  const handleSaveSupplier = () => {
    const nextErrors: Partial<Record<keyof SupplierForm, string>> = {};

    if (!form.name.trim()) {
      nextErrors.name = "this field is required";
    }
    if (!form.contactPerson.trim()) {
      nextErrors.contactPerson = "this field is required";
    }
    if (!form.email.trim()) {
      nextErrors.email = "this field is required";
    }
    if (!form.phone.trim()) {
      nextErrors.phone = "this field is required";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (editingSupplierId) {
      const oldSupplier = suppliers.find((supplier) => supplier.id === editingSupplierId);
      const nextName = form.name.trim();

      setSuppliers((prev) => {
        const next = prev.map((supplier) =>
          supplier.id === editingSupplierId
            ? {
                ...supplier,
                name: nextName,
                contactPerson: form.contactPerson.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
              }
            : supplier,
        );
        saveSuppliers(next);
        return next;
      });

      if (oldSupplier && oldSupplier.name !== nextName) {
        const inventory = getStoredInventoryProducts();
        const nextInventory = inventory.map((product) =>
          product.supplier.toLowerCase() === oldSupplier.name.toLowerCase()
            ? { ...product, supplier: nextName }
            : product,
        );
        saveInventoryProducts(nextInventory);
      }
    } else {
      const supplierId = `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
      const newSupplier: SupplierRecord = {
        id: supplierId,
        name: form.name.trim(),
        contactPerson: form.contactPerson.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        products: [],
      };

      setSuppliers((prev) => {
        const next = [...prev, newSupplier];
        saveSuppliers(next);
        return next;
      });

      setExpandedIds((prev) => ({
        ...prev,
        [supplierId]: true,
      }));
    }

    handleCloseModal();
  };

  const openAddProductModal = (supplierId: string) => {
    setActiveSupplierId(supplierId);
    setEditingProductName(null);
    clearProductForm();
    setProductModalOpen(true);
  };

  const openEditSupplierProductModal = (supplierId: string, productName: string) => {
    const supplier = suppliers.find((item) => item.id === supplierId);
    const product = supplier?.products.find(
      (item) => item.name.toLowerCase() === productName.toLowerCase(),
    );

    if (!supplier || !product) {
      return;
    }

    setActiveSupplierId(supplierId);
    setEditingProductName(product.name);
    setProductForm({
      name: product.name,
      price: `${product.price}`,
      category: product.category ?? "",
      unit: product.unit ?? "bars",
    });
    setProductErrors({});
    setProductModalOpen(true);
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (value.trim()) {
      setProductErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof SupplierProductForm];
        return next;
      });
    }
  };

  const handleAddSupplierProduct = () => {
    if (!activeSupplierId) {
      return;
    }

    const nextErrors: Partial<Record<keyof SupplierProductForm, string>> = {};

    if (!productForm.name.trim()) {
      nextErrors.name = "this field is required";
    }
    if (!productForm.price.trim() || Number(productForm.price) <= 0) {
      nextErrors.price = "this field is required";
    }

    if (Object.keys(nextErrors).length > 0) {
      setProductErrors(nextErrors);
      return;
    }

    const newSupplierProduct: SupplierProduct = {
      name: productForm.name.trim(),
      price: Number(productForm.price),
      category: productForm.category.trim() || undefined,
      unit: productForm.unit.trim() || undefined,
    };

    const supplierName = suppliers.find((supplier) => supplier.id === activeSupplierId)?.name;

    setSuppliers((prev) => {
      const next = prev.map((supplier) => {
        if (supplier.id !== activeSupplierId) {
          return supplier;
        }

        const existingIndex = supplier.products.findIndex((product) => {
          if (editingProductName) {
            return product.name.toLowerCase() === editingProductName.toLowerCase();
          }
          return product.name.toLowerCase() === newSupplierProduct.name.toLowerCase();
        });

        if (existingIndex >= 0) {
          return {
            ...supplier,
            products: supplier.products.map((product, index) =>
              index === existingIndex ? { ...product, ...newSupplierProduct } : product,
            ),
          };
        }

        return {
          ...supplier,
          products: [...supplier.products, newSupplierProduct],
        };
      });

      saveSuppliers(next);
      return next;
    });

    if (supplierName) {
      const inventory = getStoredInventoryProducts();
      const nextInventory = inventory.map((product) => {
        const isMatchBySupplier = product.supplier.toLowerCase() === supplierName.toLowerCase();
        const isMatchByName = editingProductName
          ? product.name.toLowerCase() === editingProductName.toLowerCase()
          : product.name.toLowerCase() === newSupplierProduct.name.toLowerCase();

        if (!isMatchBySupplier || !isMatchByName) {
          return product;
        }

        return {
          ...product,
          name: newSupplierProduct.name,
          price: newSupplierProduct.price,
          category: newSupplierProduct.category ?? product.category,
          unit: newSupplierProduct.unit ?? product.unit,
        };
      });

      saveInventoryProducts(nextInventory);
    }

    handleCloseProductModal();
  };

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Suppliers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your suppliers and their products
          </p>
        </div>

        <Button
          className="bg-emerald-700 text-white hover:bg-emerald-800"
          onClick={() => {
            setEditingSupplierId(null);
            clearForm();
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      <SupplierTable
        rows={rows}
        expandedIds={expandedIds}
        onToggleExpanded={toggleExpanded}
        onOpenAddProductModal={openAddProductModal}
        onEditSupplier={openEditSupplierModal}
        onRequestRemoveSupplier={setPendingRemoveSupplierId}
        onEditSupplierProduct={openEditSupplierProductModal}
      />

      <Dialog open={modalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editingSupplierId ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
            <DialogDescription>Enter the supplier&apos;s information below</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name *</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Organic Essential Oils Co."
                className={errors.name ? "border-red-600" : ""}
              />
              {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person *</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={form.contactPerson}
                onChange={handleChange}
                placeholder="e.g., Sarah Johnson"
                className={errors.contactPerson ? "border-red-600" : ""}
              />
              {errors.contactPerson && (
                <p className="text-xs text-red-600">{errors.contactPerson}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g., contact@supplier.com"
                className={errors.email ? "border-red-600" : ""}
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g., +63 917 123 4567"
                className={errors.phone ? "border-red-600" : ""}
              />
              {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
            </div>
          </div>

          <DialogFooter className="mt-2 gap-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSupplier}
              className="bg-emerald-700 text-white hover:bg-emerald-800"
            >
              {editingSupplierId ? "Save Changes" : "Add Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddProductModal
        open={productModalOpen}
        form={productForm}
        errors={productErrors}
        onClose={handleCloseProductModal}
        onChange={handleProductChange}
        onSave={handleAddSupplierProduct}
        title={editingProductName ? "Edit Supplier Product" : "Add Supplier Product"}
        submitLabel={editingProductName ? "Save Changes" : "Save Product"}
      />

      {pendingRemoveSupplierId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="w-[380px] rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
            <p className="text-sm font-medium text-slate-900">
              are you sure you want to remove supplier
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPendingRemoveSupplierId(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  removeSupplier(pendingRemoveSupplierId);
                  setPendingRemoveSupplierId(null);
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}