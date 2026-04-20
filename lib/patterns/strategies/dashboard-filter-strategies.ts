import { getStockStatusByQuantity } from "@/lib/dashboard-stock";
import type { InventoryStockRecord } from "@/lib/dashboard-types";
import {
  applyFilterStrategies,
  type FilterStrategy,
} from "@/lib/patterns/strategies/filter-strategy";

export type CheckoutFilterCriteria = {
  search: string;
  categoryFilter: string;
  allCategoryLabel: string;
};

export type InventoryFilterableProduct = {
  name: string;
  sku: string;
  supplier: string;
  batchId: string;
  category: string;
  quantity: number;
};

export type InventoryFilterCriteria = {
  search: string;
  categoryFilter: string;
  statusFilter: string;
  allCategoryLabel: string;
  allStatusLabel: string;
};

class CheckoutSearchStrategy implements FilterStrategy<
  InventoryStockRecord,
  CheckoutFilterCriteria
> {
  apply(items: InventoryStockRecord[], criteria: CheckoutFilterCriteria) {
    const normalizedSearch = criteria.search.trim().toLowerCase();
    if (!normalizedSearch) {
      return items;
    }

    return items.filter((product) =>
      [product.name, product.sku, product.supplierName, product.batchId]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }
}

class CheckoutCategoryStrategy implements FilterStrategy<
  InventoryStockRecord,
  CheckoutFilterCriteria
> {
  apply(items: InventoryStockRecord[], criteria: CheckoutFilterCriteria) {
    if (criteria.categoryFilter === criteria.allCategoryLabel) {
      return items;
    }

    return items.filter(
      (product) => product.category === criteria.categoryFilter,
    );
  }
}

class InventorySearchStrategy implements FilterStrategy<
  InventoryFilterableProduct,
  InventoryFilterCriteria
> {
  apply(
    items: InventoryFilterableProduct[],
    criteria: InventoryFilterCriteria,
  ) {
    const normalizedSearch = criteria.search.trim().toLowerCase();
    if (!normalizedSearch) {
      return items;
    }

    return items.filter((product) =>
      [product.name, product.sku, product.supplier, product.batchId]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }
}

class InventoryCategoryStrategy implements FilterStrategy<
  InventoryFilterableProduct,
  InventoryFilterCriteria
> {
  apply(
    items: InventoryFilterableProduct[],
    criteria: InventoryFilterCriteria,
  ) {
    if (criteria.categoryFilter === criteria.allCategoryLabel) {
      return items;
    }

    return items.filter(
      (product) => product.category === criteria.categoryFilter,
    );
  }
}

class InventoryStatusStrategy implements FilterStrategy<
  InventoryFilterableProduct,
  InventoryFilterCriteria
> {
  apply(
    items: InventoryFilterableProduct[],
    criteria: InventoryFilterCriteria,
  ) {
    if (criteria.statusFilter === criteria.allStatusLabel) {
      return items;
    }

    return items.filter(
      (product) =>
        getStockStatusByQuantity(product.quantity) === criteria.statusFilter,
    );
  }
}

const checkoutStrategies: ReadonlyArray<
  FilterStrategy<InventoryStockRecord, CheckoutFilterCriteria>
> = [new CheckoutSearchStrategy(), new CheckoutCategoryStrategy()];

const inventoryStrategies: ReadonlyArray<
  FilterStrategy<InventoryFilterableProduct, InventoryFilterCriteria>
> = [
  new InventorySearchStrategy(),
  new InventoryCategoryStrategy(),
  new InventoryStatusStrategy(),
];

export function filterCheckoutProducts(
  products: InventoryStockRecord[],
  criteria: CheckoutFilterCriteria,
) {
  return applyFilterStrategies(products, criteria, checkoutStrategies);
}

export function filterInventoryProducts<T extends InventoryFilterableProduct>(
  products: T[],
  criteria: InventoryFilterCriteria,
) {
  const typedStrategies = inventoryStrategies as ReadonlyArray<
    FilterStrategy<T, InventoryFilterCriteria>
  >;

  return applyFilterStrategies(products, criteria, typedStrategies);
}
