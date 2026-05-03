import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { Toaster } from "sonner";

import OverviewContent from "./overview-page-content";
import type { DashboardStats, InventoryStockRecord } from "@/lib/types/dashboard";

type MockApiOptions = {
	inventory: InventoryStockRecord[];
	stats: DashboardStats;
	inventoryDelayMs?: number;
	statsDelayMs?: number;
	failInventory?: boolean;
	failStats?: boolean;
};

const createdAt = "2026-04-25T00:00:00.000Z";

const inventory: InventoryStockRecord[] = [
	{
		id: "inv-lavender-a",
		supplierProductId: "sp-lavender",
		supplierId: "sup-herbal",
		supplierName: "Herbal Co.",
		name: "Lavender Soap",
		sku: "LAVSOA-001",
		category: "Bath & Body",
		unit: "pcs",
		price: 180,
		quantity: 12,
		initialQuantity: 12,
		batchId: "BATCH-2026-01",
		expiration: "2027-01-15",
		archivedAt: null,
		createdAt,
		updatedAt: createdAt,
	},
	{
		id: "inv-lavender-b",
		supplierProductId: "sp-lavender",
		supplierId: "sup-herbal",
		supplierName: "Herbal Co.",
		name: "Lavender Soap",
		sku: "LAVSOA-001",
		category: "Bath & Body",
		unit: "pcs",
		price: 180,
		quantity: 8,
		initialQuantity: 8,
		batchId: "BATCH-2026-02",
		expiration: "2027-02-10",
		archivedAt: null,
		createdAt,
		updatedAt: createdAt,
	},
	{
		id: "inv-charcoal-a",
		supplierProductId: "sp-charcoal",
		supplierId: "sup-organic",
		supplierName: "Organic Essentials",
		name: "Charcoal Detox Soap",
		sku: "CHADET-001",
		category: "Bath & Body",
		unit: "pcs",
		price: 240,
		quantity: 0,
		initialQuantity: 0,
		batchId: "BATCH-2026-03",
		expiration: "2026-11-10",
		archivedAt: null,
		createdAt,
		updatedAt: createdAt,
	},
	{
		id: "inv-charcoal-b",
		supplierProductId: "sp-charcoal",
		supplierId: "sup-organic",
		supplierName: "Organic Essentials",
		name: "Charcoal Detox Soap",
		sku: "CHADET-001",
		category: "Bath & Body",
		unit: "pcs",
		price: 240,
		quantity: 0,
		initialQuantity: 0,
		batchId: "BATCH-2026-04",
		expiration: "2026-12-01",
		archivedAt: null,
		createdAt,
		updatedAt: createdAt,
	},
	{
		id: "inv-goat",
		supplierProductId: "sp-goat",
		supplierId: "sup-farm",
		supplierName: "Farm Fresh",
		name: "Goat Milk Soap",
		sku: "GOAMIL-001",
		category: "Bath & Body",
		unit: "pcs",
		price: 220,
		quantity: 34,
		initialQuantity: 34,
		batchId: "BATCH-2026-05",
		expiration: "2027-03-01",
		archivedAt: null,
		createdAt,
		updatedAt: createdAt,
	},
	{
		id: "inv-rose",
		supplierProductId: "sp-rose",
		supplierId: "sup-botanica",
		supplierName: "Botanica",
		name: "Rose Petal Soap",
		sku: "ROSE-001",
		category: "Bath & Body",
		unit: "pcs",
		price: 210,
		quantity: 5,
		initialQuantity: 5,
		batchId: "BATCH-2026-06",
		expiration: "2026-10-05",
		archivedAt: null,
		createdAt,
		updatedAt: createdAt,
	},
	{
		id: "inv-mint",
		supplierProductId: "sp-mint",
		supplierId: "sup-herbal",
		supplierName: "Herbal Co.",
		name: "Mint Refresh Soap",
		sku: "MINT-001",
		category: "Herbal",
		unit: "pcs",
		price: 190,
		quantity: 2,
		initialQuantity: 2,
		batchId: "BATCH-2026-07",
		expiration: "2026-09-20",
		archivedAt: null,
		createdAt,
		updatedAt: createdAt,
	},
	{
		id: "inv-citrus",
		supplierProductId: "sp-citrus",
		supplierId: "sup-zest",
		supplierName: "Zest Supply",
		name: "Citrus Burst Soap",
		sku: "CITRUS-001",
		category: "Citrus",
		unit: "pcs",
		price: 205,
		quantity: 0,
		initialQuantity: 0,
		batchId: "BATCH-2026-08",
		expiration: "2026-12-12",
		archivedAt: null,
		createdAt,
		updatedAt: createdAt,
	},
	{
		id: "inv-oat",
		supplierProductId: "sp-oat",
		supplierId: "sup-farm",
		supplierName: "Farm Fresh",
		name: "Oat Milk Soap",
		sku: "OAT-001",
		category: "Bath & Body",
		unit: "pcs",
		price: 215,
		quantity: 50,
		initialQuantity: 50,
		batchId: "BATCH-2026-09",
		expiration: "2027-05-18",
		archivedAt: null,
		createdAt,
		updatedAt: createdAt,
	},
];

const stats: DashboardStats = {
	totalSales: 124500,
	unitsSold: 320,
	totalInventoryItems: 8,
	topProducts: [
		{
			name: "Lavender Soap",
			sku: "LAVSOA-001",
			sold: 120,
			stock: 20,
			price: 180,
			totalValue: 21600,
			status: "Low Stock",
			supplierId: "sup-herbal",
			supplierProductId: "sp-lavender",
			inventoryId: "inv-lavender-a",
		},
		{
			name: "Goat Milk Soap",
			sku: "GOAMIL-001",
			sold: 90,
			stock: 34,
			price: 220,
			totalValue: 19800,
			status: "In Stock",
			supplierId: "sup-farm",
			supplierProductId: "sp-goat",
			inventoryId: "inv-goat",
		},
		{
			name: "Charcoal Detox Soap",
			sku: "CHADET-001",
			sold: 62,
			stock: 0,
			price: 240,
			totalValue: 14880,
			status: "Out of Stock",
			supplierId: "sup-organic",
			supplierProductId: "sp-charcoal",
			inventoryId: "inv-charcoal-a",
		},
		{
			name: "Oat Milk Soap",
			sku: "OAT-001",
			sold: 48,
			stock: 50,
			price: 215,
			totalValue: 10320,
			status: "In Stock",
			supplierId: "sup-farm",
			supplierProductId: "sp-oat",
			inventoryId: "inv-oat",
		},
	],
};

function toJsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"Content-Type": "application/json",
		},
	});
}

const overviewMockState: {
	options: MockApiOptions;
	originalFetch: typeof fetch | null;
	installed: boolean;
} = {
	options: { inventory, stats },
	originalFetch: null,
	installed: false,
};

function ensureOverviewFetchMockInstalled() {
	if (overviewMockState.installed) {
		return;
	}

	overviewMockState.originalFetch = globalThis.fetch;

	globalThis.fetch = async (input, init) => {
		const requestUrl =
			typeof input === "string"
				? input
				: input instanceof URL
					? input.toString()
					: input.url;

		const url = new URL(requestUrl, "http://localhost");
		const pathname = url.pathname;
		const method = (init?.method ?? "GET").toUpperCase();
		const currentOptions = overviewMockState.options;

		if (pathname === "/api/inventory" && method === "GET") {
			if (currentOptions.inventoryDelayMs && currentOptions.inventoryDelayMs > 0) {
				await new Promise((resolve) =>
					setTimeout(resolve, currentOptions.inventoryDelayMs),
				);
			}

			if (currentOptions.failInventory) {
				return toJsonResponse(
					{
						ok: false,
						error: { message: "Inventory data is unavailable right now." },
					},
					500,
				);
			}

			return toJsonResponse({
				ok: true,
				data: { items: currentOptions.inventory },
			});
		}

		if (pathname === "/api/dashboard/stats" && method === "GET") {
			if (currentOptions.statsDelayMs && currentOptions.statsDelayMs > 0) {
				await new Promise((resolve) =>
					setTimeout(resolve, currentOptions.statsDelayMs),
				);
			}

			if (currentOptions.failStats) {
				return toJsonResponse(
					{
						ok: false,
						error: { message: "Dashboard stats are unavailable right now." },
					},
					500,
				);
			}

			return toJsonResponse({ ok: true, data: currentOptions.stats });
		}

		if (!overviewMockState.originalFetch) {
			throw new Error("Missing original fetch implementation");
		}

		return overviewMockState.originalFetch(input, init);
	};

	overviewMockState.installed = true;
}

function MockApiDecorator({
	options,
	children,
}: {
	options: MockApiOptions;
	children: React.ReactNode;
}) {
	ensureOverviewFetchMockInstalled();
	overviewMockState.options = options;

	return (
		<div className="max-w-[1280px] p-6">
			{children}
			<Toaster richColors position="top-right" />
		</div>
	);
}

const withMockApi: Decorator = (Story, context) => {
	const options =
		(context.parameters.mockApi as MockApiOptions | undefined) ?? {
			inventory,
			stats,
		};

	return (
		<MockApiDecorator options={options}>
			<Story />
		</MockApiDecorator>
	);
};

const meta: Meta<typeof OverviewContent> = {
	title: "Overview/PageContent",
	component: OverviewContent,
	decorators: [withMockApi],
	parameters: {
		layout: "fullscreen",
		mockApi: {
			inventory,
			stats,
		} satisfies MockApiOptions,
	},
};

export default meta;

type Story = StoryObj<typeof OverviewContent>;

export const Default: Story = {};

export const EmptyState: Story = {
	parameters: {
		mockApi: {
			inventory: [],
			stats: {
				totalSales: 0,
				unitsSold: 0,
				totalInventoryItems: 0,
				topProducts: [],
			},
		} satisfies MockApiOptions,
	},
};

export const LoadingState: Story = {
	parameters: {
		mockApi: {
			inventory,
			stats,
			inventoryDelayMs: 1800,
			statsDelayMs: 1800,
		} satisfies MockApiOptions,
	},
};

export const InventoryFetchError: Story = {
	parameters: {
		mockApi: {
			inventory,
			stats,
			failInventory: true,
		} satisfies MockApiOptions,
	},
};

export const StatsFetchError: Story = {
	parameters: {
		mockApi: {
			inventory,
			stats,
			failStats: true,
		} satisfies MockApiOptions,
	},
};
