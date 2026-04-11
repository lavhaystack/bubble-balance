"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, MoreVertical, Plus } from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DEFAULT_SUPPLIERS,
  SUPPLIERS_UPDATED_EVENT,
  getStoredSuppliers,
  saveSuppliers,
  type SupplierProduct,
  type SupplierRecord,
} from "@/lib/suppliers-store";

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
    setModalOpen(false);
  };

  const handleCloseProductModal = () => {
    clearProductForm();
    setActiveSupplierId(null);
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

  const handleAddSupplier = () => {
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

    handleCloseModal();
  };

  const openAddProductModal = (supplierId: string) => {
    setActiveSupplierId(supplierId);
    clearProductForm();
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

    setSuppliers((prev) => {
      const next = prev.map((supplier) => {
        if (supplier.id !== activeSupplierId) {
          return supplier;
        }

        const existingIndex = supplier.products.findIndex(
          (product) => product.name.toLowerCase() === newSupplierProduct.name.toLowerCase(),
        );

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
          onClick={() => setModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
              <TableHead className="w-[30px]" />
              <TableHead>Supplier Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="w-[40px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((supplier) => {
              const isExpanded = Boolean(expandedIds[supplier.id]);

              return (
                <Fragment key={supplier.id}>
                  <TableRow>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleExpanded(supplier.id)}
                        aria-label={isExpanded ? "Collapse supplier" : "Expand supplier"}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">{supplier.name}</TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {supplier.products.length} product{supplier.products.length === 1 ? "" : "s"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-slate-50/70 py-4">
                        <p className="mb-3 text-sm font-semibold text-slate-900">
                          Products from this Supplier
                        </p>
                        {supplier.products.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No products listed yet.</p>
                        ) : (
                          <div className="space-y-1">
                            {supplier.products.map((product) => (
                              <div
                                key={`${supplier.id}-${product.name}`}
                                className="flex items-center justify-between rounded-md px-3 py-2 text-sm"
                              >
                                <span>{product.name}</span>
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">P{product.price.toFixed(2)}</span>
                                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAddProductModal(supplier.id)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Product to Supplier
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
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
              onClick={handleAddSupplier}
              className="bg-emerald-700 text-white hover:bg-emerald-800"
            >
              Add Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={productModalOpen}
        onOpenChange={(open) => !open && handleCloseProductModal()}
      >
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add Supplier Product</DialogTitle>
            <DialogDescription>
              Add a product to this supplier so it appears in Inventory add-product dropdown.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                name="name"
                value={productForm.name}
                onChange={handleProductChange}
                placeholder="e.g., Lavender Essential Oil Soap"
                className={productErrors.name ? "border-red-600" : ""}
              />
              {productErrors.name && <p className="text-xs text-red-600">{productErrors.name}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="productPrice">Price ($) *</Label>
                <Input
                  id="productPrice"
                  name="price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={productForm.price}
                  onChange={handleProductChange}
                  className={productErrors.price ? "border-red-600" : ""}
                />
                {productErrors.price && (
                  <p className="text-xs text-red-600">{productErrors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="productUnit">Unit</Label>
                <Input
                  id="productUnit"
                  name="unit"
                  value={productForm.unit}
                  onChange={handleProductChange}
                  placeholder="bars"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="productCategory">Category</Label>
                <Input
                  id="productCategory"
                  name="category"
                  value={productForm.category}
                  onChange={handleProductChange}
                  placeholder="e.g., Essential Oil"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-2 gap-2">
            <Button variant="outline" onClick={handleCloseProductModal}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSupplierProduct}
              className="bg-emerald-700 text-white hover:bg-emerald-800"
            >
              Save Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}