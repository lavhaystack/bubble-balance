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
  let supabase: Awaited<ReturnType<typeof createClient>>;
  const supplierIds: string[] = [];
  const runId = randomUUID();

  beforeAll(async () => {
    app = makeApp();
    supabase = await createClient();
  });

  afterAll(async () => {
    if (supplierIds.length > 0) {
      await supabase.from("suppliers").delete().in("id", supplierIds);
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("GET list returns items", async () => {
    const res = await (request(app) as any).get("/api/suppliers").expect(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it("POST create happy path returns 201", async () => {
    const payload = {
      name: `New Supplier ${runId}`,
      contactPerson: "Bob",
      email: `bob+${runId}@example.com`,
      phone: "+639111111111",
    };

    const res = await request(app).post("/api/suppliers").send(payload);
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.name).toBe(payload.name);
    supplierIds.push(res.body.data.id);
  });

  it("POST validation fails when missing fields", async () => {
    const bad = { name: "X" };
    const res = await (request(app) as any).post("/api/suppliers").send(bad).expect(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("PATCH update happy path", async () => {
    const { data: supplier, error: supplierError } = await supabase
      .from("suppliers")
      .insert({
        name: `Update Supplier ${randomUUID()}`,
        contact_person: "Update Contact",
        email: `update+${randomUUID()}@example.com`,
        phone: "+10000000000",
      })
      .select("id")
      .single();

    if (supplierError || !supplier) {
      throw supplierError ?? new Error("Unable to create supplier for update test");
    }

    const id = supplier.id;
    supplierIds.push(id);
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
    const { data: supplier, error: supplierError } = await supabase
      .from("suppliers")
      .insert({
        name: `Empty Update ${randomUUID()}`,
        contact_person: "Empty Contact",
        email: `empty+${randomUUID()}@example.com`,
        phone: "+10000000000",
      })
      .select("id")
      .single();

    if (supplierError || !supplier) {
      throw supplierError ?? new Error("Unable to create supplier for empty update test");
    }

    const id = supplier.id;
    supplierIds.push(id);
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
    const { data: supplier, error: supplierError } = await supabase
      .from("suppliers")
      .insert({
        name: `Delete Supplier ${randomUUID()}`,
        contact_person: "Delete Contact",
        email: `delete+${randomUUID()}@example.com`,
        phone: "+10000000000",
      })
      .select("id")
      .single();

    if (supplierError || !supplier) {
      throw supplierError ?? new Error("Unable to create supplier for delete test");
    }

    const id = supplier.id;
    const req = new Request("http://localhost/api/suppliers/" + id, { method: "DELETE" });
    const nextRes = await DELETE_SUPPLIER(req as any, { params: Promise.resolve({ id }) } as any);
    const json = await nextRes.json();
    expect(nextRes.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.deleted).toBe(true);
  });
});
