import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import SupplierTable from "./supplier-table";
import type { SupplierRecord } from "@/lib/types/dashboard";

const createdAt = "2026-04-20T00:00:00.000Z";

const rows: SupplierRecord[] = [
	{
		id: "herbal-co",
		name: "Herbal Co.",
		contactPerson: "Maya Reyes",
		email: "maya@herbalco.com",
		phone: "+63 917 200 1001",
		createdAt,
		updatedAt: createdAt,
		products: [
			{
				id: "sp-lavender",
				supplierId: "herbal-co",
				name: "Lavender Soap",
				sku: "LAVSOA-001",
				price: 3.5,
				category: "Bath & Body",
				unit: "pcs",
				createdAt,
				updatedAt: createdAt,
			},
			{
				id: "sp-tea-tree",
				supplierId: "herbal-co",
				name: "Tea Tree Soap",
				sku: "TEASOA-001",
				price: 4.25,
				category: "Bath & Body",
				unit: "pcs",
				createdAt,
				updatedAt: createdAt,
			},
		],
	},
	{
		id: "organic-essentials",
		name: "Organic Essentials",
		contactPerson: "Liam Cruz",
		email: "liam@organicessentials.com",
		phone: "+63 918 300 2002",
		createdAt,
		updatedAt: createdAt,
		products: [
			{
				id: "sp-charcoal",
				supplierId: "organic-essentials",
				name: "Charcoal Detox Soap",
				sku: "CHADET-001",
				price: 4,
				category: "Bath & Body",
				unit: "pcs",
				createdAt,
				updatedAt: createdAt,
			},
		],
	},
	{
		id: "farm-fresh",
		name: "Farm Fresh",
		contactPerson: "Noah Santos",
		email: "noah@farmfresh.com",
		phone: "+63 919 400 3003",
		createdAt,
		updatedAt: createdAt,
		products: [],
	},
];

const meta: Meta<typeof SupplierTable> = {
	title: "Suppliers/SupplierTable",
	component: SupplierTable,
	decorators: [
		(Story) => (
			<div className="max-w-6xl p-4">
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof SupplierTable>;

export const Collapsed: Story = {
	args: {
		rows,
		expandedIds: {},
		onToggleExpanded: () => undefined,
		onOpenAddProductModal: () => undefined,
		onEditSupplier: () => undefined,
		onRequestRemoveSupplier: () => undefined,
		onEditSupplierProduct: () => undefined,
		onAddProductToInventory: () => undefined,
		onRequestRemoveSupplierProduct: () => undefined,
	},
};

export const FirstExpanded: Story = {
	args: {
		rows,
		expandedIds: {
			"herbal-co": true,
		},
		onToggleExpanded: () => undefined,
		onOpenAddProductModal: () => undefined,
		onEditSupplier: () => undefined,
		onRequestRemoveSupplier: () => undefined,
		onEditSupplierProduct: () => undefined,
		onAddProductToInventory: () => undefined,
		onRequestRemoveSupplierProduct: () => undefined,
	},
};

export const AllExpanded: Story = {
	args: {
		rows,
		expandedIds: {
			"herbal-co": true,
			"organic-essentials": true,
			"farm-fresh": true,
		},
		onToggleExpanded: () => undefined,
		onOpenAddProductModal: () => undefined,
		onEditSupplier: () => undefined,
		onRequestRemoveSupplier: () => undefined,
		onEditSupplierProduct: () => undefined,
		onAddProductToInventory: () => undefined,
		onRequestRemoveSupplierProduct: () => undefined,
	},
};

export const Interactive: Story = {
	args: {
		rows,
		expandedIds: {
			"herbal-co": true,
		},
	},
	render: (args) => {
		const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(args.expandedIds ?? {});

		return (
			<SupplierTable
				rows={args.rows}
				expandedIds={expandedIds}
				onToggleExpanded={(supplierId) => {
					setExpandedIds((prev) => ({
						...prev,
						[supplierId]: !prev[supplierId],
					}));
				}}
				onOpenAddProductModal={(supplierId) => {
					console.info("Add product clicked", { supplierId });
				}}
				onEditSupplier={(supplierId) => {
					console.info("Edit supplier clicked", { supplierId });
				}}
				onRequestRemoveSupplier={(supplierId) => {
					console.info("Remove supplier clicked", { supplierId });
				}}
				onEditSupplierProduct={(productId) => {
					console.info("Edit supplier product clicked", { productId });
				}}
				onAddProductToInventory={(supplierId, productId) => {
					console.info("Add product to inventory clicked", { supplierId, productId });
				}}
				onRequestRemoveSupplierProduct={(supplierId, productId, productName) => {
					console.info("Remove supplier product clicked", {
						supplierId,
						productId,
						productName,
					});
				}}
			/>
		);
	},
};
