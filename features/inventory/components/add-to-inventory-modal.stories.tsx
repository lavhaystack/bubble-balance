import type { Meta, StoryObj } from "@storybook/react";

import AddProductModal from "./add-to-inventory-modal";
import type { SupplierRecord } from "@/lib/types/dashboard";

const meta: Meta<typeof AddProductModal> = {
	title: "Inventory/AddProductModal",
	component: AddProductModal,
};

export default meta;

type Story = StoryObj<typeof AddProductModal>;

const createdAt = "2026-04-20T00:00:00.000Z";

const suppliers: SupplierRecord[] = [
	{
		id: "sup-herbal",
		name: "Herbal Co.",
		contactPerson: "Maya Reyes",
		email: "maya@herbalco.com",
		phone: "+63 917 200 1001",
		createdAt,
		updatedAt: createdAt,
		products: [
			{
				id: "sp-lavender",
				supplierId: "sup-herbal",
				name: "Lavender Soap",
				sku: "LAVSOA-001",
				category: "Bath & Body",
				unit: "bars",
				price: 180,
				createdAt,
				updatedAt: createdAt,
			},
			{
				id: "sp-lemongrass",
				supplierId: "sup-herbal",
				name: "Lemongrass Soap",
				sku: "LEMSOA-001",
				category: "Herbal",
				unit: "bars",
				price: 195,
				createdAt,
				updatedAt: createdAt,
			},
		],
	},
	{
		id: "sup-organic",
		name: "Organic Essentials",
		contactPerson: "Liam Cruz",
		email: "liam@organicessentials.com",
		phone: "+63 918 300 2002",
		createdAt,
		updatedAt: createdAt,
		products: [
			{
				id: "sp-charcoal",
				supplierId: "sup-organic",
				name: "Charcoal Detox Soap",
				sku: "CHADET-001",
				category: "Bath & Body",
				unit: "pcs",
				price: 240,
				createdAt,
				updatedAt: createdAt,
			},
		],
	},
];

export const Default: Story = {
	args: {
		open: true,
		suppliers,
		onClose: () => undefined,
		onAdd: () => undefined,
	},
};

export const WithPrefilledSelection: Story = {
	args: {
		open: true,
		suppliers,
		initialSupplierId: "sup-herbal",
		initialSupplierProductId: "sp-lemongrass",
		existingBatchIds: ["BATCH-2026-01", "BATCH-2026-02"],
		onClose: () => undefined,
		onAdd: () => undefined,
	},
};
