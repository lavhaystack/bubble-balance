import type {
  CheckoutConfirmResult,
  InventoryStockRecord,
  SupplierProductRecord,
  SupplierRecord,
} from "@/lib/dashboard-types";

type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  error?: {
    message?: string;
  };
};

type FetchLike = typeof fetch;

export function createApiRequester(fetchImpl: FetchLike = fetch) {
  return async function request<T>(
    url: string,
    init?: RequestInit,
  ): Promise<T> {
    const response = await fetchImpl(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    const payload = (await response.json().catch(() => null)) as
      | ApiSuccess<T>
      | ApiFailure
      | null;

    if (!response.ok || !payload || payload.ok === false) {
      const message =
        payload && payload.ok === false
          ? payload.error?.message
          : "Request failed";
      throw new Error(message || "Request failed");
    }

    return payload.data;
  };
}

export const request = createApiRequester();

export type CreateSupplierPayload = {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
};

export type CreateSupplierProductPayload = {
  supplierId: string;
  name: string;
  sku: string;
  category?: string;
  unit?: string;
  price: number;
};

export type CreateInventoryStockPayload = {
  supplierProductId: string;
  quantity: number;
  batchId: string;
  expiration?: string;
  reorderLevel: number;
};

export async function fetchSuppliers() {
  const data = await request<{ items: SupplierRecord[] }>("/api/suppliers");
  return data.items;
}

export async function createSupplier(payload: CreateSupplierPayload) {
  return request<SupplierRecord>("/api/suppliers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSupplier(
  id: string,
  payload: Partial<CreateSupplierPayload>,
) {
  return request<SupplierRecord>(`/api/suppliers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteSupplier(id: string) {
  return request<{ deleted: true }>(`/api/suppliers/${id}`, {
    method: "DELETE",
  });
}

export async function createSupplierProduct(
  payload: CreateSupplierProductPayload,
) {
  return request<SupplierProductRecord>("/api/supplier-products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSupplierProduct(
  id: string,
  payload: Partial<CreateSupplierProductPayload>,
) {
  return request<SupplierProductRecord>(`/api/supplier-products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteSupplierProduct(id: string) {
  return request<{ deleted: true }>(`/api/supplier-products/${id}`, {
    method: "DELETE",
  });
}

export async function fetchInventoryStocks() {
  const data = await request<{ items: InventoryStockRecord[] }>(
    "/api/inventory",
  );
  return data.items;
}

export async function createInventoryStock(
  payload: CreateInventoryStockPayload,
) {
  return request<InventoryStockRecord>("/api/inventory", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteInventoryStock(id: string) {
  return request<{ deleted: true }>(`/api/inventory/${id}`, {
    method: "DELETE",
  });
}

export type CheckoutLinePayload = {
  inventoryId: string;
  quantity: number;
};

export async function confirmCheckout(items: CheckoutLinePayload[]) {
  return request<CheckoutConfirmResult>("/api/checkout/confirm", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}
