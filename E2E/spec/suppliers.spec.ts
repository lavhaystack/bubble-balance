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

const now = "2026-04-25T09:00:00.000Z";

function ok<T>(data: T) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ ok: true, data }),
  };
}

async function mockSuppliersApi(page: import("@playwright/test").Page) {
  let suppliers: Supplier[] = [
    {
      id: "sup-1",
      name: "Nature Source",
      contactPerson: "Ari Santos",
      email: "ari@nature-source.test",
      phone: "+63 917 111 2222",
      createdAt: now,
      updatedAt: now,
      products: [
        {
          id: "sp-1",
          supplierId: "sup-1",
          name: "Lavender Bar",
          sku: "LAV-001",
          category: "Essential",
          unit: "bars",
          price: 129.5,
          createdAt: now,
          updatedAt: now,
        },
      ],
    },
  ];

  await page.route("**/api/suppliers", async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      await route.fulfill(ok({ items: suppliers }));
      return;
    }

    if (method === "POST") {
      const payload = route.request().postDataJSON() as {
        name: string;
        contactPerson: string;
        email: string;
        phone: string;
      };

      const created: Supplier = {
        id: `sup-${suppliers.length + 1}`,
        name: payload.name,
        contactPerson: payload.contactPerson,
        email: payload.email,
        phone: payload.phone,
        createdAt: now,
        updatedAt: now,
        products: [],
      };

      suppliers = [...suppliers, created];
      await route.fulfill(ok(created));
      return;
    }

    await route.fallback();
  });

  await page.route("**/api/suppliers/*", async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const supplierId = pathname.split("/").pop();
    const method = route.request().method();

    if (!supplierId) {
      await route.fallback();
      return;
    }

    if (method === "PATCH") {
      const patch = route.request().postDataJSON() as Partial<Supplier>;
      let updated: Supplier | null = null;

      suppliers = suppliers.map((supplier) => {
        if (supplier.id !== supplierId) {
          return supplier;
        }

        updated = {
          ...supplier,
          ...patch,
          updatedAt: now,
        };

        return updated;
      });

      await route.fulfill(ok(updated));
      return;
    }

    if (method === "DELETE") {
      suppliers = suppliers.filter((supplier) => supplier.id !== supplierId);
      await route.fulfill(ok({ deleted: true }));
      return;
    }

    await route.fallback();
  });

  await page.route("**/api/supplier-products", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }

    const payload = route.request().postDataJSON() as {
      supplierId: string;
      name: string;
      sku: string;
      category?: string;
      unit?: string;
      price: number;
    };

    const created: SupplierProduct = {
      id: `sp-${suppliers.flatMap((supplier) => supplier.products).length + 1}`,
      supplierId: payload.supplierId,
      name: payload.name,
      sku: payload.sku,
      category: payload.category ?? null,
      unit: payload.unit ?? null,
      price: payload.price,
      createdAt: now,
      updatedAt: now,
    };

    suppliers = suppliers.map((supplier) =>
      supplier.id === payload.supplierId
        ? {
            ...supplier,
            products: [...supplier.products, created],
            updatedAt: now,
          }
        : supplier,
    );

    await route.fulfill(ok(created));
  });

  await page.route("**/api/supplier-products/*", async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const productId = pathname.split("/").pop();
    const method = route.request().method();

    if (!productId) {
      await route.fallback();
      return;
    }

    if (method === "PATCH") {
      const patch = route.request().postDataJSON() as Partial<SupplierProduct>;
      let updated: SupplierProduct | null = null;

      suppliers = suppliers.map((supplier) => {
        const products = supplier.products.map((product) => {
          if (product.id !== productId) {
            return product;
          }

          updated = {
            ...product,
            ...patch,
            updatedAt: now,
          };
          return updated;
        });

        return {
          ...supplier,
          products,
        };
      });

      await route.fulfill(ok(updated));
      return;
    }

    if (method === "DELETE") {
      suppliers = suppliers.map((supplier) => ({
        ...supplier,
        products: supplier.products.filter((product) => product.id !== productId),
      }));

      await route.fulfill(ok({ deleted: true }));
      return;
    }

    await route.fallback();
  });
}

test.describe("Suppliers E2E", () => {
  test.beforeEach(async ({ page }) => {
    await mockSuppliersApi(page);

    const suppliersLoaded = page.waitForResponse(
      (response) =>
        response.url().includes("/api/suppliers") &&
        response.request().method() === "GET" &&
        response.ok(),
    );

    await page.goto("/dashboard/suppliers", {
      waitUntil: "domcontentloaded",
    });
    await suppliersLoaded;

    await expect(page.getByRole("heading", { name: "Suppliers" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Nature Source" })).toBeVisible();
  });

  test("adds, edits, and removes a supplier", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Suppliers" })).toBeVisible();

    await page.getByRole("button", { name: "Add Supplier" }).click();

    await page.getByLabel("Supplier Name *").fill("Blue Ocean Naturals");
    await page.getByLabel("Contact Person *").fill("Mina Reyes");
    await page.getByLabel("Email *").fill("mina@blue-ocean.test");
    await page.getByLabel("Phone *").fill("+63 917 333 4444");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Add Supplier" })
      .click();

    await expect(page.getByText("supplier has been saved")).toBeVisible();
    await expect(page.getByText("Blue Ocean Naturals")).toBeVisible();

    const blueOceanRow = page.getByRole("row").filter({ hasText: "Blue Ocean Naturals" });
    await blueOceanRow.getByRole("button", { name: "Row actions" }).click();
    await page.getByRole("menuitem", { name: "Edit info" }).click();

    await page.getByLabel("Phone *").fill("+63 917 999 0000");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Save Changes" })
      .click();

    await expect(page.getByText("supplier has been edited")).toBeVisible();
    await expect(page.getByText("+63 917 999 0000")).toBeVisible();

    await blueOceanRow.getByRole("button", { name: "Row actions" }).click();
    await page.getByRole("menuitem", { name: "Remove supplier" }).click();

    await expect(
      page.getByText("are you sure you want to remove supplier"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Remove" }).click();

    await expect(page.getByText("supplier has been deleted")).toBeVisible();
    await expect(page.getByText("Blue Ocean Naturals")).toHaveCount(0);
  });

  test("adds, edits, and deletes a supplier product", async ({ page }) => {
    await page
      .getByRole("button", { name: "Add Product to Supplier" })
      .first()
      .click();

    await page.getByLabel("Product Name *").fill("Mint Breeze Soap");
    await page.getByLabel("SKU *").fill("MNTBRS-001");
    await page.getByLabel("Price (₱) *").fill("179.50");
    await page.getByLabel("Unit").fill("bars");
    await page.getByLabel("Category").fill("Menthol");

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Save Product" })
      .click();

    await expect(page.getByText("product has been saved")).toBeVisible();
    await expect(page.getByText("Mint Breeze Soap")).toBeVisible();

    const mintProductRow = page.locator(
      "div.flex.items-center.justify-between.rounded-md.px-3.py-2.text-sm",
      { hasText: "Mint Breeze Soap" },
    );
    await mintProductRow.getByRole("button", { name: "Product actions" }).click();
    await page.getByRole("menuitem", { name: "Edit product" }).click();

    await page.getByLabel("Price (₱) *").fill("199.99");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Save Changes" })
      .click();

    await expect(page.getByText("product has been edited")).toBeVisible();

    await mintProductRow.getByRole("button", { name: "Product actions" }).click();
    await page.getByRole("menuitem", { name: "Delete product" }).click();

    await expect(
      page.getByText("are you sure you want to remove Mint Breeze Soap"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Remove" }).click();

    await expect(page.getByText("product has been deleted")).toBeVisible();
    await expect(page.getByText("Mint Breeze Soap")).toHaveCount(0);
  });
});
