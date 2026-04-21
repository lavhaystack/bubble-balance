import type { Meta, StoryObj } from '@storybook/react';
import InventoryTable from './InventoryTable';
import type { Product } from './types';

const meta: Meta<typeof InventoryTable> = {
  title: 'Inventory/InventoryTable',
  component: InventoryTable,
};
export default meta;

type Story = StoryObj<typeof InventoryTable>;

const soapProducts: Product[] = [
  {
    sku: 'SOAP-001',
    name: 'Lavender Soap',
    category: 'Bath & Body',
    quantity: 25,
    unit: 'pcs',
    price: 3.5,
    expiration: '2026-09-01',
    supplier: 'Herbal Co.',
    reorderLevel: 5,
  },
  {
    sku: 'SOAP-002',
    name: 'Charcoal Detox Soap',
    category: 'Bath & Body',
    quantity: 2,
    unit: 'pcs',
    price: 4.0,
    expiration: '2026-07-15',
    supplier: 'Organic Essentials',
    reorderLevel: 5,
  },
  {
    sku: 'SOAP-003',
    name: 'Goat Milk Soap',
    category: 'Bath & Body',
    quantity: 0,
    unit: 'pcs',
    price: 5.0,
    expiration: '2027-01-10',
    supplier: 'Farm Fresh',
    reorderLevel: 3,
  },
];

export const WithSoaps: Story = {
  args: {
    products: soapProducts,
    deleteProduct: (sku: string) => alert(`Delete soap with SKU: ${sku}`),
  },
};

export const Empty: Story = {
  args: {
    products: [],
    deleteProduct: (sku: string) => alert(`Delete soap with SKU: ${sku}`),
  },
};