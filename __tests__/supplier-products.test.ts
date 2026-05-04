import request from "supertest";

import { createRouteServer } from "./helpers/api-test-utils";

const supplierProductRepository = {
	create: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	listCategories: jest.fn(),
};

const repositoryFactoryMock = jest.fn().mockImplementation(() => ({
	createSupplierProductRepository: () => supplierProductRepository,
}));

jest.mock("@/lib/supabase/server", () => ({
	createClient: jest.fn().mockResolvedValue({}),
}));

jest.mock("@/lib/patterns/repositories/dashboard-repository-factory", () => ({
	SupabaseDashboardRepositoryFactory: repositoryFactoryMock,
}));

import { POST } from "@/app/api/supplier-products/route";
import { PATCH, DELETE } from "@/app/api/supplier-products/[id]/route";

const supplierId = "22222222-2222-4222-8222-222222222222";
const productId = "33333333-3333-4333-8333-333333333333";

const sampleProduct = {
	id: productId,
	supplierId,
	name: "Black Tea",
	sku: "BT-001",
	category: "Tea",
	unit: "box",
	price: 125,
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

test("POST /api/supplier-products creates a supplier product", async () => {
	supplierProductRepository.create.mockResolvedValue(sampleProduct);
	const server = createRouteServer(POST);

	const response = await request(server)
		.post("/api/supplier-products")
		.send({
			supplierId,
			name: "Black Tea",
			sku: "BT-001",
			category: "Tea",
			unit: "box",
			price: 125,
		});
	server.close();

	expect(response.status).toBe(201);
	expect(response.body).toEqual({ ok: true, data: sampleProduct });
});

test("PATCH /api/supplier-products/:id updates a supplier product", async () => {
	supplierProductRepository.update.mockResolvedValue({
		...sampleProduct,
		price: 140,
	});
	const server = createRouteServer(PATCH, { id: productId });

	const response = await request(server)
		.patch(`/api/supplier-products/${productId}`)
		.send({ price: 140 });
	server.close();

	expect(response.status).toBe(200);
	expect(response.body).toEqual({
		ok: true,
		data: { ...sampleProduct, price: 140 },
	});
});

test("DELETE /api/supplier-products/:id deletes a supplier product", async () => {
	supplierProductRepository.delete.mockResolvedValue(undefined);
	const server = createRouteServer(DELETE, { id: productId });

	const response = await request(server).delete(
		`/api/supplier-products/${productId}`,
	);
	server.close();

	expect(response.status).toBe(200);
	expect(response.body).toEqual({ ok: true, data: { deleted: true } });
});
