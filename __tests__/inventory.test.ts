import request from "supertest";

import { createRouteServer } from "./helpers/api-test-utils";

const inventoryRepository = {
	list: jest.fn(),
	create: jest.fn(),
	setArchived: jest.fn(),
	delete: jest.fn(),
};

const repositoryFactoryMock = jest.fn().mockImplementation(() => ({
	createInventoryRepository: () => inventoryRepository,
}));

jest.mock("@/lib/supabase/server", () => ({
	createClient: jest.fn().mockResolvedValue({}),
}));

jest.mock("@/lib/patterns/repositories/dashboard-repository-factory", () => ({
	SupabaseDashboardRepositoryFactory: repositoryFactoryMock,
}));

import { GET, POST } from "@/app/api/inventory/route";
import { PATCH, DELETE } from "@/app/api/inventory/[id]/route";

const inventoryId = "44444444-4444-4444-8444-444444444444";
const supplierProductId = "55555555-5555-4555-8555-555555555555";

const sampleInventory = {
	id: inventoryId,
	quantity: 20,
	initialQuantity: 20,
	batchId: "BATCH-001",
	expiration: "2026-01-01",
	archivedAt: null,
	supplierProductId,
	createdAt: "2024-01-01T00:00:00.000Z",
	updatedAt: "2024-01-01T00:00:00.000Z",
};

beforeAll(() => {
	process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost";
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key";
});

beforeEach(() => {
	jest.clearAllMocks();
});

test("GET /api/inventory returns inventory", async () => {
	inventoryRepository.list.mockResolvedValue([sampleInventory]);
	const server = createRouteServer(GET);

	const response = await request(server).get("/api/inventory");
	server.close();

	expect(response.status).toBe(200);
	expect(response.body).toEqual({
		ok: true,
		data: {
			items: [sampleInventory],
		},
	});
});

test("GET /api/inventory forwards includeArchived", async () => {
	inventoryRepository.list.mockResolvedValue([sampleInventory]);
	const server = createRouteServer(GET);

	const response = await request(server).get(
		"/api/inventory?includeArchived=true",
	);
	server.close();

	expect(response.status).toBe(200);
	expect(inventoryRepository.list).toHaveBeenCalledWith({
		includeArchived: true,
	});
});

test("POST /api/inventory creates a stock record", async () => {
	inventoryRepository.create.mockResolvedValue(sampleInventory);
	const server = createRouteServer(POST);

	const response = await request(server)
		.post("/api/inventory")
		.send({
			supplierProductId,
			quantity: 20,
			batchId: "BATCH-001",
			expiration: "2026-01-01",
		});
	server.close();

	expect(response.status).toBe(201);
	expect(response.body).toEqual({ ok: true, data: sampleInventory });
});

test("PATCH /api/inventory/:id archives stock", async () => {
	inventoryRepository.setArchived.mockResolvedValue({
		...sampleInventory,
		archivedAt: "2024-06-01T00:00:00.000Z",
	});
	const server = createRouteServer(PATCH, { id: inventoryId });

	const response = await request(server)
		.patch(`/api/inventory/${inventoryId}`)
		.send({ archived: true });
	server.close();

	expect(response.status).toBe(200);
	expect(response.body).toEqual({
		ok: true,
		data: { ...sampleInventory, archivedAt: "2024-06-01T00:00:00.000Z" },
	});
});

test("DELETE /api/inventory/:id deletes stock", async () => {
	inventoryRepository.delete.mockResolvedValue(undefined);
	const server = createRouteServer(DELETE, { id: inventoryId });

	const response = await request(server).delete(
		`/api/inventory/${inventoryId}`,
	);
	server.close();

	expect(response.status).toBe(200);
	expect(response.body).toEqual({ ok: true, data: { deleted: true } });
});
