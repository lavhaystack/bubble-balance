export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type Product = {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  expiration: string;
  supplier: string;
  reorderLevel: number;
};

export const getStockStatus = (product: Product): StockStatus => {
  if (product.quantity <= 0) {
    return "Out of Stock";
  }

  if (product.quantity <= product.reorderLevel) {
    return "Low Stock";
  }

  return "In Stock";
};
