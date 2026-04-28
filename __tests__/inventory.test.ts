/// <reference types="jest" />

import express from "express";
import bodyParser from "body-parser";
import request from "supertest";

// Ensure environment guard passes
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://example.com";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "key";

// Mock the Supabase factory used by the route so tests don't call external services
jest.mock("../lib/patterns/repositories/dashboard-repository-factory", () => {
  return {
    SupabaseDashboardRepositoryFactory: jest.fn().mockImplementation(() => ({
      createInventoryRepository: () => ({
        // `list` is used by GET (not required for these tests but provide a stub)
        list: async () => [],
        // `create` will be replaced per-test as needed by assigning to this property
        create: async (payload: any) => {
          return {
            id: "11111111-1111-4111-8111-111111111111",
            supplierProductId: payload.supplierProductId,
            quantity: payload.quantity,
            batchId: payload.batchId,
            expiration: payload.expiration ?? null,
            reorderLevel: payload.reorderLevel ?? 10,
          };
        },
      }),
    })),
  };
});

// Also mock createClient to avoid next/headers interaction
jest.mock("../lib/supabase/server", () => ({
  createClient: jest.fn().mockResolvedValue({}),
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

  beforeAll(() => {
    app = makeApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("happy path: creates inventory and returns 201 with item", async () => {
    const payload = {
      supplierProductId: "22222222-2222-4222-8222-222222222222",
      quantity: 5,
      batchId: "BATCH-1",
      expiration: null,
      reorderLevel: 3,
    };

    const res = await (request(app) as any).post("/api/inventory").send(payload).expect(201);

    expect(res.body).toHaveProperty("ok", true);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.supplierProductId).toBe(payload.supplierProductId);
    expect(res.body.data.quantity).toBe(payload.quantity);
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
