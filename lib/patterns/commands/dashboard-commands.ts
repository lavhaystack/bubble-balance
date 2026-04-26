import type {
  CheckoutConfirmInput,
  CreateInventoryStockInput,
  CreateSupplierInput,
  CreateSupplierProductInput,
  UpdateInventoryArchiveInput,
  UpdateSupplierInput,
  UpdateSupplierProductInput,
} from "@/lib/api/schemas";
import type {
  CheckoutConfirmResult,
  InventoryStockRecord,
  SupplierProductRecord,
  SupplierRecord,
} from "@/lib/dashboard-types";
import type { Command } from "@/lib/patterns/commands/command";
import type {
  CheckoutRepository,
  InventoryRepository,
  SupplierProductRepository,
  SupplierRepository,
} from "@/lib/patterns/repositories/dashboard-repository-factory";

export class CreateSupplierCommand implements Command<SupplierRecord> {
  constructor(
    private readonly repository: SupplierRepository,
    private readonly payload: CreateSupplierInput,
  ) {}

  async execute() {
    return this.repository.create(this.payload);
  }
}

export class UpdateSupplierCommand implements Command<SupplierRecord> {
  constructor(
    private readonly repository: SupplierRepository,
    private readonly id: string,
    private readonly payload: UpdateSupplierInput,
  ) {}

  async execute() {
    return this.repository.update(this.id, this.payload);
  }
}

export class DeleteSupplierCommand implements Command<{ deleted: true }> {
  constructor(
    private readonly repository: SupplierRepository,
    private readonly id: string,
  ) {}

  async execute() {
    await this.repository.delete(this.id);
    return { deleted: true } as const;
  }
}

export class CreateSupplierProductCommand implements Command<SupplierProductRecord> {
  constructor(
    private readonly repository: SupplierProductRepository,
    private readonly payload: CreateSupplierProductInput,
  ) {}

  async execute() {
    return this.repository.create(this.payload);
  }
}

export class UpdateSupplierProductCommand implements Command<SupplierProductRecord> {
  constructor(
    private readonly repository: SupplierProductRepository,
    private readonly id: string,
    private readonly payload: UpdateSupplierProductInput,
  ) {}

  async execute() {
    return this.repository.update(this.id, this.payload);
  }
}

export class DeleteSupplierProductCommand implements Command<{
  deleted: true;
}> {
  constructor(
    private readonly repository: SupplierProductRepository,
    private readonly id: string,
  ) {}

  async execute() {
    await this.repository.delete(this.id);
    return { deleted: true } as const;
  }
}

export class CreateInventoryStockCommand implements Command<InventoryStockRecord> {
  constructor(
    private readonly repository: InventoryRepository,
    private readonly payload: CreateInventoryStockInput,
  ) {}

  async execute() {
    return this.repository.create(this.payload);
  }
}

export class DeleteInventoryStockCommand implements Command<{ deleted: true }> {
  constructor(
    private readonly repository: InventoryRepository,
    private readonly id: string,
  ) {}

  async execute() {
    await this.repository.delete(this.id);
    return { deleted: true } as const;
  }
}

export class UpdateInventoryArchiveCommand implements Command<InventoryStockRecord> {
  constructor(
    private readonly repository: InventoryRepository,
    private readonly id: string,
    private readonly payload: UpdateInventoryArchiveInput,
  ) {}

  async execute() {
    return this.repository.setArchived(this.id, this.payload);
  }
}

export class ConfirmCheckoutCommand implements Command<CheckoutConfirmResult> {
  constructor(
    private readonly repository: CheckoutRepository,
    private readonly payload: CheckoutConfirmInput,
  ) {}

  async execute() {
    return this.repository.confirm(this.payload);
  }
}
