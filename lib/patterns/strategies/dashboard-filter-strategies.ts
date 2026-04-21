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
  expiration: string;
};

export type InventoryFilterCriteria = {
  search: string;
  categoryFilters: string[];
  statusFilters: string[];
  expirationSort: "none" | "asc" | "desc";
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
    if (criteria.categoryFilters.length === 0) {
      return items;
    }

    const selectedCategories = new Set(criteria.categoryFilters);

    return items.filter((product) => selectedCategories.has(product.category));
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
    if (criteria.statusFilters.length === 0) {
      return items;
    }

    const selectedStatuses = new Set(criteria.statusFilters);

    return items.filter((product) =>
      selectedStatuses.has(getStockStatusByQuantity(product.quantity)),
    );
  }
}

class InventoryExpirationStrategy implements FilterStrategy<
  InventoryFilterableProduct,
  InventoryFilterCriteria
> {
  apply(
    items: InventoryFilterableProduct[],
    criteria: InventoryFilterCriteria,
  ) {
    if (criteria.expirationSort === "none") {
      return items;
    }

    const direction = criteria.expirationSort === "asc" ? 1 : -1;

    return [...items].sort((a, b) => {
      const aExpiry = a.expiration
        ? new Date(a.expiration).getTime()
        : Number.MAX_SAFE_INTEGER;
      const bExpiry = b.expiration
        ? new Date(b.expiration).getTime()
        : Number.MAX_SAFE_INTEGER;

      return (aExpiry - bExpiry) * direction;
    });
  }
}

const checkoutStrategies: ReadonlyArray<
  FilterStrategy<InventoryStockRecord, CheckoutFilterCriteria>
> = [new CheckoutSearchStrategy(), new CheckoutCategoryStrategy()];

const inventoryStrategyFactories: ReadonlyArray<
  (
    criteria: InventoryFilterCriteria,
  ) => FilterStrategy<
    InventoryFilterableProduct,
    InventoryFilterCriteria
  > | null
> = [
  (criteria) => (criteria.search.trim() ? new InventorySearchStrategy() : null),
  (criteria) =>
    criteria.categoryFilters.length > 0
      ? new InventoryCategoryStrategy()
      : null,
  (criteria) =>
    criteria.statusFilters.length > 0 ? new InventoryStatusStrategy() : null,
  (criteria) =>
    criteria.expirationSort !== "none"
      ? new InventoryExpirationStrategy()
      : null,
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
  const dynamicStrategies = inventoryStrategyFactories
    .map((createStrategy) => createStrategy(criteria))
    .filter(
      (
        strategy,
      ): strategy is FilterStrategy<
        InventoryFilterableProduct,
        InventoryFilterCriteria
      > => Boolean(strategy),
    );

  const typedStrategies = dynamicStrategies as unknown as ReadonlyArray<
    FilterStrategy<T, InventoryFilterCriteria>
  >;

  return applyFilterStrategies(products, criteria, typedStrategies);
}
