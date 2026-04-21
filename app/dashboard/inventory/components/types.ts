import {
  getStockStatusForProduct,
  type StockStatus,
} from "@/lib/dashboard-stock";

export type { StockStatus };

export type Product = {
  id: string;
  supplierProductId: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  initialQuantity: number;
  expiration: string;
  archivedAt: string | null;
  supplier: string;
  batchId: string;
  reorderLevel: number;
};

export const getStockStatus = getStockStatusForProduct;
