import type {
  CheckoutConfirmInput,
  CreateInventoryStockInput,
  CreateSupplierInput,
  CreateSupplierProductInput,
  UpdateInventoryArchiveInput,
  UpdateSupplierInput,
  UpdateSupplierProductInput,
} from "@/lib/api/schemas";
import type { createClient } from "@/lib/supabase/server";
import {
  mapInventoryRow,
  mapSupplierProductRow,
  mapSupplierRows,
} from "@/lib/dashboard-mappers";
import type {
  CheckoutConfirmResult,
  InventoryStockRecord,
  SupplierProductRecord,
  SupplierRecord,
} from "@/lib/dashboard-types";
import { AppError } from "@/lib/patterns/errors/app-error";

type SupabaseClientLike = Awaited<ReturnType<typeof createClient>>;

type SupabaseErrorLike = {
  message: string;
  code?: string;
  details?: unknown;
};

const INVENTORY_SELECT =
  "id,quantity,initial_quantity,batch_id,expiration,archived_at,reorder_level,supplier_product_id,created_at,updated_at," +
  "supplier_products!inner(id,supplier_id,name,sku,category,unit,price,suppliers!inner(id,name))";

function failFromSupabase(
  error: SupabaseErrorLike,
  fallbackMessage: string,
  status = 500,
): never {
  throw new AppError(
    error.message || fallbackMessage,
    status,
    error.code,
    error.details,
  );
}

function fail(
  message: string,
  status = 500,
  code?: string,
  details?: unknown,
): never {
  throw new AppError(message, status, code, details);
}

export interface SupplierRepository {
  list(): Promise<SupplierRecord[]>;
  create(payload: CreateSupplierInput): Promise<SupplierRecord>;
  update(id: string, payload: UpdateSupplierInput): Promise<SupplierRecord>;
  delete(id: string): Promise<void>;
}

export interface SupplierProductRepository {
  create(payload: CreateSupplierProductInput): Promise<SupplierProductRecord>;
  update(
    id: string,
    payload: UpdateSupplierProductInput,
  ): Promise<SupplierProductRecord>;
  delete(id: string): Promise<void>;
  listCategories(query: string): Promise<string[]>;
}

export interface InventoryRepository {
  list(options?: {
    includeArchived?: boolean;
  }): Promise<InventoryStockRecord[]>;
  create(payload: CreateInventoryStockInput): Promise<InventoryStockRecord>;
  setArchived(
    id: string,
    payload: UpdateInventoryArchiveInput,
  ): Promise<InventoryStockRecord>;
  delete(id: string): Promise<void>;
}

export interface CheckoutRepository {
  confirm(payload: CheckoutConfirmInput): Promise<CheckoutConfirmResult>;
}

export interface DashboardRepositoryFactory {
  createSupplierRepository(): SupplierRepository;
  createSupplierProductRepository(): SupplierProductRepository;
  createInventoryRepository(): InventoryRepository;
  createCheckoutRepository(): CheckoutRepository;
}

class SupabaseSupplierRepository implements SupplierRepository {
  constructor(private readonly supabase: SupabaseClientLike) {}

  async list() {
    const { data: suppliers, error: suppliersError } = (await this.supabase
      .from("suppliers")
      .select("id,name,contact_person,email,phone,created_at,updated_at")) as {
      data: Array<{
        id: string;
        name: string;
        contact_person: string;
        email: string;
        phone: string;
        created_at: string;
        updated_at: string;
      }> | null;
      error: SupabaseErrorLike | null;
    };

    if (suppliersError) {
      failFromSupabase(suppliersError, "Unable to fetch suppliers");
    }

    const { data: products, error: productsError } = (await this.supabase
      .from("supplier_products")
      .select(
        "id,supplier_id,name,sku,category,unit,price,created_at,updated_at",
      )) as {
      data: Array<{
        id: string;
        supplier_id: string;
        name: string;
        sku: string;
        category: string | null;
        unit: string | null;
        price: string | number;
        created_at: string;
        updated_at: string;
      }> | null;
      error: SupabaseErrorLike | null;
    };

    if (productsError) {
      failFromSupabase(productsError, "Unable to fetch supplier products");
    }

    return mapSupplierRows(suppliers ?? [], products ?? []);
  }

  async create(payload: CreateSupplierInput) {
    const { data, error } = (await this.supabase
      .from("suppliers")
      .insert({
        name: payload.name,
        contact_person: payload.contactPerson,
        email: payload.email,
        phone: payload.phone,
      })
      .select("id,name,contact_person,email,phone,created_at,updated_at")
      .single()) as {
      data: {
        id: string;
        name: string;
        contact_person: string;
        email: string;
        phone: string;
        created_at: string;
        updated_at: string;
      } | null;
      error: SupabaseErrorLike | null;
    };

    if (error) {
      if (error.code === "23505") {
        fail("Supplier name already exists", 409, error.code, error.details);
      }

      failFromSupabase(error, "Unable to create supplier");
    }

    if (!data) {
      fail("Unable to map supplier", 500, "MAPPING_ERROR");
    }

    const [supplier] = mapSupplierRows([data], []);
    if (!supplier) {
      fail("Unable to map supplier", 500, "MAPPING_ERROR");
    }

    return supplier;
  }

  async update(id: string, payload: UpdateSupplierInput) {
    const updates: Record<string, unknown> = {};

    if (payload.name !== undefined) {
      updates.name = payload.name;
    }
    if (payload.contactPerson !== undefined) {
      updates.contact_person = payload.contactPerson;
    }
    if (payload.email !== undefined) {
      updates.email = payload.email;
    }
    if (payload.phone !== undefined) {
      updates.phone = payload.phone;
    }

    const { data, error } = (await this.supabase
      .from("suppliers")
      .update(updates)
      .eq("id", id)
      .select("id,name,contact_person,email,phone,created_at,updated_at")
      .single()) as {
      data: {
        id: string;
        name: string;
        contact_person: string;
        email: string;
        phone: string;
        created_at: string;
        updated_at: string;
      } | null;
      error: SupabaseErrorLike | null;
    };

    if (error) {
      if (error.code === "23505") {
        fail("Supplier name already exists", 409, error.code, error.details);
      }

      failFromSupabase(error, "Unable to update supplier");
    }

    if (!data) {
      fail("Unable to map supplier", 500, "MAPPING_ERROR");
    }

    const [supplier] = mapSupplierRows([data], []);
    if (!supplier) {
      fail("Unable to map supplier", 500, "MAPPING_ERROR");
    }

    return supplier;
  }

  async delete(id: string) {
    const { error } = (await this.supabase
      .from("suppliers")
      .delete()
      .eq("id", id)) as {
      error: SupabaseErrorLike | null;
    };

    if (error) {
      failFromSupabase(error, "Unable to delete supplier");
    }
  }
}

class SupabaseSupplierProductRepository implements SupplierProductRepository {
  constructor(private readonly supabase: SupabaseClientLike) {}

  async create(payload: CreateSupplierProductInput) {
    const { data, error } = (await this.supabase
      .from("supplier_products")
      .insert({
        supplier_id: payload.supplierId,
        name: payload.name,
        sku: payload.sku,
        category: payload.category ?? null,
        unit: payload.unit ?? null,
        price: payload.price,
      })
      .select(
        "id,supplier_id,name,sku,category,unit,price,created_at,updated_at",
      )
      .single()) as {
      data: {
        id: string;
        supplier_id: string;
        name: string;
        sku: string;
        category: string | null;
        unit: string | null;
        price: string | number;
        created_at: string;
        updated_at: string;
      } | null;
      error: SupabaseErrorLike | null;
    };

    if (error) {
      if (error.code === "23505") {
        fail(
          "SKU or product name already exists",
          409,
          error.code,
          error.details,
        );
      }

      failFromSupabase(error, "Unable to create supplier product");
    }

    if (!data) {
      fail("Unable to map supplier product", 500, "MAPPING_ERROR");
    }

    return mapSupplierProductRow(data);
  }

  async update(id: string, payload: UpdateSupplierProductInput) {
    const updates: Record<string, unknown> = {};

    if (payload.name !== undefined) {
      updates.name = payload.name;
    }
    if (payload.sku !== undefined) {
      updates.sku = payload.sku;
    }
    if (payload.category !== undefined) {
      updates.category = payload.category ?? null;
    }
    if (payload.unit !== undefined) {
      updates.unit = payload.unit ?? null;
    }
    if (payload.price !== undefined) {
      updates.price = payload.price;
    }

    const { data, error } = (await this.supabase
      .from("supplier_products")
      .update(updates)
      .eq("id", id)
      .select(
        "id,supplier_id,name,sku,category,unit,price,created_at,updated_at",
      )
      .single()) as {
      data: {
        id: string;
        supplier_id: string;
        name: string;
        sku: string;
        category: string | null;
        unit: string | null;
        price: string | number;
        created_at: string;
        updated_at: string;
      } | null;
      error: SupabaseErrorLike | null;
    };

    if (error) {
      if (error.code === "23505") {
        fail(
          "SKU or product name already exists",
          409,
          error.code,
          error.details,
        );
      }

      failFromSupabase(error, "Unable to update supplier product");
    }

    if (!data) {
      fail("Unable to map supplier product", 500, "MAPPING_ERROR");
    }

    return mapSupplierProductRow(data);
  }

  async delete(id: string) {
    const { error } = (await this.supabase
      .from("supplier_products")
      .delete()
      .eq("id", id)) as {
      error: SupabaseErrorLike | null;
    };

    if (error) {
      failFromSupabase(error, "Unable to delete supplier product");
    }
  }

  async listCategories(query: string) {
    const { data, error } = (await this.supabase
      .from("supplier_products")
      .select("category")
      .not("category", "is", null)) as {
      data: Array<{ category: string | null }> | null;
      error: SupabaseErrorLike | null;
    };

    if (error) {
      failFromSupabase(error, "Unable to fetch categories");
    }

    const categories = [
      ...new Set(
        (data ?? [])
          .map((item) => item.category?.trim())
          .filter((item): item is string => Boolean(item)),
      ),
    ].sort((a, b) => a.localeCompare(b));

    if (!query) {
      return categories;
    }

    return categories.filter((category) =>
      category.toLowerCase().includes(query),
    );
  }
}

class SupabaseInventoryRepository implements InventoryRepository {
  constructor(private readonly supabase: SupabaseClientLike) {}

  private async getById(id: string) {
    const { data, error } = (await this.supabase
      .from("inventory_stocks")
      .select(INVENTORY_SELECT)
      .eq("id", id)
      .single()) as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    if (error || !data) {
      fail(
        error?.message || "Unable to fetch inventory item",
        500,
        error?.code,
      );
    }

    const item = mapInventoryRow(data as never);
    if (!item) {
      fail("Unable to map inventory item", 500, "MAPPING_ERROR");
    }

    return item;
  }

  async list(options?: { includeArchived?: boolean }) {
    const includeArchived = options?.includeArchived ?? false;

    let query = this.supabase
      .from("inventory_stocks")
      .select(INVENTORY_SELECT)
      .order("created_at", { ascending: false });

    if (!includeArchived) {
      query = query.is("archived_at", null);
    }

    const { data, error } = (await query) as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    if (error) {
      failFromSupabase(error, "Unable to fetch inventory");
    }

    return (data ?? [])
      .map((row) => mapInventoryRow(row as never))
      .filter((item): item is InventoryStockRecord => Boolean(item));
  }

  async create(payload: CreateInventoryStockInput) {
    const { data: created, error: createError } = (await this.supabase
      .from("inventory_stocks")
      .insert({
        supplier_product_id: payload.supplierProductId,
        quantity: payload.quantity,
        initial_quantity: payload.quantity,
        batch_id: payload.batchId,
        expiration: payload.expiration ?? null,
        reorder_level: payload.reorderLevel,
      })
      .select("id")
      .single()) as {
      data: { id: string } | null;
      error: SupabaseErrorLike | null;
    };

    if (createError) {
      if (createError.code === "23505") {
        fail(
          "Batch ID must be unique for this SKU",
          409,
          createError.code,
          createError.details,
        );
      }

      failFromSupabase(createError, "Unable to create inventory item");
    }

    if (!created) {
      fail("Unable to fetch inventory item", 500, "INVENTORY_CREATE_MISSING");
    }

    return this.getById(created.id);
  }

  async setArchived(id: string, payload: UpdateInventoryArchiveInput) {
    const { data, error } = (await this.supabase
      .from("inventory_stocks")
      .update({
        archived_at: payload.archived ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select("id")
      .single()) as {
      data: { id: string } | null;
      error: SupabaseErrorLike | null;
    };

    if (error) {
      failFromSupabase(error, "Unable to update inventory archive state");
    }

    if (!data) {
      fail(
        "Unable to fetch inventory item",
        500,
        "INVENTORY_ARCHIVE_UPDATE_MISSING",
      );
    }

    return this.getById(data.id);
  }

  async delete(id: string) {
    const { error } = (await this.supabase
      .from("inventory_stocks")
      .delete()
      .eq("id", id)) as {
      error: SupabaseErrorLike | null;
    };

    if (error) {
      failFromSupabase(error, "Unable to delete inventory item");
    }
  }
}

class SupabaseCheckoutRepository implements CheckoutRepository {
  constructor(private readonly supabase: SupabaseClientLike) {}

  async confirm(payload: CheckoutConfirmInput) {
    const items = payload.items.map((item) => ({
      inventory_id: item.inventoryId,
      quantity: item.quantity,
    }));

    const { data, error } = await this.supabase.rpc("confirm_checkout", {
      p_items: items,
    });

    if (error) {
      fail(error.message, 400, error.code, error.details);
    }

    const firstRow = Array.isArray(data) ? data[0] : null;
    if (!firstRow) {
      fail("Checkout did not return a result", 500, "CHECKOUT_RESULT_MISSING");
    }

    return {
      orderId: String(firstRow.order_id),
      totalItems: Number(firstRow.total_items),
      totalAmount: Number(firstRow.total_amount),
    };
  }
}

export class SupabaseDashboardRepositoryFactory implements DashboardRepositoryFactory {
  constructor(private readonly supabase: SupabaseClientLike) {}

  createSupplierRepository(): SupplierRepository {
    return new SupabaseSupplierRepository(this.supabase);
  }

  createSupplierProductRepository(): SupplierProductRepository {
    return new SupabaseSupplierProductRepository(this.supabase);
  }

  createInventoryRepository(): InventoryRepository {
    return new SupabaseInventoryRepository(this.supabase);
  }

  createCheckoutRepository(): CheckoutRepository {
    return new SupabaseCheckoutRepository(this.supabase);
  }
}
