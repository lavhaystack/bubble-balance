export type SupplierProduct = {
  name: string;
  price: number;
  category?: string;
  unit?: string;
};

export type SupplierRecord = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  products: SupplierProduct[];
};

export const SUPPLIERS_STORAGE_KEY = "bubble-balance.suppliers";
export const SUPPLIERS_UPDATED_EVENT = "bubble-balance:suppliers-updated";

export const DEFAULT_SUPPLIERS: SupplierRecord[] = [
  {
    id: "organic-essential-oils",
    name: "Organic Essential Oils Co.",
    contactPerson: "Sarah Johnson",
    email: "sarah@organicoils.com",
    phone: "+63 917 123 4567",
    products: [
      { name: "Lavender Oil", price: 15.0, category: "Essential Oil", unit: "bottles" },
      { name: "Tea Tree Oil", price: 12.0, category: "Essential Oil", unit: "bottles" },
      { name: "Peppermint Oil", price: 10.0, category: "Essential Oil", unit: "bottles" },
    ],
  },
  {
    id: "natural-soap-supply",
    name: "Natural Soap Supply Inc.",
    contactPerson: "Michael Chen",
    email: "michael@naturalsupply.com",
    phone: "+63 918 765 4321",
    products: [
      { name: "Chamomile Soap Base", price: 20.0, category: "Moisturizing", unit: "bars" },
      { name: "Honey Glycerin", price: 18.0, category: "Moisturizing", unit: "bottles" },
    ],
  },
  {
    id: "eco-packaging",
    name: "Eco Packaging Solutions",
    contactPerson: "David Lee",
    email: "david@ecopackaging.com",
    phone: "+63 919 555 0123",
    products: [],
  },
];

const sortByName = (suppliers: SupplierRecord[]) =>
  [...suppliers].sort((a, b) => a.name.localeCompare(b.name));

export function getStoredSuppliers(): SupplierRecord[] {
  if (typeof window === "undefined") {
    return sortByName(DEFAULT_SUPPLIERS);
  }

  const raw = window.localStorage.getItem(SUPPLIERS_STORAGE_KEY);
  if (!raw) {
    return sortByName(DEFAULT_SUPPLIERS);
  }

  try {
    const parsed = JSON.parse(raw) as SupplierRecord[];
    if (!Array.isArray(parsed)) {
      return sortByName(DEFAULT_SUPPLIERS);
    }
    return sortByName(parsed);
  } catch {
    return sortByName(DEFAULT_SUPPLIERS);
  }
}

export function saveSuppliers(suppliers: SupplierRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  const sorted = sortByName(suppliers);
  window.localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(sorted));
  window.dispatchEvent(new Event(SUPPLIERS_UPDATED_EVENT));
}
