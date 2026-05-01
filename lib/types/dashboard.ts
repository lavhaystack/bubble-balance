export type SupplierProductRecord = {
  id: string;
  supplierId: string;
  name: string;
  sku: string;
  category: string | null;
  unit: string | null;
  price: number;
  createdAt: string;
  updatedAt: string;
};

export type SupplierRecord = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  products: SupplierProductRecord[];
};

export type InventoryStockRecord = {
  id: string;
  supplierProductId: string;
  supplierId: string;
  supplierName: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  price: number;
  quantity: number;
  initialQuantity: number;
  batchId: string;
  expiration: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CheckoutConfirmResult = {
  orderId: string;
  totalItems: number;
  totalAmount: number;
};

export type TopProductRecord = {
  name: string;
  sku: string;
  sold: number;
  stock: number;
  price: number;
  totalValue: number;
  status: string;
  supplierId: string;
  supplierProductId: string;
  inventoryId?: string;
};

export type DashboardStats = {
  totalSales: number;
  unitsSold: number;
  totalInventoryItems: number;
  topProducts: TopProductRecord[];
};
