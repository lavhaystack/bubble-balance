import request from "supertest";

import { createRouteServer } from "./helpers/api-test-utils";

const supplierRepository = {
	list: jest.fn(),
	create: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
};

const repositoryFactoryMock = jest.fn().mockImplementation(() => ({
	createSupplierRepository: () => supplierRepository,
}));

jest.mock("@/lib/supabase/server", () => ({
	createClient: jest.fn().mockResolvedValue({}),
}));

jest.mock("@/lib/patterns/repositories/dashboard-repository-factory", () => ({
	SupabaseDashboardRepositoryFactory: repositoryFactoryMock,
}));

import { GET, POST } from "@/app/api/suppliers/route";
import { PATCH, DELETE } from "@/app/api/suppliers/[id]/route";

const supplierId = "11111111-1111-4111-8111-111111111111";

const sampleSupplier = {
	id: supplierId,
	name: "Acme Supply",
	contactPerson: "Jane Doe",
	email: "jane@example.com",
	phone: "+639171234567",
	createdAt: "2024-01-01T00:00:00.000Z",
	updatedAt: "2024-01-01T00:00:00.000Z",
	products: [],
};

beforeAll(() => {
	process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost";
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key";
});

beforeEach(() => {
	jest.clearAllMocks();
});

test("GET /api/suppliers returns suppliers", async () => {
	supplierRepository.list.mockResolvedValue([sampleSupplier]);
	const server = createRouteServer(GET);

	const response = await request(server).get("/api/suppliers");
	server.close();

	expect(response.status).toBe(200);
	expect(response.body).toEqual({
		ok: true,
		data: {
			items: [sampleSupplier],
		},
	});
});

test("POST /api/suppliers creates a supplier", async () => {
	supplierRepository.create.mockResolvedValue(sampleSupplier);
	const server = createRouteServer(POST);

	const response = await request(server)
		.post("/api/suppliers")
		.send({
			name: "Acme Supply",
			contactPerson: "Jane Doe",
			email: "jane@example.com",
			phone: "09171234567",
		});
	server.close();

	expect(response.status).toBe(201);
	expect(response.body).toEqual({ ok: true, data: sampleSupplier });
});

test("POST /api/suppliers validates payload", async () => {
	const server = createRouteServer(POST);

	const response = await request(server)
		.post("/api/suppliers")
		.send({});
	server.close();

	expect(response.status).toBe(400);
	expect(response.body.ok).toBe(false);
	expect(response.body.error.code).toBe("VALIDATION_ERROR");
	expect(supplierRepository.create).not.toHaveBeenCalled();
});

test("PATCH /api/suppliers/:id updates a supplier", async () => {
	supplierRepository.update.mockResolvedValue({
		...sampleSupplier,
		name: "Acme Updated",
	});
	const server = createRouteServer(PATCH, { id: supplierId });

	const response = await request(server)
		.patch(`/api/suppliers/${supplierId}`)
		.send({ name: "Acme Updated" });
	server.close();

	expect(response.status).toBe(200);
	expect(response.body).toEqual({
		ok: true,
		data: { ...sampleSupplier, name: "Acme Updated" },
	});
});

test("DELETE /api/suppliers/:id deletes a supplier", async () => {
	supplierRepository.delete.mockResolvedValue(undefined);
	const server = createRouteServer(DELETE, { id: supplierId });

	const response = await request(server).delete(`/api/suppliers/${supplierId}`);
	server.close();

	expect(response.status).toBe(200);
	expect(response.body).toEqual({ ok: true, data: { deleted: true } });
});
