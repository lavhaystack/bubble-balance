"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStockStatus } from "@/app/dashboard/inventory/components/types";
import {
  INVENTORY_UPDATED_EVENT,
  getStoredInventoryProducts,
  saveInventoryProducts,
  type InventoryRecord,
} from "@/lib/inventory-store";
import { SUPPLIERS_UPDATED_EVENT } from "@/lib/suppliers-store";

type CartLine = {
  sku: string;
  quantity: number;
};

type CheckoutItem = {
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  available: number;
};

const ALL_CATEGORIES = "All Categories";

const statusStyles: Record<string, string> = {
  "In Stock": "border-transparent bg-slate-100 text-slate-700",
  "Low Stock": "border-transparent bg-slate-900 text-slate-50",
  "Out of Stock": "border-transparent bg-rose-100 text-rose-700",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const formatPrice = (value: number) => currencyFormatter.format(value);

export default function CheckoutPage() {
  const [products, setProducts] = useState<InventoryRecord[]>(() =>
    getStoredInventoryProducts(),
  );
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const syncProducts = () => {
      setProducts(getStoredInventoryProducts());
    };

    syncProducts();
    window.addEventListener("storage", syncProducts);
    window.addEventListener(INVENTORY_UPDATED_EVENT, syncProducts);
    window.addEventListener(SUPPLIERS_UPDATED_EVENT, syncProducts);

    return () => {
      window.removeEventListener("storage", syncProducts);
      window.removeEventListener(INVENTORY_UPDATED_EVENT, syncProducts);
      window.removeEventListener(SUPPLIERS_UPDATED_EVENT, syncProducts);
    };
  }, []);

  useEffect(() => {
    setCart((currentCart) => {
      let changed = false;

      const nextCart = currentCart.flatMap((line) => {
        const product = products.find((entry) => entry.sku === line.sku);
        if (!product || product.quantity <= 0) {
          changed = true;
          return [];
        }

        const cappedQuantity = Math.min(line.quantity, product.quantity);
        if (cappedQuantity !== line.quantity) {
          changed = true;
        }

        return [{ ...line, quantity: cappedQuantity }];
      });

      return changed ? nextCart : currentCart;
    });
  }, [products]);

  const productBySku = useMemo(() => {
    return new Map(products.map((product) => [product.sku, product]));
  }, [products]);

  const cartQuantityBySku = useMemo(() => {
    return cart.reduce<Record<string, number>>((acc, line) => {
      acc[line.sku] = line.quantity;
      return acc;
    }, {});
  }, [cart]);

  const categories = useMemo(() => {
    return [
      ALL_CATEGORIES,
      ...new Set(products.map((product) => product.category)),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.sku.toLowerCase().includes(normalizedSearch) ||
        product.supplier.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === ALL_CATEGORIES ||
        product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const checkoutItems = useMemo<CheckoutItem[]>(() => {
    return cart.flatMap((line) => {
      const product = productBySku.get(line.sku);
      if (!product) {
        return [];
      }

      const quantity = Math.min(line.quantity, product.quantity);
      if (quantity <= 0) {
        return [];
      }

      return [
        {
          sku: product.sku,
          name: product.name,
          quantity,
          unit: product.unit,
          price: product.price,
          available: product.quantity,
        },
      ];
    });
  }, [cart, productBySku]);

  const totalItems = useMemo(() => {
    return checkoutItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [checkoutItems]);

  const totalAmount = useMemo(() => {
    return checkoutItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
  }, [checkoutItems]);

  const updateCartLine = (sku: string, requestedQuantity: number) => {
    setCart((currentCart) => {
      const product = products.find((entry) => entry.sku === sku);
      if (!product || product.quantity <= 0 || requestedQuantity <= 0) {
        return currentCart.filter((line) => line.sku !== sku);
      }

      const cappedQuantity = Math.min(requestedQuantity, product.quantity);
      const existingLineIndex = currentCart.findIndex(
        (line) => line.sku === sku,
      );

      if (existingLineIndex === -1) {
        return [...currentCart, { sku, quantity: cappedQuantity }];
      }

      return currentCart.map((line, index) =>
        index === existingLineIndex
          ? { ...line, quantity: cappedQuantity }
          : line,
      );
    });
  };

  const addToCart = (product: InventoryRecord) => {
    if (product.quantity <= 0) {
      return;
    }

    const currentQuantity = cartQuantityBySku[product.sku] ?? 0;
    if (currentQuantity >= product.quantity) {
      return;
    }

    updateCartLine(product.sku, currentQuantity + 1);
  };

  const removeFromCart = (sku: string) => {
    setCart((currentCart) => currentCart.filter((line) => line.sku !== sku));
  };

  const openConfirmModal = () => {
    if (checkoutItems.length === 0) {
      return;
    }
    setConfirmOpen(true);
  };

  const confirmCheckout = () => {
    if (checkoutItems.length === 0 || confirming) {
      return;
    }

    setConfirming(true);

    try {
      const latestInventory = getStoredInventoryProducts();
      const latestBySku = new Map(
        latestInventory.map((item) => [item.sku, item]),
      );

      const firstUnavailable = checkoutItems.find((item) => {
        const latestProduct = latestBySku.get(item.sku);
        return !latestProduct || latestProduct.quantity < item.quantity;
      });

      if (firstUnavailable) {
        setProducts(latestInventory);
        toast.error("Unable to complete checkout. Stock levels changed.");
        return;
      }

      const checkoutItemsBySku = new Map(
        checkoutItems.map((item) => [item.sku, item]),
      );

      const nextInventory = latestInventory.map((product) => {
        const checkoutLine = checkoutItemsBySku.get(product.sku);
        if (!checkoutLine) {
          return product;
        }

        return {
          ...product,
          quantity: Math.max(product.quantity - checkoutLine.quantity, 0),
        };
      });

      saveInventoryProducts(nextInventory);
      setProducts(nextInventory);
      setCart([]);
      setConfirmOpen(false);
      toast.success("order has been confirmed");
    } catch {
      toast.error("Unable to complete checkout right now.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Select products to checkout from inventory
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <h2 className="text-[30px] font-bold leading-none text-slate-900">
            Available Products
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="h-11 border-slate-200 bg-white pl-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-11 w-full border-slate-200 bg-white sm:w-[190px]">
                <SelectValue placeholder={ALL_CATEGORIES} />
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

          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="text-slate-700">Product</TableHead>
                    <TableHead className="text-slate-700">Category</TableHead>
                    <TableHead className="text-slate-700">Available</TableHead>
                    <TableHead className="text-slate-700">Price</TableHead>
                    <TableHead className="text-slate-700">Status</TableHead>
                    <TableHead className="text-right text-slate-700">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product);
                    const inCartQuantity = cartQuantityBySku[product.sku] ?? 0;
                    const canAdd =
                      product.quantity > 0 && inCartQuantity < product.quantity;

                    return (
                      <TableRow key={product.sku}>
                        <TableCell className="w-[340px]">
                          <p className="font-semibold text-slate-900">
                            {product.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            SKU: {product.sku}
                          </p>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          {product.quantity} {product.unit}
                        </TableCell>
                        <TableCell>{formatPrice(product.price)}</TableCell>
                        <TableCell>
                          <Badge className={statusStyles[status]}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            disabled={!canAdd}
                            onClick={() => addToCart(product)}
                            className="h-8 rounded-md bg-emerald-700 px-3 text-xs text-white hover:bg-emerald-800"
                          >
                            <Plus className="h-4 w-4" />
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-sm text-slate-500"
                      >
                        No products match your search and filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-[30px] font-bold leading-none text-slate-900">
            Checkout Cart
          </h2>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              {checkoutItems.length === 0 ? (
                <div className="flex h-[130px] flex-col items-center justify-center rounded-md border border-slate-200 text-slate-400">
                  <ShoppingCart className="h-11 w-11" />
                  <p className="mt-2 text-base">No items in cart</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {checkoutItems.map((item) => {
                    const lineTotal = item.quantity * item.price;
                    const canIncrease = item.quantity < item.available;

                    return (
                      <div
                        key={item.sku}
                        className="rounded-md border border-slate-200 p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {item.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              available: {item.available} {item.unit}
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-label="Remove from cart"
                            onClick={() => removeFromCart(item.sku)}
                            className="rounded p-1 text-rose-500 transition hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() =>
                                updateCartLine(item.sku, item.quantity - 1)
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-4 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              disabled={!canIncrease}
                              onClick={() =>
                                updateCartLine(item.sku, item.quantity + 1)
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-2xl font-semibold text-slate-800">
                            {formatPrice(lineTotal)}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span className="font-semibold">Total Items:</span>
                      <span className="font-semibold">{totalItems}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-2xl font-bold text-slate-900">
                      <span>Total Amount:</span>
                      <span className="text-emerald-700">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={openConfirmModal}
                    className="h-11 w-full bg-emerald-700 text-base text-white hover:bg-emerald-800"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Complete Checkout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-[670px] border-slate-200 p-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Confirm Checkout
            </DialogTitle>
            <DialogDescription className="pt-1 text-base leading-snug text-slate-500 sm:text-lg">
              Are you sure you want to checkout these items? This will reduce
              the inventory quantities.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {checkoutItems.map((item) => (
              <div
                key={item.sku}
                className="flex items-center justify-between gap-4"
              >
                <p className="text-lg font-medium text-slate-900 sm:text-2xl">
                  {item.name} x {item.quantity}
                </p>
                <p className="text-lg font-semibold text-slate-900 sm:text-2xl">
                  {formatPrice(item.quantity * item.price)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between text-2xl font-semibold leading-none text-slate-900 sm:text-3xl">
              <span>Total:</span>
              <span className="text-emerald-700">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>

          <DialogFooter className="mt-3 gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="h-12 px-8 text-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCheckout}
              disabled={confirming || checkoutItems.length === 0}
              className="h-12 bg-emerald-700 px-8 text-lg text-white hover:bg-emerald-800"
            >
              {confirming ? "Confirming..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
