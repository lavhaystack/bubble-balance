import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Product } from "./types";

type AddProductModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (product: Product) => void;
  categories: string[];
  suppliers: string[];
};

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
}: AddProductModalProps) {
  const [form, setForm] = useState({
    ...initialForm,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleClose = () => {
    setForm({ ...initialForm });
    onClose();
  };

  const handleSubmit = () => {
    if (!form.supplier || !form.name || !form.sku || !form.category) {
      alert("Supplier, product name, SKU, and category are required.");
      return;
    }
    onAdd(form);
    handleClose();
  };

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
                onValueChange={(value) => setForm((prev) => ({ ...prev, supplier: value }))}
              >
                <SelectTrigger id="supplier">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={form.supplier ? "Enter product name" : "Select supplier first"}
                disabled={!form.supplier}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="e.g., LAV-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="category">
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
                />
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
                />
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
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="expiration">Expiration Date</Label>
                <Input
                  id="expiration"
                  name="expiration"
                  type="date"
                  value={form.expiration}
                  onChange={handleChange}
                />
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