export type InventoryRecord = {
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

export const INVENTORY_STORAGE_KEY = "bubble-balance.inventory";
export const INVENTORY_UPDATED_EVENT = "bubble-balance:inventory-updated";

export const DEFAULT_INVENTORY_PRODUCTS: InventoryRecord[] = [
  {
    name: "Lavender Essential Oil Soap",
    sku: "LAV-001",
    category: "Essential Oil",
    quantity: 45,
    unit: "bars",
    price: 8.99,
    expiration: "2026-08-15",
    supplier: "Natural Supplies Co.",
    reorderLevel: 15,
  },
  {
    name: "Tea Tree Antibacterial Soap",
    sku: "TEA-002",
    category: "Antibacterial",
    quantity: 12,
    unit: "bars",
    price: 9.99,
    expiration: "2025-04-20",
    supplier: "Pure Botanicals",
    reorderLevel: 14,
  },
  {
    name: "Chamomile and Honey Moisturizing Soap",
    sku: "CHA-003",
    category: "Moisturizing",
    quantity: 67,
    unit: "bars",
    price: 7.49,
    expiration: "2026-12-10",
    supplier: "Organic Essence Ltd.",
    reorderLevel: 20,
  },
  {
    name: "Activated Charcoal Detox Soap",
    sku: "CHA-004",
    category: "Detox",
    quantity: 8,
    unit: "bars",
    price: 10.99,
    expiration: "2025-05-30",
    supplier: "Natural Supplies Co.",
    reorderLevel: 12,
  },
  {
    name: "Eucalyptus Mint Soap",
    sku: "EUC-008",
    category: "Essential Oil",
    quantity: 52,
    unit: "bars",
    price: 8.99,
    expiration: "2026-07-18",
    supplier: "Natural Supplies Co.",
    reorderLevel: 12,
  },
  {
    name: "Sweet Orange Soap",
    sku: "SWE-009",
    category: "Essential Oil",
    quantity: 0,
    unit: "bars",
    price: 7.99,
    expiration: "2025-12-10",
    supplier: "Pure Botanicals",
    reorderLevel: 10,
  },
];

export function getStoredInventoryProducts(): InventoryRecord[] {
  if (typeof window === "undefined") {
    return DEFAULT_INVENTORY_PRODUCTS;
  }

  const raw = window.localStorage.getItem(INVENTORY_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_INVENTORY_PRODUCTS;
  }

  try {
    const parsed = JSON.parse(raw) as InventoryRecord[];
    if (!Array.isArray(parsed)) {
      return DEFAULT_INVENTORY_PRODUCTS;
    }
    return parsed;
  } catch {
    return DEFAULT_INVENTORY_PRODUCTS;
  }
}

export function saveInventoryProducts(products: InventoryRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event(INVENTORY_UPDATED_EVENT));
}
