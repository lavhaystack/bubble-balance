import { expect, test } from "@playwright/test";

type InventoryItem = {
	id: string;
	supplierProductId: string;
	supplierId: string;
	supplierName: string;
	name: string;
	sku: string;
	category: string;
	unit: string;
	price: number;
	quantity: number;
	batchId: string;
	expiration: string;
	reorderLevel: number;
	createdAt: string;
	updatedAt: string;
};

type CheckoutLinePayload = {
	inventoryId: string;
	quantity: number;
};

const now = "2026-04-26T09:00:00.000Z";

function ok<T>(data: T) {
	return {
		status: 200,
		contentType: "application/json",
		body: JSON.stringify({ ok: true, data }),
	};
}

async function mockCheckoutApi(
	page: import("@playwright/test").Page,
	options?: { failCheckout?: boolean },
) {
	let inventory: InventoryItem[] = [
		{
			id: "inv-1",
			supplierProductId: "sp-1",
			supplierId: "sup-1",
			supplierName: "Nature Source",
			name: "Lavender Bar",
			sku: "LAV-001",
			category: "Essential",
			unit: "bars",
			price: 129.5,
			quantity: 24,
			batchId: "BATCH-LAV-001",
			expiration: "2026-12-30",
			reorderLevel: 5,
			createdAt: now,
			updatedAt: now,
		},
		{
			id: "inv-2",
			supplierProductId: "sp-2",
			supplierId: "sup-1",
			supplierName: "Nature Source",
			name: "Lemon Zest Soap",
			sku: "LEM-001",
			category: "Citrus",
			unit: "bars",
			price: 139.75,
			quantity: 3,
			batchId: "BATCH-LEM-002",
			expiration: "2026-11-20",
			reorderLevel: 3,
			createdAt: now,
			updatedAt: now,
		},
		{
			id: "inv-3",
			supplierProductId: "sp-3",
			supplierId: "sup-2",
			supplierName: "Organic Essentials",
			name: "Goat Milk Soap",
			sku: "GOAT-001",
			category: "Bath",
			unit: "bars",
			price: 220,
			quantity: 0,
			batchId: "BATCH-GOA-003",
			expiration: "2026-09-01",
			reorderLevel: 2,
			createdAt: now,
			updatedAt: now,
		},
	];

	await page.route("**/api/inventory", async (route) => {
		if (route.request().method() !== "GET") {
			await route.fallback();
			return;
		}

		await route.fulfill(ok({ items: inventory }));
	});

	await page.route("**/api/checkout/confirm", async (route) => {
		if (route.request().method() !== "POST") {
			await route.fallback();
			return;
		}

		if (options?.failCheckout) {
			await route.fulfill({
				status: 400,
				contentType: "application/json",
				body: JSON.stringify({
					ok: false,
					error: { message: "Unable to complete checkout right now." },
				}),
			});
			return;
		}

		const payload = route.request().postDataJSON() as {
			items?: CheckoutLinePayload[];
		};
		const lines = payload.items ?? [];

		for (const line of lines) {
			const found = inventory.find((item) => item.id === line.inventoryId);
			if (!found || line.quantity <= 0 || line.quantity > found.quantity) {
				await route.fulfill({
					status: 400,
					contentType: "application/json",
					body: JSON.stringify({
						ok: false,
						error: { message: "Invalid checkout quantity." },
					}),
				});
				return;
			}
		}

		inventory = inventory.map((item) => {
			const line = lines.find((entry) => entry.inventoryId === item.id);
			if (!line) {
				return item;
			}

			return {
				...item,
				quantity: item.quantity - line.quantity,
				updatedAt: now,
			};
		});

		const totalItems = lines.reduce((sum, line) => sum + line.quantity, 0);
		const totalAmount = lines.reduce((sum, line) => {
			const found = inventory.find((item) => item.id === line.inventoryId);
			return sum + (found ? found.price * line.quantity : 0);
		}, 0);

		await route.fulfill(
			ok({
				orderId: "ORD-TEST-001",
				totalItems,
				totalAmount,
			}),
		);
	});
}

async function openCheckoutPage(
	page: import("@playwright/test").Page,
	options?: { failCheckout?: boolean },
) {
	await mockCheckoutApi(page, options);

	const inventoryLoaded = page.waitForResponse(
		(response) =>
			response.url().includes("/api/inventory") &&
			response.request().method() === "GET" &&
			response.ok(),
	);

	await page.goto("/dashboard/checkout", { waitUntil: "domcontentloaded" });
	await inventoryLoaded;

	await expect(
		page.getByRole("heading", { name: "Checkout", exact: true }),
	).toBeVisible();
	await expect(page.getByRole("cell", { name: "Lavender Bar" })).toBeVisible();
}

test.describe("Checkout E2E", () => {
	test("completes checkout and updates inventory", async ({ page }) => {
		await openCheckoutPage(page);

		const lavenderRow = page.getByRole("row").filter({ hasText: "Lavender Bar" });
		await lavenderRow.getByRole("button", { name: "Add" }).click();
		const lavenderCartItem = page
			.locator("div.rounded-md.border.border-slate-200.p-3")
			.filter({ hasText: "Lavender Bar" });

		await expect(lavenderCartItem).toBeVisible();
		await expect(page.getByText("Total Items:")).toBeVisible();
		await expect(page.getByText("1", { exact: true })).toBeVisible();

		await page.getByRole("button", { name: "Complete Checkout" }).click();
		await expect(page.getByRole("heading", { name: "Confirm Checkout" })).toBeVisible();

		await page.getByRole("button", { name: "Confirm" }).click();

		await expect(page.getByText("order has been confirmed")).toBeVisible();
		await expect(page.getByText("No items in cart")).toBeVisible();
		await expect(lavenderRow.getByText("23 bars")).toBeVisible();
	});

	test("adds to cart then removes item", async ({ page }) => {
		await openCheckoutPage(page);

		const lemonRow = page.getByRole("row").filter({ hasText: "Lemon Zest Soap" });
		await lemonRow.getByRole("button", { name: "Add" }).click();
		const lemonCartItem = page
			.locator("div.rounded-md.border.border-slate-200.p-3")
			.filter({ hasText: "Lemon Zest Soap" });

		await expect(lemonCartItem).toBeVisible();
		await page.getByRole("button", { name: "Remove from cart" }).click();
		await expect(page.getByText("No items in cart")).toBeVisible();
	});

	test("shows error toast when checkout confirmation fails", async ({ page }) => {
		await openCheckoutPage(page, { failCheckout: true });

		const lavenderRow = page.getByRole("row").filter({ hasText: "Lavender Bar" });
		await lavenderRow.getByRole("button", { name: "Add" }).click();
		await page.getByRole("button", { name: "Complete Checkout" }).click();
		await page.getByRole("button", { name: "Confirm" }).click();

		await expect(page.getByText("Unable to complete checkout right now.")).toBeVisible();
		await expect(page.getByRole("heading", { name: "Confirm Checkout" })).toBeVisible();
	});
});
