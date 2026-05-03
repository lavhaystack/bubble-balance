/// <reference types="jest" />

import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import { randomUUID } from "crypto";
import { createClient } from "../lib/supabase/server";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for tests");
}

jest.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => [],
    set: () => undefined,
  }),
}));


import { POST } from "../app/api/supplier-products/route";
import { PATCH as PATCH_PRODUCT, DELETE as DELETE_PRODUCT } from "../app/api/supplier-products/[id]/route";

function makeApp() {
  const app = express();
  app.use(bodyParser.json());

  app.post("/api/supplier-products", async (req, res) => {
    const init: any = { method: "POST", headers: req.headers };
    if (req.body) init.body = JSON.stringify(req.body);
    const nextReq = new Request("http://localhost/api/supplier-products", init);
    const nextRes = await POST(nextReq as any, {} as any);
    const json = await nextRes.json();
    res.status(nextRes.status).json(json);
  });

  return app;
}

describe("/api/supplier-products", () => {
  let app: express.Express;
  let supplierId = "";
  let supabase: Awaited<ReturnType<typeof createClient>>;
  const productIds: string[] = [];
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
  });

  afterAll(async () => {
    if (productIds.length > 0) {
      await supabase.from("supplier_products").delete().in("id", productIds);
    }

    if (supplierId) {
      await supabase.from("suppliers").delete().eq("id", supplierId);
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("POST create happy path returns 201", async () => {
    const payload = {
      supplierId,
      name: "Product A",
      sku: `SKU-${randomUUID()}`,
      category: "cat1",
      unit: "pcs",
      price: 100,
    };

    const res = await (request(app) as any).post("/api/supplier-products").send(payload).expect(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.name).toBe(payload.name);
    productIds.push(res.body.data.id);
  });

  it("POST validation fails when missing fields", async () => {
    const bad = { name: "x" };
    const res = await (request(app) as any).post("/api/supplier-products").send(bad).expect(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("PATCH update happy path", async () => {
    const { data: product, error: productError } = await supabase
      .from("supplier_products")
      .insert({
        supplier_id: supplierId,
        name: `Update Product ${randomUUID()}`,
        sku: `SKU-${randomUUID()}`,
        category: "cat1",
        unit: "pcs",
        price: 50,
      })
      .select("id")
      .single();

    if (productError || !product) {
      throw productError ?? new Error("Unable to create product for update test");
    }

    const id = product.id;
    productIds.push(id);
    const payload = { name: "Updated Product" };
    const req = new Request("http://localhost/api/supplier-products/" + id, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const nextRes = await PATCH_PRODUCT(req as any, { params: Promise.resolve({ id }) } as any);
    const json = await nextRes.json();
    expect(nextRes.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.name).toBe(payload.name);
  });

  it("PATCH validation fails with empty payload", async () => {
    const { data: product, error: productError } = await supabase
      .from("supplier_products")
      .insert({
        supplier_id: supplierId,
        name: `Empty Update ${randomUUID()}`,
        sku: `SKU-${randomUUID()}`,
        category: "cat1",
        unit: "pcs",
        price: 60,
      })
      .select("id")
      .single();

    if (productError || !product) {
      throw productError ?? new Error("Unable to create product for empty update test");
    }

    const id = product.id;
    productIds.push(id);
    const req = new Request("http://localhost/api/supplier-products/" + id, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    const nextRes = await PATCH_PRODUCT(req as any, { params: Promise.resolve({ id }) } as any);
    const json = await nextRes.json();
    expect(nextRes.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("DELETE returns deleted true", async () => {
    const { data: product, error: productError } = await supabase
      .from("supplier_products")
      .insert({
        supplier_id: supplierId,
        name: `Delete Product ${randomUUID()}`,
        sku: `SKU-${randomUUID()}`,
        category: "cat1",
        unit: "pcs",
        price: 70,
      })
      .select("id")
      .single();

    if (productError || !product) {
      throw productError ?? new Error("Unable to create product for delete test");
    }

    const id = product.id;
    const req = new Request("http://localhost/api/supplier-products/" + id, { method: "DELETE" });
    const nextRes = await DELETE_PRODUCT(req as any, { params: Promise.resolve({ id }) } as any);
    const json = await nextRes.json();
    expect(nextRes.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.deleted).toBe(true);
  });
});
