/// <reference types="jest" />
import request from "supertest";
import { createRouteServer } from "./helpers/api-test-utils";

jest.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => [],
    set: () => undefined,
  }),
}));

type CheckoutPostHandler = (
  request: Request,
  context: Record<string, never>,
) => Promise<Response>;

type MockRpcResult = {
  data: unknown;
  error: { message: string; code?: string; details?: unknown } | null;
};

function loadCheckoutRoute(rpcResult?: MockRpcResult) {
  jest.resetModules();

  const rpc = jest.fn().mockResolvedValue(
    rpcResult ?? {
      data: [
        {
          order_id: "order_123",
          total_items: "3",
          total_amount: "125.5",
        },
      ],
      error: null,
    },
  );

  jest.doMock("@/lib/supabase/server", () => ({
    createClient: jest.fn().mockResolvedValue({ rpc }),
  }));

  const { POST } = require("../app/api/checkout/confirm/route") as {
    POST: CheckoutPostHandler;
  };

  return { POST, rpc };
}

describe("/api/checkout/confirm", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv }; 
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("happy path: confirms checkout using .env.test variables", async () => {
    const { POST, rpc } = loadCheckoutRoute();
    const server = createRouteServer(POST);
    
    const payload = {
      items: [
        { inventoryId: "0b7d8a6c-3e41-4d23-9d6b-c7d02b9d5e01", quantity: 2 },
      ],
    };

    const response = await request(server)
      .post("/api/checkout/confirm")
      .send(payload)
      .expect(200);

    server.close();

    expect(response.body.ok).toBe(true);
    expect(rpc).toHaveBeenCalled();
    expect(response.body.data.orderId).toBe("order_123");
  });

  it("sad path: returns 503 when Supabase vars are missing from environment", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { POST } = loadCheckoutRoute();
    const server = createRouteServer(POST);

    const response = await request(server)
      .post("/api/checkout/confirm")
      .send({ items: [{ inventoryId: "some-uuid", quantity: 1 }] })
      .expect(503);

    server.close();

    expect(response.body).toEqual({
      ok: false,
      error: {
        message: "Missing Supabase environment variables",
        code: "MISSING_ENV_VARS",
      },
    });
  });

  it("sad path: surfaces database (RPC) errors", async () => {
    const { POST } = loadCheckoutRoute({
      data: null,
      error: { message: "Out of stock", code: "ERR_STOCK" },
    });
    
    const server = createRouteServer(POST);

    const response = await request(server)
      .post("/api/checkout/confirm")
      .send({
        items: [{ inventoryId: "0b7d8a6c-3e41-4d23-9d6b-c7d02b9d5e01", quantity: 1 }],
      })
      .expect(400);

    server.close();
    expect(response.body.error.code).toBe("ERR_STOCK");
  });
});