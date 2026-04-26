import type {
  InventoryStockRecord,
  SupplierProductRecord,
  SupplierRecord,
} from "@/lib/dashboard-types";

type SupplierRow = {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
};

type SupplierProductRow = {
  id: string;
  supplier_id: string;
  name: string;
  sku: string;
  category: string | null;
  unit: string | null;
  price: number | string;
  created_at: string;
  updated_at: string;
};

type InventoryRow = {
  id: string;
  quantity: number;
  initial_quantity: number | null;
  batch_id: string;
  expiration: string | null;
  archived_at: string | null;
  reorder_level: number;
  supplier_product_id: string;
  created_at: string;
  updated_at: string;
  supplier_products:
    | {
        id: string;
        supplier_id: string;
        name: string;
        sku: string;
        category: string | null;
        unit: string | null;
        price: number | string;
        suppliers:
          | {
              id: string;
              name: string;
            }
          | Array<{
              id: string;
              name: string;
            }>;
      }
    | Array<{
        id: string;
        supplier_id: string;
        name: string;
        sku: string;
        category: string | null;
        unit: string | null;
        price: number | string;
        suppliers:
          | {
              id: string;
              name: string;
            }
          | Array<{
              id: string;
              name: string;
            }>;
      }>
    | null;
};

function takeFirst<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function mapSupplierProductRow(
  row: SupplierProductRow,
): SupplierProductRecord {
  return {
    id: row.id,
    supplierId: row.supplier_id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    unit: row.unit,
    price: Number(row.price),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSupplierRows(
  suppliers: SupplierRow[],
  products: SupplierProductRow[],
): SupplierRecord[] {
  const productMap = products.reduce<Record<string, SupplierProductRecord[]>>(
    (acc, row) => {
      const mapped = mapSupplierProductRow(row);
      const list = acc[mapped.supplierId] ?? [];
      list.push(mapped);
      acc[mapped.supplierId] = list;
      return acc;
    },
    {},
  );

  Object.values(productMap).forEach((list) =>
    list.sort((a, b) => a.name.localeCompare(b.name)),
  );

  return suppliers
    .map((row) => ({
      id: row.id,
      name: row.name,
      contactPerson: row.contact_person,
      email: row.email,
      phone: row.phone,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      products: productMap[row.id] ?? [],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function mapInventoryRow(
  row: InventoryRow,
): InventoryStockRecord | null {
  const product = takeFirst(row.supplier_products);
  const supplier = takeFirst(product?.suppliers);

  if (!product || !supplier) {
    return null;
  }

  return {
    id: row.id,
    supplierProductId: row.supplier_product_id,
    supplierId: supplier.id,
    supplierName: supplier.name,
    name: product.name,
    sku: product.sku,
    category: product.category ?? "Uncategorized",
    unit: product.unit ?? "unit",
    price: Number(product.price),
    quantity: row.quantity,
    initialQuantity: row.initial_quantity ?? row.quantity,
    batchId: row.batch_id,
    expiration: row.expiration ?? "",
    archivedAt: row.archived_at,
    reorderLevel: row.reorder_level,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
