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

function loadCheckoutRoute(options: {
  hasEnvVars?: boolean;
  rpcResult?: MockRpcResult;
} = {}) {
  jest.resetModules();

  const rpc = jest.fn().mockResolvedValue(
    options.rpcResult ?? {
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

  jest.doMock("@/lib/utils", () => ({
    hasEnvVars: options.hasEnvVars ?? true,
  }));

  jest.doMock("@/lib/supabase/server", () => ({
    createClient: jest.fn().mockResolvedValue({ rpc }),
  }));

  const { POST } = require("../app/api/checkout/confirm/route") as {
    POST: CheckoutPostHandler;
  };

  return { POST, rpc };
}

describe("/api/checkout/confirm", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("happy path: confirms checkout and returns the computed totals", async () => {
    const { POST, rpc } = loadCheckoutRoute();
    const server = createRouteServer(POST);
    const payload = {
      items: [
        { inventoryId: "0b7d8a6c-3e41-4d23-9d6b-c7d02b9d5e01", quantity: 2 },
        { inventoryId: "dd87ed1e-4d3a-46c2-a6ad-2472cc0b1c3f", quantity: 1 },
      ],
    };

    const response = await request(server)
      .post("/api/checkout/confirm")
      .send(payload)
      .expect(200);
    server.close();

    expect(rpc).toHaveBeenCalledWith("confirm_checkout", {
      p_items: [
        {
          inventory_id: "0b7d8a6c-3e41-4d23-9d6b-c7d02b9d5e01",
          quantity: 2,
        },
        {
          inventory_id: "dd87ed1e-4d3a-46c2-a6ad-2472cc0b1c3f",
          quantity: 1,
        },
      ],
    });

    expect(response.body).toEqual({
      ok: true,
      data: {
        orderId: "order_123",
        totalItems: 3,
        totalAmount: 125.5,
      },
    });
  });

  it("sad path: returns env guard error when Supabase vars are missing", async () => {
    const { POST, rpc } = loadCheckoutRoute({ hasEnvVars: false });
    const server = createRouteServer(POST);

    const response = await request(server)
      .post("/api/checkout/confirm")
      .send({ items: [] })
      .expect(503);
    server.close();

    expect(rpc).not.toHaveBeenCalled();
    expect(response.body).toEqual({
      ok: false,
      error: {
        message: "Missing Supabase environment variables",
        code: "MISSING_ENV_VARS",
      },
    });
  });

  it("sad path: rejects when items is missing", async () => {
    const { POST } = loadCheckoutRoute();
    const server = createRouteServer(POST);

    const response = await request(server)
      .post("/api/checkout/confirm")
      .send({})
      .expect(400);
    server.close();

    expect(response.body.ok).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("sad path: rejects when items array is empty", async () => {
    const { POST } = loadCheckoutRoute();
    const server = createRouteServer(POST);

    const response = await request(server)
      .post("/api/checkout/confirm")
      .send({ items: [] })
      .expect(400);
    server.close();

    expect(response.body.ok).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("sad path: rejects an invalid checkout line", async () => {
    const { POST } = loadCheckoutRoute();
    const server = createRouteServer(POST);

    const response = await request(server)
      .post("/api/checkout/confirm")
      .send({
        items: [
          {
            inventoryId: "not-a-uuid",
            quantity: 0,
          },
        ],
      })
      .expect(400);
    server.close();

    expect(response.body.ok).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("sad path: surfaces checkout command errors", async () => {
    const { POST } = loadCheckoutRoute({
      rpcResult: {
        data: null,
        error: {
          message: "Insufficient stock",
          code: "CHECKOUT_STOCK_ERROR",
        },
      },
    });
    const server = createRouteServer(POST);

    const response = await request(server)
      .post("/api/checkout/confirm")
      .send({
        items: [
          {
            inventoryId: "0b7d8a6c-3e41-4d23-9d6b-c7d02b9d5e01",
            quantity: 1,
          },
        ],
      })
      .expect(400);
    server.close();

    expect(response.body).toEqual({
      ok: false,
      error: {
        message: "Insufficient stock",
        code: "CHECKOUT_STOCK_ERROR",
      },
    });
  });

  it("sad path: fails when checkout returns no result", async () => {
    const { POST } = loadCheckoutRoute({
      rpcResult: {
        data: [],
        error: null,
      },
    });
    const server = createRouteServer(POST);

    const response = await request(server)
      .post("/api/checkout/confirm")
      .send({
        items: [
          {
            inventoryId: "0b7d8a6c-3e41-4d23-9d6b-c7d02b9d5e01",
            quantity: 1,
          },
        ],
      })
      .expect(500);
    server.close();

    expect(response.body).toEqual({
      ok: false,
      error: {
        message: "Checkout did not return a result",
        code: "CHECKOUT_RESULT_MISSING",
      },
    });
  });
});
