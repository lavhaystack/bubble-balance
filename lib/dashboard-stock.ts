export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export function getStockStatusByQuantity(quantity: number): StockStatus {
  if (quantity <= 0) {
    return "Out of Stock";
  }

  if (quantity <= 20) {
    return "Low Stock";
  }

  return "In Stock";
}

export function getStockStatusForProduct(product: { quantity: number }) {
  return getStockStatusByQuantity(product.quantity);
}
