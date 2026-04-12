import type { Meta, StoryObj } from '@storybook/react';

import ProductRow from './ProductRow';
import type { Product } from './types';
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

const meta: Meta<typeof ProductRow> = {
	title: 'Inventory/ProductRow',
	component: ProductRow,
	decorators: [
		(Story) => (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Product</TableHead>
						<TableHead>SKU</TableHead>
						<TableHead>Category</TableHead>
						<TableHead>Quantity</TableHead>
						<TableHead>Price</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Expiration</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<Story />
				</TableBody>
			</Table>
		),
	],
};

export default meta;

type Story = StoryObj<typeof ProductRow>;

const baseProduct: Product = {
	sku: 'SOAP-001',
	name: 'Lavender Soap',
	category: 'Bath & Body',
	quantity: 25,
	unit: 'pcs',
	price: 3.5,
	expiration: '2026-09-01',
	supplier: 'Herbal Co.',
	reorderLevel: 5,
};

export const InStock: Story = {
	args: {
		product: baseProduct,
		deleteProduct: () => undefined,
	},
};

export const LowStock: Story = {
	args: {
		product: {
			...baseProduct,
			sku: 'SOAP-002',
			name: 'Charcoal Detox Soap',
			quantity: 2,
			reorderLevel: 5,
			expiration: '2026-07-15',
		},
		deleteProduct: () => undefined,
	},
};

export const OutOfStock: Story = {
	args: {
		product: {
			...baseProduct,
			sku: 'SOAP-003',
			name: 'Goat Milk Soap',
			quantity: 0,
			reorderLevel: 3,
			expiration: '2027-01-10',
		},
		deleteProduct: () => undefined,
	},
};
