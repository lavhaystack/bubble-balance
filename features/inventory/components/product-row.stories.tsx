import type { Meta, StoryObj } from "@storybook/react";

import ProductRow from "./product-row";
import type { Product } from "./types";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const meta: Meta<typeof ProductRow> = {
	title: "Inventory/ProductRow",
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
};

export const InStock: Story = {
	args: {
		product: baseProduct,
		deleteProduct: () => undefined,
		setProductArchived: () => undefined,
		quickCheckout: () => undefined,
		isArchivedView: false,
	},
};

export const LowStock: Story = {
	args: {
		product: {
			...baseProduct,
			id: "inv-charcoal",
			supplierProductId: "sp-charcoal",
			sku: "SOAP-002",
			name: "Charcoal Detox Soap",
			quantity: 2,
			initialQuantity: 2,
			expiration: "2026-07-15",
			batchId: "BATCH-2026-02",
		},
		deleteProduct: () => undefined,
		setProductArchived: () => undefined,
		quickCheckout: () => undefined,
		isArchivedView: false,
	},
};

export const OutOfStock: Story = {
	args: {
		product: {
			...baseProduct,
			id: "inv-goat",
			supplierProductId: "sp-goat",
			sku: "SOAP-003",
			name: "Goat Milk Soap",
			quantity: 0,
			initialQuantity: 0,
			expiration: "2027-01-10",
			batchId: "BATCH-2026-03",
		},
		deleteProduct: () => undefined,
		setProductArchived: () => undefined,
		quickCheckout: () => undefined,
		isArchivedView: false,
	},
};
