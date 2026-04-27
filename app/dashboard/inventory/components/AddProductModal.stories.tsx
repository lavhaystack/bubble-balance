import type { Meta, StoryObj } from '@storybook/react';
import type { SupplierRecord } from '@/lib/dashboard-types';

import AddProductModal from './AddProductModal';

const meta: Meta<typeof AddProductModal> = {
	title: 'Inventory/AddProductModal',
	component: AddProductModal,
};

export default meta;

type Story = StoryObj<typeof AddProductModal>;

const now = '2026-04-27T00:00:00.000Z';

const suppliers: SupplierRecord[] = [
	{
		id: 'sup-herbal',
		name: 'Herbal Co.',
		contactPerson: 'Mara Silva',
		email: 'mara@herbalco.example',
		phone: '+63 900 000 0001',
		createdAt: now,
		updatedAt: now,
		products: [
			{
				id: 'sp-lavender',
				supplierId: 'sup-herbal',
				name: 'Lavender Soap',
				sku: 'LAVSOA-001',
				category: 'Bath & Body',
				unit: 'pcs',
				price: 3.5,
				createdAt: now,
				updatedAt: now,
			},
			{
				id: 'sp-teatree',
				supplierId: 'sup-herbal',
				name: 'Tea Tree Soap',
				sku: 'TEASOA-001',
				category: 'Bath & Body',
				unit: 'pcs',
				price: 4.25,
				createdAt: now,
				updatedAt: now,
			},
		],
	},
	{
		id: 'sup-organic',
		name: 'Organic Essentials',
		contactPerson: 'Lio Ramos',
		email: 'lio@organic.example',
		phone: '+63 900 000 0002',
		createdAt: now,
		updatedAt: now,
		products: [
			{
				id: 'sp-charcoal',
				supplierId: 'sup-organic',
				name: 'Charcoal Detox Soap',
				sku: 'CHADET-001',
				category: 'Bath & Body',
				unit: 'pcs',
				price: 4,
				createdAt: now,
				updatedAt: now,
			},
		],
	},
	{
		id: 'sup-farm',
		name: 'Farm Fresh',
		contactPerson: 'Nina Cruz',
		email: 'nina@farmfresh.example',
		phone: '+63 900 000 0003',
		createdAt: now,
		updatedAt: now,
		products: [],
	},
];

export const Default: Story = {
	args: {
		open: true,
		onClose: () => undefined,
		onAdd: () => undefined,
		suppliers,
		existingBatchIds: ['BATCH-LAVSOA-001', 'BATCH-CHADET-001'],
	},
};

export const NoSupplierProducts: Story = {
	args: {
		open: true,
		onClose: () => undefined,
		onAdd: () => undefined,
		suppliers,
		initialSupplierId: 'sup-farm',
		existingBatchIds: ['BATCH-LAVSOA-001', 'BATCH-CHADET-001'],
	},
};
