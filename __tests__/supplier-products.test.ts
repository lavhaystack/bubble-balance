/// <reference types="jest" />

import express from "express";
import bodyParser from "body-parser";
import request from "supertest";

process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://example.com";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "key";

jest.mock("../lib/patterns/repositories/dashboard-repository-factory", () => ({
  SupabaseDashboardRepositoryFactory: jest.fn().mockImplementation(() => ({
    createSupplierProductRepository: () => ({
      create: async (payload: any) => ({ id: "p-1", ...payload }),
      update: async (id: string, payload: any) => ({ id, ...payload }),
      delete: async (id: string) => undefined,
      listCategories: async (q: string) => ["cat1", "cat2"].filter((c) => c.includes(q)),
    }),
  })),
}));

jest.mock("../lib/supabase/server", () => ({
  createClient: jest.fn().mockResolvedValue({}),
}));

jest.mock("../lib/patterns/commands/dashboard-commands", () => ({
  CreateSupplierProductCommand: jest.fn().mockImplementation((repo: any, payload: any) => ({
    execute: async () => ({ id: "p-1", ...payload }),
  })),
  UpdateSupplierProductCommand: jest.fn().mockImplementation((repo: any, id: string, payload: any) => ({
    execute: async () => ({ id, ...payload }),
  })),
  DeleteSupplierProductCommand: jest.fn().mockImplementation((repo: any, id: string) => ({
    execute: async () => ({ deleted: true }),
  })),
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

  beforeAll(() => {
    app = makeApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("POST create happy path returns 201", async () => {
    const payload = {
      supplierId: "22222222-2222-4222-8222-222222222222",
      name: "Product A",
      sku: "SKU-1",
      category: "cat1",
      unit: "pcs",
      price: 100,
    };

    const res = await (request(app) as any).post("/api/supplier-products").send(payload).expect(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.name).toBe(payload.name);
  });

  it("POST validation fails when missing fields", async () => {
    const bad = { name: "x" };
    const res = await (request(app) as any).post("/api/supplier-products").send(bad).expect(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("PATCH update happy path", async () => {
    const id = "22222222-2222-4222-8222-222222222222";
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
    const id = "22222222-2222-4222-8222-222222222222";
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
    const id = "22222222-2222-4222-8222-222222222222";
    const req = new Request("http://localhost/api/supplier-products/" + id, { method: "DELETE" });
    const nextRes = await DELETE_PRODUCT(req as any, { params: Promise.resolve({ id }) } as any);
    const json = await nextRes.json();
    expect(nextRes.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.deleted).toBe(true);
  });
});
