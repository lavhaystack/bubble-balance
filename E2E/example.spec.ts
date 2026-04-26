import { expect, test } from "@playwright/test";

type SupplierProduct = {
  id: string;
  supplierId: string;
  name: string;
  sku: string;
  category: string | null;
  unit: string | null;
  price: number;
  createdAt: string;
  updatedAt: string;
};

type Supplier = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  products: SupplierProduct[];
};

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

const now = "2026-04-25T09:00:00.000Z";

function ok<T>(data: T) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ ok: true, data }),
  };
}

async function mockInventoryApi(page: import("@playwright/test").Page) {
  const supplierId = "sup-1";
  const supplierProducts: SupplierProduct[] = [
    {
      id: "sp-1",
      supplierId,
      name: "Lavender Bar",
      sku: "LAV-001",
      category: "Essential",
      unit: "bars",
      price: 129.5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sp-2",
      supplierId,
      name: "Lemon Zest Soap",
      sku: "LEM-001",
      category: "Citrus",
      unit: "bars",
      price: 139.75,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const suppliers: Supplier[] = [
    {
      id: supplierId,
      name: "Nature Source",
      contactPerson: "Ari Santos",
      email: "ari@nature-source.test",
      phone: "+63 917 111 2222",
      createdAt: now,
      updatedAt: now,
      products: supplierProducts,
    },
  ];

  let inventory: InventoryItem[] = [
    {
      id: "inv-1",
      supplierProductId: "sp-1",
      supplierId,
      supplierName: "Nature Source",
      name: "Lavender Bar",
      sku: "LAV-001",
      category: "Essential",
      unit: "bars",
      price: 129.5,
      quantity: 50,
      batchId: "BATCH-LAV-001",
      expiration: "2026-12-30",
      reorderLevel: 10,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "inv-2",
      supplierProductId: "sp-2",
      supplierId,
      supplierName: "Nature Source",
      name: "Lemon Zest Soap",
      sku: "LEM-001",
      category: "Citrus",
      unit: "bars",
      price: 139.75,
      quantity: 12,
      batchId: "BATCH-LEM-002",
      expiration: "2026-11-20",
      reorderLevel: 5,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await page.route("**/api/suppliers", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill(ok({ items: suppliers }));
      return;
    }

    await route.fallback();
  });

  await page.route("**/api/inventory", async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      await route.fulfill(ok({ items: inventory }));
      return;
    }

    if (method === "POST") {
      const payload = route.request().postDataJSON() as {
        supplierProductId: string;
        quantity: number;
        batchId: string;
        expiration?: string;
        reorderLevel: number;
      };

      const sourceProduct = supplierProducts.find(
        (product) => product.id === payload.supplierProductId,
      );

      if (!sourceProduct) {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ ok: false, error: { message: "Not found" } }),
        });
        return;
      }

      const supplier = suppliers.find(
        (item) => item.id === sourceProduct.supplierId,
      );

      const created: InventoryItem = {
        id: `inv-${inventory.length + 1}`,
        supplierProductId: sourceProduct.id,
        supplierId: sourceProduct.supplierId,
        supplierName: supplier?.name ?? "Unknown Supplier",
        name: sourceProduct.name,
        sku: sourceProduct.sku,
        category: sourceProduct.category ?? "Uncategorized",
        unit: sourceProduct.unit ?? "unit",
        price: sourceProduct.price,
        quantity: payload.quantity,
        batchId: payload.batchId,
        expiration: payload.expiration ?? "",
        reorderLevel: payload.reorderLevel,
        createdAt: now,
        updatedAt: now,
      };

      inventory = [...inventory, created];
      await route.fulfill(ok(created));
      return;
    }

    await route.fallback();
  });

  await page.route("**/api/inventory/*", async (route) => {
    if (route.request().method() !== "DELETE") {
      await route.fallback();
      return;
    }

    const pathname = new URL(route.request().url()).pathname;
    const id = pathname.split("/").pop();
    inventory = inventory.filter((item) => item.id !== id);

    await route.fulfill(ok({ deleted: true }));
  });
}

test.describe("Inventory E2E", () => {
  test.beforeEach(async ({ page }) => {
    await mockInventoryApi(page);
    await page.goto("/dashboard/inventory", {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByRole("heading", { name: "Inventory Management" }),
    ).toBeVisible();
  });

  test("filters products by search and status", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Inventory Management" }),
    ).toBeVisible();

    await page
      .getByPlaceholder("Search by name, SKU, or supplier...")
      .fill("Lemon");

    await expect(page.getByText("Lemon Zest Soap")).toBeVisible();
    await expect(page.getByText("Lavender Bar")).toHaveCount(0);

    const statusFilter = page.getByRole("combobox").nth(1);
    await statusFilter.click();
    await page.getByRole("option", { name: "Low Stock" }).click();

    await expect(page.getByText("1 of 2 products")).toBeVisible();
    await expect(page.getByText("Lemon Zest Soap")).toBeVisible();
  });

  test("adds and deletes an inventory item", async ({ page }) => {
    await page.getByRole("button", { name: "Add Product" }).click();

    await page.getByLabel("Supplier *").click();
    await page.getByRole("option", { name: "Nature Source" }).click();

    await page.getByLabel("Product Name *").click();
    await page.getByRole("option", { name: "Lemon Zest Soap" }).click();

    await page.getByLabel("Quantity *").fill("27");
    await page.getByLabel("Batch ID *").fill("BATCH-LEM-777");
    await page.getByLabel("Reorder Level *").fill("7");

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Add Product" })
      .click();

    await expect(page.getByText("product has been saved")).toBeVisible();
    await expect(page.getByText("3 of 3 products")).toBeVisible();

    const newProductRow = page
      .getByRole("row")
      .filter({ hasText: "BATCH-LEM-777" });

    await newProductRow.getByRole("button", { name: "Open actions" }).click();
    await page.getByRole("menuitem", { name: "Delete Product" }).click();

    await expect(
      page.getByText("are you sure you want to delete this product"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("product has been deleted")).toBeVisible();
    await expect(page.getByText("BATCH-LEM-777")).toHaveCount(0);
  });
});
