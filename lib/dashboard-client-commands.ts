import type {
  CheckoutLinePayload,
  CreateInventoryStockPayload,
  CreateSupplierPayload,
  CreateSupplierProductPayload,
} from "@/lib/dashboard-api";
import {
  confirmCheckout,
  createInventoryStock,
  createSupplier,
  createSupplierProduct,
  deleteInventoryStock,
  deleteSupplier,
  deleteSupplierProduct,
  setInventoryStockArchived,
  updateSupplier,
  updateSupplierProduct,
} from "@/lib/dashboard-api";
import type { Command } from "@/lib/patterns/commands/command";

class AsyncActionCommand<TResult> implements Command<TResult> {
  constructor(private readonly action: () => Promise<TResult>) {}

  async execute() {
    return this.action();
  }
}

export function createSupplierCommand(payload: CreateSupplierPayload) {
  return new AsyncActionCommand(() => createSupplier(payload));
}

export function updateSupplierCommand(
  id: string,
  payload: Partial<CreateSupplierPayload>,
) {
  return new AsyncActionCommand(() => updateSupplier(id, payload));
}

export function deleteSupplierCommand(id: string) {
  return new AsyncActionCommand(() => deleteSupplier(id));
}

export function createSupplierProductCommand(
  payload: CreateSupplierProductPayload,
) {
  return new AsyncActionCommand(() => createSupplierProduct(payload));
}

export function updateSupplierProductCommand(
  id: string,
  payload: Partial<CreateSupplierProductPayload>,
) {
  return new AsyncActionCommand(() => updateSupplierProduct(id, payload));
}

export function deleteSupplierProductCommand(id: string) {
  return new AsyncActionCommand(() => deleteSupplierProduct(id));
}

export function createInventoryStockCommand(
  payload: CreateInventoryStockPayload,
) {
  return new AsyncActionCommand(() => createInventoryStock(payload));
}

export function deleteInventoryStockCommand(id: string) {
  return new AsyncActionCommand(() => deleteInventoryStock(id));
}

export function setInventoryStockArchivedCommand(
  id: string,
  archived: boolean,
) {
  return new AsyncActionCommand(() => setInventoryStockArchived(id, archived));
}

export function confirmCheckoutCommand(items: CheckoutLinePayload[]) {
  return new AsyncActionCommand(() => confirmCheckout(items));
}
