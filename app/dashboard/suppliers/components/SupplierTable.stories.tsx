import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import SupplierTable from "./SupplierTable";
import type { SupplierRecord } from "@/lib/suppliers-store";

const rows: SupplierRecord[] = [
	{
		id: "herbal-co",
		name: "Herbal Co.",
		contactPerson: "Maya Reyes",
		email: "maya@herbalco.com",
		phone: "+63 917 200 1001",
		products: [
			{
				name: "Lavender Soap",
				price: 3.5,
				category: "Bath & Body",
				unit: "pcs",
			},
			{
				name: "Tea Tree Soap",
				price: 4.25,
				category: "Bath & Body",
				unit: "pcs",
			},
		],
	},
	{
		id: "organic-essentials",
		name: "Organic Essentials",
		contactPerson: "Liam Cruz",
		email: "liam@organicessentials.com",
		phone: "+63 918 300 2002",
		products: [
			{
				name: "Charcoal Detox Soap",
				price: 4,
				category: "Bath & Body",
				unit: "pcs",
			},
		],
	},
	{
		id: "farm-fresh",
		name: "Farm Fresh",
		contactPerson: "Noah Santos",
		email: "noah@farmfresh.com",
		phone: "+63 919 400 3003",
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
				onEditSupplierProduct={(supplierId, productName) => {
					console.info("Edit supplier product clicked", { supplierId, productName });
				}}
			/>
		);
	},
};
