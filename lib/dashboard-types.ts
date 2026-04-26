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
  reorderLevel: number;
  createdAt: string;
  updatedAt: string;
};

export type CheckoutConfirmResult = {
  orderId: string;
  totalItems: number;
  totalAmount: number;
};
