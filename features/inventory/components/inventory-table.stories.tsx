import type { Meta, StoryObj } from "@storybook/react";
import InventoryTable from "./inventory-table";
import type { Product } from "./types";

const meta: Meta<typeof InventoryTable> = {
  title: "Inventory/InventoryTable",
  component: InventoryTable,
};
export default meta;

type Story = StoryObj<typeof InventoryTable>;

const soapProducts: Product[] = [
  {
    id: "inv-lavender",
    supplierProductId: "sp-lavender",
    sku: "SOAP-001",
    name: "Lavender Soap",
    category: "Bath & Body",
    quantity: 25,
    unit: "pcs",
    price: 3.5,
    initialQuantity: 25,
    expiration: "2026-09-01",
    archivedAt: null,
    supplier: "Herbal Co.",
    batchId: "BATCH-2026-01",
  },
  {
    id: "inv-charcoal",
    supplierProductId: "sp-charcoal",
    sku: "SOAP-002",
    name: "Charcoal Detox Soap",
    category: "Bath & Body",
    quantity: 2,
    unit: "pcs",
    price: 4.0,
    initialQuantity: 2,
    expiration: "2026-07-15",
    archivedAt: null,
    supplier: "Organic Essentials",
    batchId: "BATCH-2026-02",
  },
  {
    id: "inv-goat",
    supplierProductId: "sp-goat",
    sku: "SOAP-003",
    name: "Goat Milk Soap",
    category: "Bath & Body",
    quantity: 0,
    unit: "pcs",
    price: 5.0,
    initialQuantity: 0,
    expiration: "2027-01-10",
    archivedAt: null,
    supplier: "Farm Fresh",
    batchId: "BATCH-2026-03",
  },
];

export const WithSoaps: Story = {
  args: {
    products: soapProducts,
    deleteProduct: (id: string) => alert(`Delete product with id: ${id}`),
    setProductArchived: () => undefined,
    quickCheckout: () => undefined,
    isArchivedView: false,
  },
};

export const Empty: Story = {
  args: {
    products: [],
    deleteProduct: (id: string) => alert(`Delete product with id: ${id}`),
    setProductArchived: () => undefined,
    quickCheckout: () => undefined,
    isArchivedView: false,
  },
};