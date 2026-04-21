import type { Meta, StoryObj } from '@storybook/react';

import AddProductModal from './AddProductModal';

const meta: Meta<typeof AddProductModal> = {
	title: 'Inventory/AddProductModal',
	component: AddProductModal,
};

export default meta;

type Story = StoryObj<typeof AddProductModal>;

const supplierProductsByName = {
	'Herbal Co.': [
		{
			name: 'Lavender Soap',
			price: 3.5,
			category: 'Bath & Body',
			unit: 'pcs',
		},
		{
			name: 'Tea Tree Soap',
			price: 4.25,
			category: 'Bath & Body',
			unit: 'pcs',
		},
	],
	'Organic Essentials': [
		{
			name: 'Charcoal Detox Soap',
			price: 4,
			category: 'Bath & Body',
			unit: 'pcs',
		},
	],
};

export const Default: Story = {
	args: {
		open: true,
		onClose: () => undefined,
		onAdd: () => undefined,
		categories: ['Bath & Body', 'Herbal', 'Essential Oils'],
		suppliers: ['Herbal Co.', 'Organic Essentials', 'Farm Fresh'],
		supplierProductsByName,
		existingSkus: ['LAVSOA-001', 'CHADET-001'],
	},
};

export const NoSupplierProducts: Story = {
	args: {
		open: true,
		onClose: () => undefined,
		onAdd: () => undefined,
		categories: ['Bath & Body', 'Herbal', 'Essential Oils'],
		suppliers: ['Herbal Co.', 'Organic Essentials', 'Farm Fresh'],
		supplierProductsByName: {
			'Farm Fresh': [],
		},
		existingSkus: ['LAVSOA-001', 'CHADET-001'],
	},
};
