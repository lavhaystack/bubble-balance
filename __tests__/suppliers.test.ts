/// <reference types="jest" />

import express from "express";
import bodyParser from "body-parser";
import request from "supertest";

process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://example.com";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "key";

jest.mock("../lib/patterns/repositories/dashboard-repository-factory", () => ({
  SupabaseDashboardRepositoryFactory: jest.fn().mockImplementation(() => ({
    createSupplierRepository: () => ({
      list: async () => [
        { id: "a1", name: "Supplier A", contactPerson: "Alice", email: "a@example.com", phone: "+639123456789" },
      ],
      create: async (payload: any) => ({ id: "s-1", ...payload }),
      update: async (id: string, payload: any) => ({ id, ...payload }),
      delete: async (id: string) => undefined,
    }),
  })),
}));

jest.mock("../lib/supabase/server", () => ({
  createClient: jest.fn().mockResolvedValue({}),
}));

jest.mock("../lib/patterns/commands/dashboard-commands", () => ({
  CreateSupplierCommand: jest.fn().mockImplementation((repo: any, payload: any) => ({
    execute: async () => ({ id: "s-1", ...payload }),
  })),
  UpdateSupplierCommand: jest.fn().mockImplementation((repo: any, id: string, payload: any) => ({
    execute: async () => ({ id, ...payload }),
  })),
  DeleteSupplierCommand: jest.fn().mockImplementation((repo: any, id: string) => ({
    execute: async () => ({ deleted: true }),
  })),
}));

import { GET, POST } from "../app/api/suppliers/route";
import { PATCH as PATCH_SUPPLIER, DELETE as DELETE_SUPPLIER } from "../app/api/suppliers/[id]/route";

function makeApp() {
  const app = express();
  app.use(bodyParser.json());

  app.get("/api/suppliers", async (_req, res) => {
    const nextReq = new Request("http://localhost/api/suppliers", { method: "GET" });
    const nextRes = await GET(nextReq as any);
    const json = await nextRes.json();
    res.status(nextRes.status).json(json);
  });

  app.post("/api/suppliers", async (req, res) => {
    const init: any = { method: "POST", headers: req.headers };
    if (req.body) init.body = JSON.stringify(req.body);
    const nextReq = new Request("http://localhost/api/suppliers", init);
    const nextRes = await POST(nextReq as any, {} as any);
    const json = await nextRes.json();
    res.status(nextRes.status).json(json);
  });

  return app;
}

describe("/api/suppliers", () => {
  let app: express.Express;

  beforeAll(() => {
    app = makeApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("GET list returns items", async () => {
    const res = await (request(app) as any).get("/api/suppliers").expect(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items[0].name).toBe("Supplier A");
  });

  it("POST create happy path returns 201", async () => {
    const payload = {
      name: "New Supplier",
      contactPerson: "Bob",
      email: "bob@example.com",
      phone: "+639111111111",
    };

    // direct call to POST handler for debug
    const directReq = new Request("http://localhost/api/suppliers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const directRes = await POST(directReq as any, {} as any);
    // eslint-disable-next-line no-console
    console.error("direct POST status:", directRes.status, "body:", await directRes.json());

    const res = await request(app).post("/api/suppliers").send(payload);
    if (res.status !== 201) {
      // debug output for failing response
      // eslint-disable-next-line no-console
      console.error("POST /api/suppliers failed:", res.status, JSON.stringify(res.body, null, 2));
    }
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.name).toBe(payload.name);
  });

  it("POST validation fails when missing fields", async () => {
    const bad = { name: "X" };
    const res = await (request(app) as any).post("/api/suppliers").send(bad).expect(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("PATCH update happy path", async () => {
    const id = "11111111-1111-4111-8111-111111111111";
    const payload = { name: "Updated" };
    const req = new Request("http://localhost/api/suppliers/" + id, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const nextRes = await PATCH_SUPPLIER(req as any, { params: Promise.resolve({ id }) } as any);
    const json = await nextRes.json();
    expect(nextRes.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.name).toBe(payload.name);
  });

  it("PATCH validation fails with empty payload", async () => {
    const id = "11111111-1111-4111-8111-111111111111";
    const req = new Request("http://localhost/api/suppliers/" + id, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    const nextRes = await PATCH_SUPPLIER(req as any, { params: Promise.resolve({ id }) } as any);
    const json = await nextRes.json();
    expect(nextRes.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("DELETE returns deleted true", async () => {
    const id = "11111111-1111-4111-8111-111111111111";
    const req = new Request("http://localhost/api/suppliers/" + id, { method: "DELETE" });
    const nextRes = await DELETE_SUPPLIER(req as any, { params: Promise.resolve({ id }) } as any);
    const json = await nextRes.json();
    expect(nextRes.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.deleted).toBe(true);
  });
});
