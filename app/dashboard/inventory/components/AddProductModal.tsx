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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { SupplierProduct } from "@/lib/suppliers-store";

import type { Product } from "./types";

type AddProductModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (product: Product) => void;
  categories: string[];
  suppliers: string[];
  supplierProductsByName: Record<string, SupplierProduct[]>;
  existingSkus: string[];
};

type RequiredField =
  | "supplier"
  | "name"
  | "category"
  | "quantity"
  | "reorderLevel"
  | "price";

const initialForm: Product = {
  supplier: "",
  name: "",
  sku: "",
  category: "",
  quantity: 0,
  unit: "bars",
  reorderLevel: 10,
  price: 0,
  expiration: "",
};

export default function AddProductModal({
  open,
  onClose,
  onAdd,
  categories,
  suppliers,
  supplierProductsByName,
  existingSkus,
}: AddProductModalProps) {
  const [form, setForm] = useState({
    ...initialForm,
  });
  const [errors, setErrors] = useState<Partial<Record<RequiredField, string>>>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    if (form.supplier && !suppliers.includes(form.supplier)) {
      handleClose();
    }
  }, [form.supplier, open, suppliers]);

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

  const generateSku = (name: string) => {
    const base = name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "")
      .trim()
      .split(/\s+/)
      .map((word) => word.slice(0, 3))
      .join("")
      .slice(0, 6) || "PRD";

    const usedSkus = new Set(existingSkus.map((sku) => sku.toUpperCase()));
    let counter = 1;
    let candidate = `${base}-${String(counter).padStart(3, "0")}`;

    while (usedSkus.has(candidate)) {
      counter += 1;
      candidate = `${base}-${String(counter).padStart(3, "0")}`;
    }

    return candidate;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const nextValue = type === "number" ? Number(value) : value;

    setForm({
      ...form,
      [name]: nextValue,
    });

    if (
      name === "name" ||
      name === "quantity" ||
      name === "reorderLevel" ||
      name === "price"
    ) {
      clearError(name);
    }
  };

  const handleClose = () => {
    setForm({ ...initialForm });
    setErrors({});
    onClose();
  };

  const handleSubmit = () => {
    const nextErrors: Partial<Record<RequiredField, string>> = {};

    if (!form.supplier) {
      nextErrors.supplier = "this field is required";
    }
    if (!form.name.trim()) {
      nextErrors.name = "this field is required";
    }
    if (!form.category) {
      nextErrors.category = "this field is required";
    }
    if (form.quantity <= 0) {
      nextErrors.quantity = "this field is required";
    }
    if (form.reorderLevel < 0) {
      nextErrors.reorderLevel = "this field is required";
    }
    if (form.price <= 0) {
      nextErrors.price = "this field is required";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onAdd(form);
    handleClose();
  };

  const expirationDate = form.expiration
    ? new Date(`${form.expiration}T00:00:00`)
    : undefined;

  const availableSupplierProducts = form.supplier
    ? supplierProductsByName[form.supplier] ?? []
    : [];

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
              <Label htmlFor="supplier">Supplier *</Label>
              <Select
                value={form.supplier}
                onValueChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    supplier: value,
                    name: "",
                    sku: "",
                    price: 0,
                    category: "",
                    unit: "bars",
                  }));
                  clearError("supplier");
                  clearError("name");
                  clearError("price");
                  clearError("category");
                }}
              >
                <SelectTrigger id="supplier" className={errors.supplier ? "border-red-600" : ""}>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplier && <p className="text-xs text-red-600">{errors.supplier}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Select
                value={form.name}
                onValueChange={(value) => {
                  const selectedProduct = availableSupplierProducts.find(
                    (product) => product.name === value,
                  );

                  setForm((prev) => ({
                    ...prev,
                    name: value,
                    sku: generateSku(value),
                    price: selectedProduct?.price ?? prev.price,
                    category: selectedProduct?.category ?? prev.category,
                    unit: selectedProduct?.unit ?? prev.unit,
                  }));
                  clearError("name");
                  clearError("price");
                  if (selectedProduct?.category) {
                    clearError("category");
                  }
                }}
                disabled={!form.supplier || availableSupplierProducts.length === 0}
              >
                <SelectTrigger id="name" className={errors.name ? "border-red-600" : ""}>
                  <SelectValue
                    placeholder={
                      !form.supplier
                        ? "Select supplier first"
                        : availableSupplierProducts.length === 0
                          ? "No products for this supplier"
                          : "Select existing product"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSupplierProducts.map((product) => (
                    <SelectItem key={product.name} value={product.name}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={form.sku}
                  readOnly
                  placeholder="Auto-generated from supplier product"
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => {
                    setForm((prev) => ({ ...prev, category: value }));
                    clearError("category");
                  }}
                >
                  <SelectTrigger id="category" className={errors.category ? "border-red-600" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
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
                {errors.quantity && <p className="text-xs text-red-600">{errors.quantity}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" name="unit" value={form.unit} onChange={handleChange} />
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
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  className={errors.price ? "border-red-600" : ""}
                />
                {errors.price && <p className="text-xs text-red-600">{errors.price}</p>}
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
                      onSelect={(date) => {
                        if (!date) {
                          setForm((prev) => ({ ...prev, expiration: "" }));
                          return;
                        }

                        setForm((prev) => ({ ...prev, expiration: toDateString(date) }));
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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