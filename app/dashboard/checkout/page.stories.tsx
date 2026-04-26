import { useEffect, useLayoutEffect, useRef } from "react";
import type { Meta, StoryObj, Decorator } from "@storybook/react";
import { Toaster } from "sonner";

import CheckoutPage from "./page";
import type { CheckoutLinePayload } from "@/lib/dashboard-api";
import type { InventoryStockRecord } from "@/lib/dashboard-types";

type MockApiOptions = {
	inventory: InventoryStockRecord[];
	inventoryDelayMs?: number;
	failInventory?: boolean;
	failCheckout?: boolean;
};

const createdAt = "2026-04-21T00:00:00.000Z";

const baseInventory: InventoryStockRecord[] = [
	{
		id: "inv-lavender",
		supplierProductId: "sp-lavender",
		supplierId: "sup-herbal",
		supplierName: "Herbal Co.",
		name: "Lavender Soap",
		sku: "LAVSOA-001",
		category: "Bath & Body",
		unit: "pcs",
		price: 180,
		quantity: 24,
		batchId: "BATCH-2026-01",
		expiration: "2027-01-15",
		reorderLevel: 6,
		createdAt,
		updatedAt: createdAt,
	},
	{
		id: "inv-charcoal",
		supplierProductId: "sp-charcoal",
		supplierId: "sup-organic",
		supplierName: "Organic Essentials",
		name: "Charcoal Detox Soap",
		sku: "CHADET-001",
		category: "Bath & Body",
		unit: "pcs",
		price: 240,
		quantity: 3,
		batchId: "BATCH-2026-02",
		expiration: "2026-11-10",
		reorderLevel: 5,
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
		quantity: 0,
		batchId: "BATCH-2026-03",
		expiration: "2026-09-01",
		reorderLevel: 4,
		createdAt,
		updatedAt: createdAt,
	},
	{
		id: "inv-lemongrass",
		supplierProductId: "sp-lemongrass",
		supplierId: "sup-herbal",
		supplierName: "Herbal Co.",
		name: "Lemongrass Soap",
		sku: "LEMSOA-001",
		category: "Herbal",
		unit: "pcs",
		price: 195,
		quantity: 12,
		batchId: "BATCH-2026-04",
		expiration: "2027-03-20",
		reorderLevel: 5,
		createdAt,
		updatedAt: createdAt,
	},
];

function cloneInventory(inventory: InventoryStockRecord[]) {
	return inventory.map((item) => ({ ...item }));
}

function toJsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"Content-Type": "application/json",
		},
	});
}

function MockApiDecorator({
	options,
	children,
}: {
	options: MockApiOptions;
	children: React.ReactNode;
}) {
	const optionsRef = useRef(options);
	const inventoryRef = useRef(cloneInventory(options.inventory));

	useEffect(() => {
		optionsRef.current = options;
		inventoryRef.current = cloneInventory(options.inventory);
	}, [options]);

	useLayoutEffect(() => {
		const originalFetch = globalThis.fetch;

		const mockedFetch: typeof fetch = async (input, init) => {
			const request =
				typeof input === "string"
					? input
					: input instanceof URL
						? input.toString()
						: input.url;
			const pathname = new URL(request, "http://localhost").pathname;
			const currentOptions = optionsRef.current;

			if (pathname === "/api/inventory" && (!init?.method || init.method === "GET")) {
				if (currentOptions.inventoryDelayMs && currentOptions.inventoryDelayMs > 0) {
					await new Promise((resolve) => setTimeout(resolve, currentOptions.inventoryDelayMs));
				}

				if (currentOptions.failInventory) {
					return toJsonResponse(
						{
							ok: false,
							error: { message: "Checkout products are unavailable right now." },
						},
						500,
					);
				}

				return toJsonResponse({
					ok: true,
					data: { items: inventoryRef.current },
				});
			}

			if (pathname === "/api/checkout/confirm" && init?.method === "POST") {
				if (currentOptions.failCheckout) {
					return toJsonResponse(
						{
							ok: false,
							error: { message: "Unable to complete checkout right now." },
						},
						400,
					);
				}

				const payload = init.body
					? (JSON.parse(String(init.body)) as { items?: CheckoutLinePayload[] })
					: {};
				const lines = payload.items ?? [];

				for (const line of lines) {
					const entry = inventoryRef.current.find((item) => item.id === line.inventoryId);
					if (!entry) {
						return toJsonResponse(
							{
								ok: false,
								error: { message: "Inventory item not found." },
							},
							404,
						);
					}

					if (line.quantity <= 0 || line.quantity > entry.quantity) {
						return toJsonResponse(
							{
								ok: false,
								error: { message: "Invalid checkout quantity." },
							},
							400,
						);
					}
				}

				for (const line of lines) {
					const entry = inventoryRef.current.find((item) => item.id === line.inventoryId);
					if (entry) {
						entry.quantity -= line.quantity;
					}
				}

				const totalItems = lines.reduce((sum, line) => sum + line.quantity, 0);
				const totalAmount = lines.reduce((sum, line) => {
					const item = inventoryRef.current.find((entry) => entry.id === line.inventoryId);
					return sum + (item ? item.price * line.quantity : 0);
				}, 0);

				return toJsonResponse({
					ok: true,
					data: {
						orderId: "ORDER-STORY-001",
						totalItems,
						totalAmount,
					},
				});
			}

			return originalFetch(input, init);
		};

		globalThis.fetch = mockedFetch;
		return () => {
			globalThis.fetch = originalFetch;
		};
	}, []);

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
			inventory: baseInventory,
		};

	return (
		<MockApiDecorator options={options}>
			<Story />
		</MockApiDecorator>
	);
};

const meta: Meta<typeof CheckoutPage> = {
	title: "Checkout/Page",
	component: CheckoutPage,
	decorators: [withMockApi],
	parameters: {
		layout: "fullscreen",
		mockApi: {
			inventory: baseInventory,
		} satisfies MockApiOptions,
	},
};

export default meta;

type Story = StoryObj<typeof CheckoutPage>;

export const Default: Story = {};

export const EmptyInventory: Story = {
	parameters: {
		mockApi: {
			inventory: [],
		} satisfies MockApiOptions,
	},
};

export const LoadingState: Story = {
	parameters: {
		mockApi: {
			inventory: baseInventory,
			inventoryDelayMs: 1800,
		} satisfies MockApiOptions,
	},
};

export const InventoryFetchError: Story = {
	parameters: {
		mockApi: {
			inventory: baseInventory,
			failInventory: true,
		} satisfies MockApiOptions,
	},
};

export const CheckoutFailure: Story = {
	parameters: {
		mockApi: {
			inventory: baseInventory,
			failCheckout: true,
		} satisfies MockApiOptions,
	},
};
