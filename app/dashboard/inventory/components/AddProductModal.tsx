import { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPhpCurrency } from "@/lib/currency";
import { buildSuggestedBatchId } from "@/lib/batch-id";
import type { SupplierRecord } from "@/lib/dashboard-types";
import { cn } from "@/lib/utils";

type AddProductModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (payload: {
    supplierProductId: string;
    quantity: number;
    batchId: string;
    expiration?: string;
    reorderLevel: number;
  }) => void;
  suppliers: SupplierRecord[];
  initialSupplierId?: string;
  initialSupplierProductId?: string;
  existingBatchIds?: string[];
};

type RequiredField =
  | "supplierId"
  | "supplierProductId"
  | "quantity"
  | "batchId"
  | "reorderLevel"
  | "expiration";

type ProductFormState = {
  supplierId: string;
  supplierProductId: string;
  quantity: string;
  batchId: string;
  reorderLevel: string;
  expiration: string;
};

const initialForm: ProductFormState = {
  supplierId: "",
  supplierProductId: "",
  quantity: "0",
  batchId: "",
  reorderLevel: "10",
  expiration: "",
};

export default function AddProductModal({
  open,
  onClose,
  onAdd,
  suppliers,
  initialSupplierId,
  initialSupplierProductId,
  existingBatchIds = [],
}: AddProductModalProps) {
  const [form, setForm] = useState<ProductFormState>({ ...initialForm });
  const [errors, setErrors] = useState<Partial<Record<RequiredField, string>>>(
    {},
  );
  const [batchIdManuallyEdited, setBatchIdManuallyEdited] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (initialSupplierId || initialSupplierProductId) {
      setForm((prev) => ({
        ...prev,
        supplierId: initialSupplierId ?? prev.supplierId,
        supplierProductId: initialSupplierProductId ?? prev.supplierProductId,
      }));
      setBatchIdManuallyEdited(false);
    }
  }, [initialSupplierId, initialSupplierProductId, open]);

  useEffect(() => {
    if (!open || !form.supplierId) {
      return;
    }

    if (!suppliers.some((supplier) => supplier.id === form.supplierId)) {
      setForm({ ...initialForm });
      setErrors({});
      onClose();
    }
  }, [form.supplierId, onClose, open, suppliers]);

  const toDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const clearError = (field: RequiredField) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "batchId") {
      setBatchIdManuallyEdited(true);
    }

    setForm({
      ...form,
      [name]: value,
    });

    if (name === "quantity" || name === "reorderLevel" || name === "batchId") {
      clearError(name);
    }
  };

  const handleClose = () => {
    setForm({ ...initialForm });
    setErrors({});
    setBatchIdManuallyEdited(false);
    onClose();
  };

  const handleSubmit = () => {
    const nextErrors: Partial<Record<RequiredField, string>> = {};
    const quantity = Number(form.quantity);
    const reorderLevel = Number(form.reorderLevel);

    if (!form.supplierId) {
      nextErrors.supplierId = "Supplier is required";
    }
    if (!form.supplierProductId) {
      nextErrors.supplierProductId = "Product is required";
    }
    if (!form.quantity.trim() || Number.isNaN(quantity) || quantity <= 0) {
      nextErrors.quantity = "Quantity is required";
    }
    if (!form.batchId.trim()) {
      nextErrors.batchId = "Batch ID is required";
    }
    if (
      !form.reorderLevel.trim() ||
      Number.isNaN(reorderLevel) ||
      reorderLevel < 0
    ) {
      nextErrors.reorderLevel = "this field is required";
    }

    if (form.expiration) {
      const selectedDate = new Date(`${form.expiration}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        nextErrors.expiration = "Expiration date cannot be in the past";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onAdd({
      supplierProductId: form.supplierProductId,
      quantity,
      batchId: form.batchId.trim(),
      reorderLevel,
      expiration: form.expiration || undefined,
    });
    handleClose();
  };

  const expirationDate = form.expiration
    ? new Date(`${form.expiration}T00:00:00`)
    : undefined;

  const selectedSupplier = suppliers.find(
    (supplier) => supplier.id === form.supplierId,
  );
  const availableSupplierProducts = selectedSupplier?.products ?? [];
  const selectedProduct = availableSupplierProducts.find(
    (product) => product.id === form.supplierProductId,
  );

  useEffect(() => {
    if (!open || !selectedProduct || batchIdManuallyEdited) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      batchId: buildSuggestedBatchId(selectedProduct.sku, existingBatchIds),
    }));
  }, [batchIdManuallyEdited, existingBatchIds, open, selectedProduct]);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent className="max-w-[680px] p-0">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new soap product to your inventory
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierId">Supplier *</Label>
              <Select
                value={form.supplierId}
                onValueChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    supplierId: value,
                    supplierProductId: "",
                  }));
                  setBatchIdManuallyEdited(false);
                  clearError("supplierId");
                  clearError("supplierProductId");
                }}
              >
                <SelectTrigger
                  id="supplierId"
                  className={errors.supplierId ? "border-red-600" : ""}
                >
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplierId && (
                <p className="text-xs text-red-600">{errors.supplierId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierProductId">Product Name *</Label>
              <Select
                value={form.supplierProductId}
                onValueChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    supplierProductId: value,
                  }));
                  setBatchIdManuallyEdited(false);
                  clearError("supplierProductId");
                }}
                disabled={
                  !form.supplierId || availableSupplierProducts.length === 0
                }
              >
                <SelectTrigger
                  id="supplierProductId"
                  className={errors.supplierProductId ? "border-red-600" : ""}
                >
                  <SelectValue
                    placeholder={
                      !form.supplierId
                        ? "Select supplier first"
                        : availableSupplierProducts.length === 0
                          ? "No products for this supplier"
                          : "Select existing product"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSupplierProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplierProductId && (
                <p className="text-xs text-red-600">
                  {errors.supplierProductId}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={selectedProduct?.sku ?? ""}
                  readOnly
                  placeholder="Auto-filled from supplier product"
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={selectedProduct?.category ?? "-"}
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min={0}
                  value={form.quantity}
                  onChange={handleChange}
                  className={errors.quantity ? "border-red-600" : ""}
                />
                {errors.quantity && (
                  <p className="text-xs text-red-600">{errors.quantity}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="batchId">Batch ID *</Label>
                <Input
                  id="batchId"
                  name="batchId"
                  value={form.batchId}
                  onChange={handleChange}
                  placeholder="e.g., BATCH-2026-01"
                  className={errors.batchId ? "border-red-600" : ""}
                />
                {errors.batchId && (
                  <p className="text-xs text-red-600">{errors.batchId}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={selectedProduct?.unit ?? "unit"}
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level *</Label>
                <Input
                  id="reorderLevel"
                  name="reorderLevel"
                  type="number"
                  min={0}
                  value={form.reorderLevel}
                  onChange={handleChange}
                  className={errors.reorderLevel ? "border-red-600" : ""}
                />
                {errors.reorderLevel && (
                  <p className="text-xs text-red-600">{errors.reorderLevel}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (₱) *</Label>
                <Input
                  id="price"
                  value={
                    selectedProduct
                      ? formatPhpCurrency(selectedProduct.price)
                      : ""
                  }
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="expiration">Expiration Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="expiration"
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-between text-left font-normal",
                        !form.expiration && "text-muted-foreground",
                      )}
                    >
                      {form.expiration
                        ? expirationDate?.toLocaleDateString("en-US")
                        : "Select expiration date"}
                      <CalendarIcon className="h-4 w-4 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[320px] overflow-hidden rounded-lg p-0"
                    align="start"
                    side="bottom"
                    sideOffset={8}
                  >
                    <Calendar
                      className="w-full"
                      mode="single"
                      selected={expirationDate}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      onSelect={(date) => {
                        if (!date) {
                          setForm((prev) => ({ ...prev, expiration: "" }));
                          return;
                        }

                        setForm((prev) => ({
                          ...prev,
                          expiration: toDateString(date),
                        }));
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.expiration && (
                  <p className="text-xs text-red-600">{errors.expiration}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-emerald-700 text-white hover:bg-emerald-800"
            >
              Add Product
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
