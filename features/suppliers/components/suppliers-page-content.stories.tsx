import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { Toaster } from "sonner";

import SuppliersPageContent from "./suppliers-page-content";
import type { SupplierRecord } from "@/lib/types/dashboard";
import { dashboardDataCache } from "@/lib/core/data-cache";

const createdAt = "2026-04-20T00:00:00.000Z";

const suppliers: SupplierRecord[] = [
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

function toJsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"Content-Type": "application/json",
		},
	});
}

const suppliersMockState: {
	originalFetch: typeof fetch | null;
	installed: boolean;
} = {
	originalFetch: null,
	installed: false,
};

function ensureSuppliersFetchMockInstalled() {
	if (suppliersMockState.installed) {
		return;
	}

	suppliersMockState.originalFetch = globalThis.fetch;

	globalThis.fetch = async (input, init) => {
		const requestUrl =
			typeof input === "string"
				? input
				: input instanceof URL
					? input.toString()
					: input.url;

		const pathname = new URL(requestUrl, "http://localhost").pathname;
		const method = (init?.method ?? "GET").toUpperCase();

		if (pathname === "/api/suppliers" && method === "GET") {
			return toJsonResponse({ ok: true, data: { items: suppliers } });
		}

		if (!suppliersMockState.originalFetch) {
			throw new Error("Missing original fetch implementation");
		}

		return suppliersMockState.originalFetch(input, init);
	};

	suppliersMockState.installed = true;
}

const withMockApi: Decorator = (Story) => {
	ensureSuppliersFetchMockInstalled();
	dashboardDataCache.suppliers.reset();

	return (
		<div className="p-6">
			<Story />
			<Toaster richColors position="top-right" />
		</div>
	);
};

const meta: Meta<typeof SuppliersPageContent> = {
	title: "Suppliers/PageContent",
	component: SuppliersPageContent,
	decorators: [withMockApi],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;

type Story = StoryObj<typeof SuppliersPageContent>;

export const Default: Story = {};
