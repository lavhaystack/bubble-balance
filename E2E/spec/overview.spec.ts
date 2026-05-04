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

type DashboardStats = {
	totalSales: number;
	unitsSold: number;
	totalInventoryItems: number;
	topProducts: Array<{
		name: string;
		sku: string;
		supplierId: string;
		supplierProductId: string;
		inventoryId: string | null;
		sold: number;
		stock: number;
		price: number;
		totalValue: number;
		status: string;
	}>;
};

const now = "2026-04-25T09:00:00.000Z";

function ok<T>(data: T) {
	return {
		status: 200,
		contentType: "application/json",
		body: JSON.stringify({ ok: true, data }),
	};
}

async function mockOverviewApi(page: import("@playwright/test").Page) {
	const inventory: InventoryItem[] = [
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
			quantity: 2,
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
		{
			id: "inv-4",
			supplierProductId: "sp-4",
			supplierId: "sup-2",
			supplierName: "Organic Essentials",
			name: "Charcoal Detox Bar",
			sku: "CHAR-001",
			category: "Bath",
			unit: "bars",
			price: 150,
			quantity: 0,
			batchId: "BATCH-CHAR-001",
			expiration: "2026-10-01",
			reorderLevel: 5,
			createdAt: now,
			updatedAt: now,
		},
		{
			id: "inv-5",
			supplierProductId: "sp-5",
			supplierId: "sup-1",
			supplierName: "Nature Source",
			name: "Rose Hip Soap",
			sku: "ROSE-001",
			category: "Floral",
			unit: "bars",
			price: 165,
			quantity: 1,
			batchId: "BATCH-ROSE-001",
			expiration: "2026-08-15",
			reorderLevel: 4,
			createdAt: now,
			updatedAt: now,
		},
		{
			id: "inv-6",
			supplierProductId: "sp-6",
			supplierId: "sup-2",
			supplierName: "Organic Essentials",
			name: "Eucalyptus Mint Soap",
			sku: "EUCM-001",
			category: "Bath",
			unit: "bars",
			price: 155,
			quantity: 0,
			batchId: "BATCH-EUCM-001",
			expiration: "2026-09-15",
			reorderLevel: 3,
			createdAt: now,
			updatedAt: now,
		},
	];

	const dashboardStats: DashboardStats = {
		totalSales: 45000.5,
		unitsSold: 250,
		totalInventoryItems: 6,
		topProducts: [
			{
				name: "Lavender Bar",
				sku: "LAV-001",
				supplierId: "sup-1",
				supplierProductId: "sp-1",
				inventoryId: "inv-1",
				sold: 120,
				stock: 24,
				price: 129.5,
				totalValue: 3108,
				status: "In Stock",
			},
			{
				name: "Lemon Zest Soap",
				sku: "LEM-001",
				supplierId: "sup-1",
				supplierProductId: "sp-2",
				inventoryId: "inv-2",
				sold: 85,
				stock: 2,
				price: 139.75,
				totalValue: 279.5,
				status: "Low Stock",
			},
			{
				name: "Rose Hip Soap",
				sku: "ROSE-001",
				supplierId: "sup-1",
				supplierProductId: "sp-5",
				inventoryId: "inv-5",
				sold: 45,
				stock: 1,
				price: 165,
				totalValue: 165,
				status: "Low Stock",
			},
		],
	};

	await page.route("**/api/inventory**", async (route) => {
		if (route.request().method() !== "GET") {
			await route.fallback();
			return;
		}
		await route.fulfill(ok({ items: inventory }));
	});

	await page.route("**/api/dashboard/stats", async (route) => {
		if (route.request().method() !== "GET") {
			await route.fallback();
			return;
		}
		await route.fulfill(ok(dashboardStats));
	});
}

async function openOverviewPage(page: import("@playwright/test").Page) {
	await mockOverviewApi(page);

	const statsLoaded = page.waitForResponse(
		(response) =>
			response.url().includes("/api/dashboard/stats") &&
			response.request().method() === "GET" &&
			response.ok(),
	);

	await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
	await statsLoaded;

	await expect(
		page.getByRole("heading", { name: "Overview", exact: true }),
	).toBeVisible();
}

test.describe("Overview E2E", () => {
	test("displays dashboard stats cards", async ({ page }) => {
		await openOverviewPage(page);

		// Stats are in a grid section at the top
		const statsGrid = page.locator("section").filter({ hasText: "Total sales" });

		// Total sales
		await expect(statsGrid.getByText("Total sales")).toBeVisible();
		await expect(statsGrid.getByRole("heading", { name: "₱45,000.50" }).first()).toBeVisible();

		// Units sold
		await expect(statsGrid.getByText("Units sold")).toBeVisible();
		await expect(statsGrid.getByRole("heading", { name: "250" }).first()).toBeVisible();

		// Active stock
		await expect(statsGrid.getByText("Active stock")).toBeVisible();
		await expect(statsGrid.getByRole("heading", { name: "6" }).first()).toBeVisible();

		// Low stock alert
		await expect(statsGrid.getByText("Low stock alert")).toBeVisible();
		await expect(statsGrid.getByRole("heading", { name: "2" }).first()).toBeVisible();
	});

	test("displays top selling products table", async ({ page }) => {
		await openOverviewPage(page);

		const topSection = page.locator("section").filter({
			hasText: "Top selling products",
		});

		await expect(
			topSection.getByRole("heading", { name: "Top selling products" }),
		).toBeVisible();

		// Check products are visible
		await expect(
			topSection.getByRole("cell", { name: "Lavender Bar" }).first(),
		).toBeVisible();
		await expect(
			topSection.getByRole("cell", { name: "Lemon Zest Soap" }).first(),
		).toBeVisible();
		await expect(
			topSection.getByRole("cell", { name: "Rose Hip Soap" }).first(),
		).toBeVisible();

		// Check stats displayed
		await expect(topSection.getByRole("cell", { name: "120" })).toBeVisible(); // Lavender sold
		await expect(topSection.getByRole("cell", { name: "85" })).toBeVisible(); // Lemon sold
	});

	test("displays out of stock section", async ({ page }) => {
		await openOverviewPage(page);

		const outSection = page.locator("section").filter({
			hasText: "Out of Stock",
		});

		await expect(
			outSection.getByRole("heading", { name: "Out of Stock" }),
		).toBeVisible();

		// Check out of stock items are visible
		await expect(
			outSection.getByRole("cell", { name: "Goat Milk Soap" }).first(),
		).toBeVisible();
		await expect(
			outSection.getByRole("cell", { name: "Charcoal Detox Bar" }).first(),
		).toBeVisible();

		// Check status badges
		const outOfStockCells = outSection.getByRole("cell", { name: "Out of Stock" });
		await expect(outOfStockCells.first()).toBeVisible();
	});

	test("displays low stock alert section", async ({ page }) => {
		await openOverviewPage(page);

		await expect(
			page.getByRole("heading", { name: /Low Stock Alert/ }),
		).toBeVisible();

		// Low stock items should be visible
		const lowStockSection = page.locator("section").filter({
			hasText: "Low Stock Alert",
		});

		await expect(
			lowStockSection.getByRole("cell", { name: "Lemon Zest Soap" }).first(),
		).toBeVisible();
		await expect(
			lowStockSection.getByRole("cell", { name: "Rose Hip Soap" }).first(),
		).toBeVisible();
	});

	test("navigates to inventory from out of stock view all", async ({
		page,
	}) => {
		await openOverviewPage(page);

		const outOfStockSection = page.locator("section").filter({
			hasText: "Out of Stock",
		});

		const viewAllButton = outOfStockSection.getByRole("button", {
			name: /View all/,
		});

		await viewAllButton.click();

		await page.waitForURL("/dashboard/inventory**");
		await expect(page).toHaveURL(/status=Out%20of%20Stock/);
	});

	test("navigates to inventory from low stock view all", async ({ page }) => {
		await openOverviewPage(page);

		const lowStockSection = page.locator("section").filter({
			hasText: "Low Stock Alert",
		});

		const viewAllButton = lowStockSection.getByRole("button", {
			name: /View all/,
		});

		await viewAllButton.click();

		await page.waitForURL("/dashboard/inventory**");
		await expect(page).toHaveURL(/status=Low%20Stock/);
	});

	test("opens restock menu from out of stock table", async ({ page }) => {
		await openOverviewPage(page);

		// Find Goat Milk Soap row
		const goatRow = page
			.getByRole("row")
			.filter({ hasText: "Goat Milk Soap" });

		// Click the more button (rightmost cell)
		const moreButton = goatRow.locator("button").last();
		await moreButton.click();

		// Check menu items
		await expect(page.getByRole("menuitem", { name: "Restock" })).toBeVisible();
	});

	test("restocks product from out of stock dropdown", async ({ page }) => {
		await openOverviewPage(page);

		// Find Goat Milk Soap row and open menu
		const goatRow = page
			.getByRole("row")
			.filter({ hasText: "Goat Milk Soap" });
		const moreButton = goatRow.locator("button").last();
		await moreButton.click();

		// Click restock
		await page.getByRole("menuitem", { name: "Restock" }).click();

		await page.waitForURL("/dashboard/inventory**");
		await expect(page).toHaveURL(/supplierId=sup-2/);
	});

	test("opens dropdown menu for top product", async ({ page }) => {
		await openOverviewPage(page);

		// Find top selling products section
		const topSection = page.locator("section").filter({
			hasText: "Top selling products",
		});

		// Find Lavender Bar row
		const lavenderRow = topSection
			.getByRole("row")
			.filter({ hasText: "Lavender Bar" });

		// Click more button
		const moreButton = lavenderRow.locator("button").last();
		await moreButton.click();

		// Both menu items should be visible
		await expect(page.getByRole("menuitem", { name: "Restock" })).toBeVisible();
		await expect(
			page.getByRole("menuitem", { name: "Quick Checkout" }),
		).toBeVisible();
	});

	test("restocks from top products dropdown", async ({ page }) => {
		await openOverviewPage(page);

		const topSection = page.locator("section").filter({
			hasText: "Top selling products",
		});

		const lavenderRow = topSection
			.getByRole("row")
			.filter({ hasText: "Lavender Bar" });

		const moreButton = lavenderRow.locator("button").last();
		await moreButton.click();

		await page.getByRole("menuitem", { name: "Restock" }).click();

		await page.waitForURL("/dashboard/inventory**");
		await expect(page).toHaveURL(/supplierId=sup-1/);
	});

	test("quick checkout from top products dropdown", async ({ page }) => {
		await openOverviewPage(page);

		const topSection = page.locator("section").filter({
			hasText: "Top selling products",
		});

		const lavenderRow = topSection
			.getByRole("row")
			.filter({ hasText: "Lavender Bar" });

		const moreButton = lavenderRow.locator("button").last();
		await moreButton.click();

		await page.getByRole("menuitem", { name: "Quick Checkout" }).click();

		await page.waitForURL("/dashboard/checkout**");
		await expect(page).toHaveURL(/inventoryId=inv-1/);
	});

	test("displays status badges correctly", async ({ page }) => {
		await openOverviewPage(page);

		// In Stock badge in top products - filter for badge not table header
		const topSection = page.locator("section").filter({
			hasText: "Top selling products",
		});
		// Look for the badge div, not the table header
		const topTableBody = topSection.locator("tbody");
		await expect(topTableBody.getByText("In Stock").first()).toBeVisible();

		// Low Stock badge in top products
		await expect(topTableBody.getByText("Low Stock").first()).toBeVisible();

		// Out of Stock badge
		const outSection = page.locator("section").filter({
			hasText: "Out of Stock",
		});
		const outTableBody = outSection.locator("tbody");
		await expect(outTableBody.getByText("Out of Stock").first()).toBeVisible();
	});

	test("displays formatted currency values", async ({ page }) => {
		await openOverviewPage(page);

		const topSection = page.locator("section").filter({
			hasText: "Top selling products",
		});

		// Check formatted prices - use first match since prices appear in multiple cells
		await expect(topSection.getByRole("cell", { name: "₱129.50" }).first()).toBeVisible();
		await expect(topSection.getByRole("cell", { name: "₱139.75" }).first()).toBeVisible();
		await expect(topSection.getByRole("cell", { name: "₱165.00" }).first()).toBeVisible();
	});
});
