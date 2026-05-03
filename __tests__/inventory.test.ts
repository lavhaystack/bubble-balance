/// <reference types="jest" />

import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import { randomUUID } from "crypto";
import { createClient } from "../lib/supabase/server";

// Ensure environment guard passes
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for tests");
}

jest.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => [],
    set: () => undefined,
  }),
}));

import { POST } from "../app/api/inventory/route";

function makeApp() {
  const app = express();
  app.use(bodyParser.json());

  app.post("/api/inventory", async (req, res) => {
    const url = `http://localhost/api/inventory`;
    const init: any = { method: "POST", headers: req.headers };
    if (req.body) init.body = JSON.stringify(req.body);
    const nextReq = new Request(url, init);
    const nextRes = await POST(nextReq as any, {} as any);
    const json = await nextRes.json();
    res.status(nextRes.status).json(json);
  });

  return app;
}

describe("/api/inventory", () => {
  let app: express.Express;
  let supplierId = "";
  let productId = "";
  let supabase: Awaited<ReturnType<typeof createClient>>;
  const inventoryIds: string[] = [];
  const runId = randomUUID();

  beforeAll(async () => {
    app = makeApp();
    supabase = await createClient();

    const { data: supplier, error: supplierError } = await supabase
      .from("suppliers")
      .insert({
        name: `Test Supplier ${runId}`,
        contact_person: "Test Contact",
        email: `test+${runId}@example.com`,
        phone: "+10000000000",
      })
      .select("id")
      .single();

    if (supplierError || !supplier) {
      throw supplierError ?? new Error("Unable to create supplier for tests");
    }

    supplierId = supplier.id;

    const { data: product, error: productError } = await supabase
      .from("supplier_products")
      .insert({
        supplier_id: supplierId,
        name: `Test Product ${runId}`,
        sku: `SKU-${runId}`,
        category: "test",
        unit: "pcs",
        price: 10,
      })
      .select("id")
      .single();

    if (productError || !product) {
      throw productError ?? new Error("Unable to create supplier product for tests");
    }

    productId = product.id;
  });

  afterAll(async () => {
    if (inventoryIds.length > 0) {
      await supabase.from("inventory_stocks").delete().in("id", inventoryIds);
    }

    if (productId) {
      await supabase.from("supplier_products").delete().eq("id", productId);
    }

    if (supplierId) {
      await supabase.from("suppliers").delete().eq("id", supplierId);
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("happy path: creates inventory and returns 201 with item", async () => {
    const payload = {
      supplierProductId: productId,
      quantity: 5,
      batchId: `BATCH-${randomUUID()}`,
      expiration: null,
      reorderLevel: 3,
    };

    const res = await (request(app) as any).post("/api/inventory").send(payload).expect(201);

    expect(res.body).toHaveProperty("ok", true);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.supplierProductId).toBe(payload.supplierProductId);
    expect(res.body.data.quantity).toBe(payload.quantity);
    inventoryIds.push(res.body.data.id);
  });

  it("sad path: validation fails when required fields missing", async () => {
    // Missing supplierProductId and batchId
    const badPayload = {
      quantity: 1,
    };

    const res = await (request(app) as any).post("/api/inventory").send(badPayload).expect(400);

    expect(res.body).toHaveProperty("ok", false);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
  });
});
