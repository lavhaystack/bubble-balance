import type {
  InventoryStockRecord,
  SupplierRecord,
} from "@/lib/dashboard-types";

const DEFAULT_CACHE_TTL_MS = 1000 * 60 * 5;

type CacheListener<TData> = (snapshot: CacheSnapshot<TData>) => void;

type CacheSnapshot<TData> = {
  data: TData | null;
  loading: boolean;
  error: string | null;
  loadedAt: number;
};

class ObservableResource<TData> {
  private listeners = new Set<CacheListener<TData>>();
  private snapshot: CacheSnapshot<TData> = {
    data: null,
    loading: false,
    error: null,
    loadedAt: 0,
  };
  private inFlightPromise: Promise<TData> | null = null;

  constructor(private readonly ttlMs = DEFAULT_CACHE_TTL_MS) {}

  subscribe(listener: CacheListener<TData>) {
    this.listeners.add(listener);
    listener(this.snapshot);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot() {
    return this.snapshot;
  }

  invalidate() {
    this.snapshot = {
      ...this.snapshot,
      loadedAt: 0,
    };
    this.notify();
  }

  setData(data: TData) {
    this.snapshot = {
      data,
      loading: false,
      error: null,
      loadedAt: Date.now(),
    };
    this.notify();
  }

  async getOrLoad(loader: () => Promise<TData>, force = false) {
    const hasFreshData =
      this.snapshot.data !== null &&
      Date.now() - this.snapshot.loadedAt < this.ttlMs;

    if (!force && hasFreshData) {
      return this.snapshot.data;
    }

    if (this.inFlightPromise) {
      return this.inFlightPromise;
    }

    this.snapshot = {
      ...this.snapshot,
      loading: true,
      error: null,
    };
    this.notify();

    this.inFlightPromise = loader()
      .then((data) => {
        this.snapshot = {
          data,
          loading: false,
          error: null,
          loadedAt: Date.now(),
        };
        this.notify();
        return data;
      })
      .catch((error) => {
        this.snapshot = {
          ...this.snapshot,
          loading: false,
          error: error instanceof Error ? error.message : "Request failed",
        };
        this.notify();
        throw error;
      })
      .finally(() => {
        this.inFlightPromise = null;
      });

    return this.inFlightPromise;
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.snapshot));
  }
}

export class DashboardDataCache {
  private static instance: DashboardDataCache | null = null;

  readonly inventory = new ObservableResource<InventoryStockRecord[]>();
  readonly suppliers = new ObservableResource<SupplierRecord[]>();

  static getInstance() {
    if (!DashboardDataCache.instance) {
      DashboardDataCache.instance = new DashboardDataCache();
    }

    return DashboardDataCache.instance;
  }
}

export const dashboardDataCache = DashboardDataCache.getInstance();
