# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: spec\overview.spec.ts >> Overview E2E >> renders summary cards and top products
- Location: E2E\spec\overview.spec.ts:300:6

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Low stock alert')
Expected: visible
Error: strict mode violation: getByText('Low stock alert') resolved to 2 elements:
    1) <p class="text-sm font-medium text-gray-500">Low stock alert</p> aka getByText('Low stock alert', { exact: true })
    2) <h2 class="flex items-center gap-2 font-semibold text-gray-900">…</h2> aka getByRole('heading', { name: 'Low Stock Alert' })

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Low stock alert')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - complementary [ref=e4]:
        - generic [ref=e6]:
          - img [ref=e8]
          - heading "Blubble Balance" [level=2] [ref=e12]
        - navigation [ref=e13]:
          - generic [ref=e14]:
            - link "Overview" [ref=e15] [cursor=pointer]:
              - /url: /dashboard/overview
              - img [ref=e16]
              - generic [ref=e21]: Overview
            - link "Inventory" [ref=e22] [cursor=pointer]:
              - /url: /dashboard/inventory
              - img [ref=e23]
              - generic [ref=e27]: Inventory
            - link "Checkout" [ref=e28] [cursor=pointer]:
              - /url: /dashboard/checkout
              - img [ref=e29]
              - generic [ref=e33]: Checkout
            - link "Suppliers" [ref=e34] [cursor=pointer]:
              - /url: /dashboard/suppliers
              - img [ref=e35]
              - generic [ref=e40]: Suppliers
      - main [ref=e42]:
        - generic [ref=e43]:
          - generic [ref=e45]:
            - heading "Overview" [level=1] [ref=e46]
            - button "Add Product" [ref=e47] [cursor=pointer]:
              - img
              - text: Add Product
          - generic [ref=e48]:
            - generic [ref=e49]:
              - paragraph [ref=e50]: Total sales
              - heading "₱124,500.00" [level=3] [ref=e52]
            - generic [ref=e53]:
              - paragraph [ref=e54]: Units sold
              - heading "320" [level=3] [ref=e56]
            - generic [ref=e57]:
              - paragraph [ref=e58]: Active stock
              - heading "8" [level=3] [ref=e60]
            - generic [ref=e61]:
              - paragraph [ref=e62]: Low stock alert
              - heading "3" [level=3] [ref=e64]
          - generic [ref=e65]:
            - generic [ref=e66]:
              - heading "Out of Stock" [level=2] [ref=e68]
              - button "View all" [ref=e69] [cursor=pointer]:
                - text: View all
                - img
            - table [ref=e71]:
              - rowgroup [ref=e72]:
                - row "Product name SKU Category Supplier Status Price" [ref=e73]:
                  - columnheader "Product name" [ref=e74]
                  - columnheader "SKU" [ref=e75]
                  - columnheader "Category" [ref=e76]
                  - columnheader "Supplier" [ref=e77]
                  - columnheader "Status" [ref=e78]
                  - columnheader "Price" [ref=e79]
                  - columnheader [ref=e80]
              - rowgroup [ref=e81]:
                - row "Charcoal Detox Soap CHADET-001 Bath & Body Organic Essentials Out of Stock ₱240.00" [ref=e82]:
                  - cell "Charcoal Detox Soap" [ref=e83]
                  - cell "CHADET-001" [ref=e84]
                  - cell "Bath & Body" [ref=e85]
                  - cell "Organic Essentials" [ref=e86]
                  - cell "Out of Stock" [ref=e87]:
                    - generic [ref=e88]: Out of Stock
                  - cell "₱240.00" [ref=e89]
                  - cell [ref=e90]:
                    - button [ref=e91] [cursor=pointer]:
                      - img
                - row "Citrus Burst Soap CITRUS-001 Citrus Zest Supply Out of Stock ₱205.00" [ref=e92]:
                  - cell "Citrus Burst Soap" [ref=e93]
                  - cell "CITRUS-001" [ref=e94]
                  - cell "Citrus" [ref=e95]
                  - cell "Zest Supply" [ref=e96]
                  - cell "Out of Stock" [ref=e97]:
                    - generic [ref=e98]: Out of Stock
                  - cell "₱205.00" [ref=e99]
                  - cell [ref=e100]:
                    - button [ref=e101] [cursor=pointer]:
                      - img
          - generic [ref=e102]:
            - heading "Top selling products" [level=2] [ref=e104]
            - table [ref=e106]:
              - rowgroup [ref=e107]:
                - row "Product name SKU Item sold In Stock Unit price Total value Status" [ref=e108]:
                  - columnheader "Product name" [ref=e109]
                  - columnheader "SKU" [ref=e110]
                  - columnheader "Item sold" [ref=e111]
                  - columnheader "In Stock" [ref=e112]
                  - columnheader "Unit price" [ref=e113]
                  - columnheader "Total value" [ref=e114]
                  - columnheader "Status" [ref=e115]
                  - columnheader [ref=e116]
              - rowgroup [ref=e117]:
                - row "Lavender Soap LAVSOA-001 120 20 ₱180.00 ₱21,600.00 Low Stock" [ref=e118]:
                  - cell "Lavender Soap" [ref=e119]:
                    - generic [ref=e120]:
                      - img [ref=e122]
                      - generic [ref=e123]: Lavender Soap
                  - cell "LAVSOA-001" [ref=e124]
                  - cell "120" [ref=e125]
                  - cell "20" [ref=e126]
                  - cell "₱180.00" [ref=e127]
                  - cell "₱21,600.00" [ref=e128]
                  - cell "Low Stock" [ref=e129]:
                    - generic [ref=e130]: Low Stock
                  - cell [ref=e131]:
                    - button [ref=e132] [cursor=pointer]:
                      - img
                - row "Goat Milk Soap GOAMIL-001 90 34 ₱220.00 ₱19,800.00 In Stock" [ref=e133]:
                  - cell "Goat Milk Soap" [ref=e134]:
                    - generic [ref=e135]:
                      - img [ref=e137]
                      - generic [ref=e138]: Goat Milk Soap
                  - cell "GOAMIL-001" [ref=e139]
                  - cell "90" [ref=e140]
                  - cell "34" [ref=e141]
                  - cell "₱220.00" [ref=e142]
                  - cell "₱19,800.00" [ref=e143]
                  - cell "In Stock" [ref=e144]:
                    - generic [ref=e145]: In Stock
                  - cell [ref=e146]:
                    - button [ref=e147] [cursor=pointer]:
                      - img
                - row "Charcoal Detox Soap CHADET-001 62 0 ₱240.00 ₱14,880.00 Out of Stock" [ref=e148]:
                  - cell "Charcoal Detox Soap" [ref=e149]:
                    - generic [ref=e150]:
                      - img [ref=e152]
                      - generic [ref=e153]: Charcoal Detox Soap
                  - cell "CHADET-001" [ref=e154]
                  - cell "62" [ref=e155]
                  - cell "0" [ref=e156]
                  - cell "₱240.00" [ref=e157]
                  - cell "₱14,880.00" [ref=e158]
                  - cell "Out of Stock" [ref=e159]:
                    - generic [ref=e160]: Out of Stock
                  - cell [ref=e161]:
                    - button [ref=e162] [cursor=pointer]:
                      - img
                - row "Oat Milk Soap OAT-001 48 50 ₱215.00 ₱10,320.00 In Stock" [ref=e163]:
                  - cell "Oat Milk Soap" [ref=e164]:
                    - generic [ref=e165]:
                      - img [ref=e167]
                      - generic [ref=e168]: Oat Milk Soap
                  - cell "OAT-001" [ref=e169]
                  - cell "48" [ref=e170]
                  - cell "50" [ref=e171]
                  - cell "₱215.00" [ref=e172]
                  - cell "₱10,320.00" [ref=e173]
                  - cell "In Stock" [ref=e174]:
                    - generic [ref=e175]: In Stock
                  - cell [ref=e176]:
                    - button [ref=e177] [cursor=pointer]:
                      - img
          - generic [ref=e178]:
            - generic [ref=e179]:
              - heading "Low Stock Alert" [level=2] [ref=e181]:
                - img [ref=e182]
                - text: Low Stock Alert
              - button "View all" [ref=e184] [cursor=pointer]:
                - text: View all
                - img
            - table [ref=e186]:
              - rowgroup [ref=e187]:
                - row "Product name SKU Current Stock Category Supplier Status" [ref=e188]:
                  - columnheader "Product name" [ref=e189]
                  - columnheader "SKU" [ref=e190]
                  - columnheader "Current Stock" [ref=e191]
                  - columnheader "Category" [ref=e192]
                  - columnheader "Supplier" [ref=e193]
                  - columnheader "Status" [ref=e194]
                  - columnheader [ref=e195]
              - rowgroup [ref=e196]:
                - row "Mint Refresh Soap MINT-001 2 pcs Herbal Herbal Co. Low Stock" [ref=e197]:
                  - cell "Mint Refresh Soap" [ref=e198]
                  - cell "MINT-001" [ref=e199]
                  - cell "2 pcs" [ref=e200]
                  - cell "Herbal" [ref=e201]
                  - cell "Herbal Co." [ref=e202]
                  - cell "Low Stock" [ref=e203]:
                    - generic [ref=e204]: Low Stock
                  - cell [ref=e205]:
                    - button [ref=e206] [cursor=pointer]:
                      - img
                - row "Rose Petal Soap ROSE-001 5 pcs Bath & Body Botanica Low Stock" [ref=e207]:
                  - cell "Rose Petal Soap" [ref=e208]
                  - cell "ROSE-001" [ref=e209]
                  - cell "5 pcs" [ref=e210]
                  - cell "Bath & Body" [ref=e211]
                  - cell "Botanica" [ref=e212]
                  - cell "Low Stock" [ref=e213]:
                    - generic [ref=e214]: Low Stock
                  - cell [ref=e215]:
                    - button [ref=e216] [cursor=pointer]:
                      - img
                - row "Lavender Soap LAVSOA-001 20 pcs Bath & Body Herbal Co. Low Stock" [ref=e217]:
                  - cell "Lavender Soap" [ref=e218]
                  - cell "LAVSOA-001" [ref=e219]
                  - cell "20 pcs" [ref=e220]
                  - cell "Bath & Body" [ref=e221]
                  - cell "Herbal Co." [ref=e222]
                  - cell "Low Stock" [ref=e223]:
                    - generic [ref=e224]: Low Stock
                  - cell [ref=e225]:
                    - button [ref=e226] [cursor=pointer]:
                      - img
  - region "Notifications alt+T"
  - generic [ref=e231] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e232]:
      - img [ref=e233]
    - generic [ref=e236]:
      - button "Open Next.js Dev Tools" [ref=e237]: Cache disabled
      - button "Collapse cache bypass badge" [ref=e238]:
        - img [ref=e239]
  - alert [ref=e241]
```

# Test source

```ts
  204 | 				name: "Lavender Soap",
  205 | 				sku: "LAVSOA-001",
  206 | 				sold: 120,
  207 | 				stock: 20,
  208 | 				price: 180,
  209 | 				totalValue: 21600,
  210 | 				status: "Low Stock",
  211 | 				supplierId: "sup-herbal",
  212 | 				supplierProductId: "sp-lavender",
  213 | 				inventoryId: "inv-lavender-a",
  214 | 			},
  215 | 			{
  216 | 				name: "Goat Milk Soap",
  217 | 				sku: "GOAMIL-001",
  218 | 				sold: 90,
  219 | 				stock: 34,
  220 | 				price: 220,
  221 | 				totalValue: 19800,
  222 | 				status: "In Stock",
  223 | 				supplierId: "sup-farm",
  224 | 				supplierProductId: "sp-goat",
  225 | 				inventoryId: "inv-goat",
  226 | 			},
  227 | 			{
  228 | 				name: "Charcoal Detox Soap",
  229 | 				sku: "CHADET-001",
  230 | 				sold: 62,
  231 | 				stock: 0,
  232 | 				price: 240,
  233 | 				totalValue: 14880,
  234 | 				status: "Out of Stock",
  235 | 				supplierId: "sup-organic",
  236 | 				supplierProductId: "sp-charcoal",
  237 | 				inventoryId: "inv-charcoal-a",
  238 | 			},
  239 | 			{
  240 | 				name: "Oat Milk Soap",
  241 | 				sku: "OAT-001",
  242 | 				sold: 48,
  243 | 				stock: 50,
  244 | 				price: 215,
  245 | 				totalValue: 10320,
  246 | 				status: "In Stock",
  247 | 				supplierId: "sup-farm",
  248 | 				supplierProductId: "sp-oat",
  249 | 				inventoryId: "inv-oat",
  250 | 			},
  251 | 		],
  252 | 	};
  253 | 
  254 | 	await page.route("**/api/inventory**", async (route) => {
  255 | 		if (route.request().method() === "GET") {
  256 | 			await route.fulfill(ok({ items: inventory }));
  257 | 			return;
  258 | 		}
  259 | 
  260 | 		await route.fallback();
  261 | 	});
  262 | 
  263 | 	await page.route("**/api/dashboard/stats", async (route) => {
  264 | 		if (route.request().method() === "GET") {
  265 | 			await route.fulfill(ok(stats));
  266 | 			return;
  267 | 		}
  268 | 
  269 | 		await route.fallback();
  270 | 	});
  271 | }
  272 | 
  273 | test.describe("Overview E2E", () => {
  274 | 	test.beforeEach(async ({ page }) => {
  275 | 		await mockOverviewApi(page);
  276 | 
  277 | 		const inventoryLoaded = page.waitForResponse(
  278 | 			(response) =>
  279 | 				response.url().includes("/api/inventory") &&
  280 | 				response.request().method() === "GET" &&
  281 | 				response.ok(),
  282 | 		);
  283 | 
  284 | 		const statsLoaded = page.waitForResponse(
  285 | 			(response) =>
  286 | 				response.url().includes("/api/dashboard/stats") &&
  287 | 				response.request().method() === "GET" &&
  288 | 				response.ok(),
  289 | 		);
  290 | 
  291 | 		await page.goto("/dashboard/overview", {
  292 | 			waitUntil: "domcontentloaded",
  293 | 		});
  294 | 
  295 | 		await Promise.all([inventoryLoaded, statsLoaded]);
  296 | 
  297 | 		await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  298 | 	});
  299 | 
  300 | 	test("renders summary cards and top products", async ({ page }) => {
  301 | 		await expect(page.getByText("Total sales")).toBeVisible();
  302 | 		await expect(page.getByText("Units sold")).toBeVisible();
  303 | 		await expect(page.getByText("Active stock")).toBeVisible();
> 304 | 		await expect(page.getByText("Low stock alert")).toBeVisible();
      |                                                   ^ Error: expect(locator).toBeVisible() failed
  305 | 
  306 | 		await expect(page.getByText("Lavender Soap")).toBeVisible();
  307 | 		await expect(page.getByText("Goat Milk Soap")).toBeVisible();
  308 | 		await expect(page.getByText("Out of Stock")).toBeVisible();
  309 | 	});
  310 | 
  311 | 	test("shows empty states when no inventory exists", async ({ page }) => {
  312 | 		await page.unroute("**/api/inventory**");
  313 | 		await page.unroute("**/api/dashboard/stats");
  314 | 
  315 | 		await page.route("**/api/inventory**", async (route) => {
  316 | 			if (route.request().method() === "GET") {
  317 | 				await route.fulfill(ok({ items: [] }));
  318 | 				return;
  319 | 			}
  320 | 
  321 | 			await route.fallback();
  322 | 		});
  323 | 
  324 | 		await page.route("**/api/dashboard/stats", async (route) => {
  325 | 			if (route.request().method() === "GET") {
  326 | 				await route.fulfill(
  327 | 					ok({
  328 | 						totalSales: 0,
  329 | 						unitsSold: 0,
  330 | 						totalInventoryItems: 0,
  331 | 						topProducts: [],
  332 | 					}),
  333 | 				);
  334 | 				return;
  335 | 			}
  336 | 
  337 | 			await route.fallback();
  338 | 		});
  339 | 
  340 | 		await page.reload({ waitUntil: "domcontentloaded" });
  341 | 
  342 | 		await expect(page.getByText("No products out of stock")).toBeVisible();
  343 | 		await expect(page.getByText("No sales data available")).toBeVisible();
  344 | 		await expect(page.getByText("No low stock alerts")).toBeVisible();
  345 | 	});
  346 | });
```