"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import AddProductModal from "./components/AddProductModal";
import SupplierTable from "./components/SupplierTable";
import PaginationControls from "@/components/shared/pagination-controls";
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
import { fetchSuppliers } from "@/lib/dashboard-api";
import {
  createSupplierCommand,
  createSupplierProductCommand,
  deleteSupplierCommand,
  deleteSupplierProductCommand,
  updateSupplierCommand,
  updateSupplierProductCommand,
} from "@/lib/dashboard-client-commands";
import { normalizePriceInput } from "@/lib/currency";
import { dashboardDataCache } from "@/lib/dashboard-data-cache";
import type { SupplierRecord } from "@/lib/dashboard-types";
import { PAGINATION_PAGE_SIZE, paginateItems } from "@/lib/pagination";
import {
  getEmailValidationError,
  getPhilippinePhoneValidationError,
} from "@/lib/validation/form-validators";

type SupplierForm = {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
};

type SupplierProductForm = {
  name: string;
  sku: string;
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
  sku: "",
  price: "",
  category: "",
  unit: "bars",
};

type PendingRemoveProduct = {
  supplierId: string;
  productId: string;
  productName: string;
};

const slugifySku = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.slice(0, 3))
    .join("")
    .slice(0, 8) || "PRD";

export default function SuppliersPage() {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [activeSupplierId, setActiveSupplierId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(
    null,
  );
  const [pendingRemoveSupplierId, setPendingRemoveSupplierId] = useState<
    string | null
  >(null);
  const [pendingRemoveProduct, setPendingRemoveProduct] =
    useState<PendingRemoveProduct | null>(null);
  const [skuTouched, setSkuTouched] = useState(false);
  const [form, setForm] = useState<SupplierForm>(initialForm);
  const [productForm, setProductForm] =
    useState<SupplierProductForm>(initialProductForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof SupplierForm, string>>
  >({});
  const [productErrors, setProductErrors] = useState<
    Partial<Record<keyof SupplierProductForm, string>>
  >({});

  const loadSuppliers = useCallback(async (force = false) => {
    try {
      await dashboardDataCache.suppliers.getOrLoad(
        () => fetchSuppliers(),
        force,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load suppliers",
      );
    }
  }, []);

  useEffect(() => {
    const unsubscribe = dashboardDataCache.suppliers.subscribe((snapshot) => {
      setLoading(snapshot.loading && snapshot.data === null);

      if (!snapshot.data) {
        return;
      }

      const items = snapshot.data;

      setSuppliers(items);
      setExpandedIds((prev) => {
        const next = { ...prev };
        items.slice(0, 2).forEach((supplier) => {
          if (next[supplier.id] === undefined) {
            next[supplier.id] = true;
          }
        });
        return next;
      });
    });

    void loadSuppliers();

    return () => {
      unsubscribe();
    };
  }, [loadSuppliers]);

  const allSkus = useMemo(() => {
    return new Set(
      suppliers
        .flatMap((supplier) => supplier.products)
        .filter((product) => product.id !== editingProductId)
        .map((product) => product.sku.toUpperCase()),
    );
  }, [suppliers, editingProductId]);

  const categorySuggestions = useMemo(() => {
    return [
      ...new Set(
        suppliers
          .flatMap((supplier) => supplier.products)
          .map((product) => product.category?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [suppliers]);

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
    setSkuTouched(false);
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
    setEditingProductId(null);
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

  const removeSupplier = async (supplierId: string) => {
    if (!supplierId) {
      return;
    }

    try {
      await deleteSupplierCommand(supplierId).execute();
      toast.success("Supplier has been deleted");
      setPendingRemoveSupplierId(null);
      await loadSuppliers(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete supplier",
      );
    }
  };

  const handleSaveSupplier = async () => {
    const nextErrors: Partial<Record<keyof SupplierForm, string>> = {};

    if (!form.name.trim()) {
      nextErrors.name = "Supplier Name is required";
    }
    if (!form.contactPerson.trim()) {
      nextErrors.contactPerson = "Contact Person is required";
    }
    const emailError = getEmailValidationError(form.email);
    if (emailError) {
      nextErrors.email = emailError;
    }

    const phoneError = getPhilippinePhoneValidationError(form.phone);
    if (phoneError) {
      nextErrors.phone = phoneError;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        contactPerson: form.contactPerson.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      };

      if (editingSupplierId) {
        await updateSupplierCommand(editingSupplierId, payload).execute();
        toast.success("Supplier has been edited");
      } else {
        await createSupplierCommand(payload).execute();
        toast.success("Supplier has been saved");
      }

      handleCloseModal();
      await loadSuppliers(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save supplier",
      );
    }
  };

  const openAddProductModal = (supplierId: string) => {
    setActiveSupplierId(supplierId);
    setEditingProductId(null);
    clearProductForm();
    setProductModalOpen(true);
  };

  const openEditSupplierProductModal = (productId: string) => {
    const supplier = suppliers.find((item) =>
      item.products.some((product) => product.id === productId),
    );
    const product = supplier?.products.find((item) => item.id === productId);

    if (!supplier || !product) {
      return;
    }

    setActiveSupplierId(supplier.id);
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      sku: product.sku,
      price: `${product.price}`,
      category: product.category ?? "",
      unit: product.unit ?? "bars",
    });
    setSkuTouched(true);
    setProductErrors({});
    setProductModalOpen(true);
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "name" && !editingProductId && !skuTouched) {
      const base = slugifySku(value);
      let counter = 1;
      let candidate = `${base}-${String(counter).padStart(3, "0")}`;

      while (allSkus.has(candidate)) {
        counter += 1;
        candidate = `${base}-${String(counter).padStart(3, "0")}`;
      }

      setProductForm((prev) => ({
        ...prev,
        name: value,
        sku: candidate,
      }));
    } else {
      setProductForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (name === "sku") {
      setSkuTouched(true);
    }

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
      nextErrors.name = "Product Name is required";
    }
    if (!productForm.sku.trim()) {
      nextErrors.sku = "Stock Keeping Unit (SKU) is required";
    }
    if (!productForm.price.trim() || Number(productForm.price) <= 0) {
      nextErrors.price = "Price is required";
    }

    if (Object.keys(nextErrors).length > 0) {
      setProductErrors(nextErrors);
      return;
    }

    const payload = {
      supplierId: activeSupplierId,
      name: productForm.name.trim(),
      sku: productForm.sku.trim().toUpperCase(),
      price: Number(normalizePriceInput(productForm.price)),
      category: productForm.category.trim() || undefined,
      unit: productForm.unit.trim() || undefined,
    };

    if (Number.isNaN(payload.price) || payload.price <= 0) {
      setProductErrors((prev) => ({
        ...prev,
        price: "this field is required",
      }));
      return;
    }

    const save = async () => {
      try {
        if (editingProductId) {
          await updateSupplierProductCommand(editingProductId, {
            name: payload.name,
            sku: payload.sku,
            price: payload.price,
            category: payload.category,
            unit: payload.unit,
          }).execute();
          toast.success("Product has been edited");
        } else {
          await createSupplierProductCommand(payload).execute();
          toast.success("Product has been saved");
        }

        handleCloseProductModal();
        await loadSuppliers(true);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save product",
        );
      }
    };

    void save();
  };

  const removeSupplierProductById = async (productId: string) => {
    try {
      await deleteSupplierProductCommand(productId).execute();
      toast.success("Product has been deleted");
      setPendingRemoveProduct(null);
      await loadSuppliers(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete product",
      );
    }
  };

  const {
    items: paginatedSuppliers,
    totalPages,
    page: safePage,
  } = useMemo(
    () => paginateItems(suppliers, currentPage, PAGINATION_PAGE_SIZE),
    [suppliers, currentPage],
  );

  useEffect(() => {
    if (safePage !== currentPage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, safePage]);

  const pendingSupplier = useMemo(
    () => suppliers.find((supplier) => supplier.id === pendingRemoveSupplierId),
    [suppliers, pendingRemoveSupplierId],
  );

  const addProductToInventory = (supplierId: string, productId: string) => {
    const params = new URLSearchParams({
      supplierId,
      supplierProductId: productId,
    });

    router.push(`/dashboard/inventory?${params.toString()}`);
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
        rows={paginatedSuppliers}
        expandedIds={expandedIds}
        onToggleExpanded={toggleExpanded}
        onOpenAddProductModal={openAddProductModal}
        onEditSupplier={openEditSupplierModal}
        onRequestRemoveSupplier={setPendingRemoveSupplierId}
        onEditSupplierProduct={openEditSupplierProductModal}
        onAddProductToInventory={addProductToInventory}
        onRequestRemoveSupplierProduct={(
          supplierId,
          productId,
          productName,
        ) => {
          setPendingRemoveProduct({
            supplierId,
            productId,
            productName,
          });
        }}
      />

      <PaginationControls
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {!loading && suppliers.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No suppliers yet. Add your first supplier.
        </p>
      )}

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => !open && handleCloseModal()}
      >
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {editingSupplierId ? "Edit Supplier" : "Add New Supplier"}
            </DialogTitle>
            <DialogDescription>
              Enter the supplier&apos;s information below
            </DialogDescription>
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
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name}</p>
              )}
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
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email}</p>
              )}
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
              {errors.phone && (
                <p className="text-xs text-red-600">{errors.phone}</p>
              )}
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
        onPriceBlur={() => {
          setProductForm((prev) => ({
            ...prev,
            price: normalizePriceInput(prev.price),
          }));
        }}
        onSave={handleAddSupplierProduct}
        categorySuggestions={categorySuggestions}
        title={
          editingProductId ? "Edit Supplier Product" : "Add Supplier Product"
        }
        submitLabel={editingProductId ? "Save Changes" : "Save Product"}
      />

      <Dialog
        open={Boolean(pendingRemoveSupplierId)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingRemoveSupplierId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[430px]">
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this supplier?
            </DialogTitle>
            <DialogDescription>
              This will remove this supplier from your supplier list. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {pendingSupplier && (
            <p className="text-sm text-slate-600">
              Supplier: {pendingSupplier.name}
            </p>
          )}

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setPendingRemoveSupplierId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!pendingRemoveSupplierId) {
                  return;
                }

                void removeSupplier(pendingRemoveSupplierId);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(pendingRemoveProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingRemoveProduct(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[430px]">
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this product?
            </DialogTitle>
            <DialogDescription>
              This will remove this product from the supplier&apos;s list. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {pendingRemoveProduct && (
            <p className="text-sm text-slate-600">
              Product: {pendingRemoveProduct.productName}
            </p>
          )}

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setPendingRemoveProduct(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!pendingRemoveProduct) {
                  return;
                }

                void removeSupplierProductById(pendingRemoveProduct.productId);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
