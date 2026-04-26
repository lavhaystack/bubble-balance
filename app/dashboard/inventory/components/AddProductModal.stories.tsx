import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps } from 'react';

import AddProductModal from './AddProductModal';

const meta: Meta<typeof AddProductModal> = {
	title: 'Inventory/AddProductModal',
	component: AddProductModal,
};

export default meta;

type Story = StoryObj<typeof AddProductModal>;
type AddProductModalProps = ComponentProps<typeof AddProductModal>;

const nowIso = '2026-04-21T00:00:00.000Z';

const suppliers: AddProductModalProps['suppliers'] = [
	{
		id: 'sup-herbal',
		name: 'Herbal Co.',
		contactPerson: 'Maya Santos',
		email: 'maya@herbalco.test',
		phone: '+63-912-111-1111',
		createdAt: nowIso,
		updatedAt: nowIso,
		products: [
			{
				id: 'prod-lavender',
				supplierId: 'sup-herbal',
				name: 'Lavender Soap',
				sku: 'LAVSOA-001',
				category: 'Bath & Body',
				unit: 'pcs',
				price: 180,
				createdAt: nowIso,
				updatedAt: nowIso,
			},
			{
				id: 'prod-teatree',
				supplierId: 'sup-herbal',
				name: 'Tea Tree Soap',
				sku: 'TEASOA-001',
				category: 'Bath & Body',
				unit: 'pcs',
				price: 210,
				createdAt: nowIso,
				updatedAt: nowIso,
			},
		],
	},
	{
		id: 'sup-organic',
		name: 'Organic Essentials',
		contactPerson: 'Leo Reyes',
		email: 'leo@organic.test',
		phone: '+63-912-222-2222',
		createdAt: nowIso,
		updatedAt: nowIso,
		products: [
			{
				id: 'prod-charcoal',
				supplierId: 'sup-organic',
				name: 'Charcoal Detox Soap',
				sku: 'CHADET-001',
				category: 'Bath & Body',
				unit: 'pcs',
				price: 240,
				createdAt: nowIso,
				updatedAt: nowIso,
			},
		],
	},
	{
		id: 'sup-empty',
		name: 'Farm Fresh',
		contactPerson: 'Nina Cruz',
		email: 'nina@farmfresh.test',
		phone: '+63-912-333-3333',
		createdAt: nowIso,
		updatedAt: nowIso,
		products: [],
	},
];

export const Default: Story = {
	args: {
		open: true,
		onClose: () => undefined,
		onAdd: () => undefined,
		suppliers,
	},
};

export const NoSupplierProducts: Story = {
	args: {
		open: true,
		onClose: () => undefined,
		onAdd: () => undefined,
		suppliers: suppliers.filter((supplier) => supplier.id === 'sup-empty'),
	},
};


