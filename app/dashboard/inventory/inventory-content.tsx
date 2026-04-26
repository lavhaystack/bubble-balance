"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Archive, Package2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import InventoryTable from "./components/InventoryTable";
import AddProductModal from "./components/AddProductModal";
import { type Product } from "./components/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchInventoryStocks, fetchSuppliers } from "@/lib/dashboard-api";
import {
  createInventoryStockCommand,
  deleteInventoryStockCommand,
  setInventoryStockArchivedCommand,
} from "@/lib/dashboard-client-commands";
import type {
  InventoryStockRecord,
  SupplierRecord,
} from "@/lib/dashboard-types";
import { dashboardDataCache } from "@/lib/dashboard-data-cache";
import { filterInventoryProducts } from "@/lib/patterns/strategies/dashboard-filter-strategies";
import PaginationControls from "@/components/shared/pagination-controls";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PAGINATION_PAGE_SIZE, paginateItems } from "@/lib/pagination";

type InventoryTab = "active" | "archived";
type ExpirationSortDirection = "asc" | "desc";
const STATUS_OPTIONS = ["In Stock", "Low Stock", "Out of Stock"] as const;
const INVENTORY_ROUTE = "/dashboard/inventory";

export default function InventoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [expirationSort, setExpirationSort] =
    useState<ExpirationSortDirection>("asc");
  const [activeTab, setActiveTab] = useState<InventoryTab>("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteProduct, setPendingDeleteProduct] =
    useState<Product | null>(null);
  const [initialSupplierId, setInitialSupplierId] = useState("");
  const [initialSupplierProductId, setInitialSupplierProductId] = useState("");

  const toProduct = (record: InventoryStockRecord): Product => ({
    id: record.id,
    supplierProductId: record.supplierProductId,
    name: record.name,
    sku: record.sku,
    category: record.category,
    quantity: record.quantity,
    unit: record.unit,
    price: record.price,
    initialQuantity: record.initialQuantity,
    expiration: record.expiration,
    archivedAt: record.archivedAt,
    supplier: record.supplierName,
    batchId: record.batchId,
    reorderLevel: record.reorderLevel,
  });

  const loadData = useCallback(async (force = false) => {
    try {
      await Promise.all([
        dashboardDataCache.inventory.getOrLoad(
          () => fetchInventoryStocks({ includeArchived: true }),
          force,
        ),
        dashboardDataCache.suppliers.getOrLoad(() => fetchSuppliers(), force),
      ]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load inventory",
      );
    }
  }, []);

  useEffect(() => {
    const unsubscribeInventory = dashboardDataCache.inventory.subscribe(
      (snapshot) => {
        setLoadingInventory(snapshot.loading && snapshot.data === null);

        if (snapshot.data) {
          setProducts(snapshot.data.map(toProduct));
        }
      },
    );

    const unsubscribeSuppliers = dashboardDataCache.suppliers.subscribe(
      (snapshot) => {
        setLoadingSuppliers(snapshot.loading && snapshot.data === null);

        if (snapshot.data) {
          setSuppliers(snapshot.data);
        }
      },
    );

    void loadData();

    return () => {
      unsubscribeInventory();
      unsubscribeSuppliers();
    };
  }, [loadData]);

  useEffect(() => {
    const supplierId = searchParams.get("supplierId") ?? "";
    const supplierProductId = searchParams.get("supplierProductId") ?? "";

    if (supplierId && supplierProductId) {
      setInitialSupplierId(supplierId);
      setInitialSupplierProductId(supplierProductId);
      setShowModal(true);
    }
  }, [searchParams]);

  const clearModalPrefill = () => {
    setInitialSupplierId("");
    setInitialSupplierProductId("");

    if (
      searchParams.get("supplierId") ||
      searchParams.get("supplierProductId")
    ) {
      router.replace(INVENTORY_ROUTE);
    }
  };

  const closeAddProductModal = () => {
    setShowModal(false);
    clearModalPrefill();
  };

  const toggleListFilter = (
    currentValues: string[],
    value: string,
    setter: (values: string[]) => void,
  ) => {
    if (currentValues.includes(value)) {
      setter(currentValues.filter((entry) => entry !== value));
      return;
    }

    setter([...currentValues, value]);
  };

  const addProduct = async (payload: {
    supplierProductId: string;
    quantity: number;
    batchId: string;
    expiration?: string;
    reorderLevel: number;
  }) => {
    try {
      await createInventoryStockCommand(payload).execute();
      toast.success("Product has been saved");
      await loadData(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save inventory item",
      );
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteInventoryStockCommand(id).execute();
      toast.success("Product has been deleted");
      setPendingDeleteProduct(null);
      await loadData(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete inventory item",
      );
    }
  };

  const requestDeleteProduct = (id: string) => {
    const product = products.find((item) => item.id === id);
    if (!product) {
      return;
    }

    setPendingDeleteProduct(product);
  };

  const setProductArchived = async (id: string, archived: boolean) => {
    try {
      await setInventoryStockArchivedCommand(id, archived).execute();
      toast.success(archived ? "Product archived" : "Product restored");
      await loadData(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update archive status",
      );
    }
  };

  const quickCheckout = (inventoryId: string) => {
    const params = new URLSearchParams({ inventoryId });
    router.push(`/dashboard/checkout?${params.toString()}`);
  };

  const tabProducts = useMemo(
    () =>
      products.filter((product) =>
        activeTab === "archived"
          ? Boolean(product.archivedAt)
          : !product.archivedAt,
      ),
    [activeTab, products],
  );

  const filteredProducts = useMemo(
    () =>
      filterInventoryProducts(tabProducts, {
        search,
        categoryFilters,
        statusFilters,
        expirationSort,
      }),
    [tabProducts, search, categoryFilters, statusFilters, expirationSort],
  );

  const {
    items: paginatedProducts,
    totalPages,
    page: safePage,
  } = useMemo(
    () => paginateItems(filteredProducts, currentPage, PAGINATION_PAGE_SIZE),
    [filteredProducts, currentPage],
  );

  useEffect(() => {
    if (safePage !== currentPage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, safePage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilters, statusFilters, expirationSort, activeTab]);

  const categories = useMemo(
    () => [...new Set(tabProducts.map((p) => p.category))],
    [tabProducts],
  );

  const loading = loadingInventory || loadingSuppliers;

  const existingBatchIds = useMemo(
    () => products.map((product) => product.batchId),
    [products],
  );

  const activeCount = useMemo(
    () => products.filter((product) => !product.archivedAt).length,
    [products],
  );

  const archivedCount = useMemo(
    () => products.filter((product) => Boolean(product.archivedAt)).length,
    [products],
  );

  const clearCategoryFilters = () => setCategoryFilters([]);
  const clearStatusFilters = () => setStatusFilters([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Inventory Management
        </h1>
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Loading inventory..."
            : `${filteredProducts.length} of ${tabProducts.length} products`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={activeTab === "active" ? "default" : "outline"}
          className={
            activeTab === "active"
              ? "bg-emerald-700 text-white hover:bg-emerald-800"
              : ""
          }
          onClick={() => setActiveTab("active")}
        >
          <Package2 className="h-4 w-4" />
          Active ({activeCount})
        </Button>
        <Button
          type="button"
          variant={activeTab === "archived" ? "default" : "outline"}
          className={
            activeTab === "archived"
              ? "bg-slate-700 text-white hover:bg-slate-800"
              : ""
          }
          onClick={() => setActiveTab("archived")}
        >
          <Archive className="h-4 w-4" />
          Archive ({archivedCount})
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, SKU, or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[560px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-start">
                {categoryFilters.length > 0
                  ? `${categoryFilters.length} category selected`
                  : "All Categories"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Category Filters</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={categoryFilters.includes(category)}
                  onCheckedChange={() =>
                    toggleListFilter(
                      categoryFilters,
                      category,
                      setCategoryFilters,
                    )
                  }
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={clearCategoryFilters}
              >
                Clear filter
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-start">
                {statusFilters.length > 0
                  ? `${statusFilters.length} status selected`
                  : "All Status"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Status Filters</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {STATUS_OPTIONS.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilters.includes(status)}
                  onCheckedChange={() =>
                    toggleListFilter(statusFilters, status, setStatusFilters)
                  }
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={clearStatusFilters}
              >
                Clear filter
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setExpirationSort((current) => (current === "asc" ? "desc" : "asc"))
          }
        >
          <ArrowUpDown className="h-4 w-4" />
          Expiration {expirationSort === "asc" ? "Ascending" : "Descending"}
        </Button>

        <Button
          onClick={() => {
            setShowModal(true);
          }}
          className="bg-emerald-700 text-white hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <InventoryTable
        products={paginatedProducts}
        deleteProduct={requestDeleteProduct}
        setProductArchived={setProductArchived}
        quickCheckout={quickCheckout}
        isArchivedView={activeTab === "archived"}
        loading={loading}
      />

      <PaginationControls
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <AddProductModal
        open={showModal}
        onClose={closeAddProductModal}
        onAdd={addProduct}
        suppliers={suppliers}
        initialSupplierId={initialSupplierId || undefined}
        initialSupplierProductId={initialSupplierProductId || undefined}
        existingBatchIds={existingBatchIds}
      />

      <Dialog
        open={Boolean(pendingDeleteProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteProduct(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[430px]">
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this product?
            </DialogTitle>
            <DialogDescription>
              This will remove this product from the supplier&apos;s list. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setPendingDeleteProduct(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!pendingDeleteProduct) {
                  return;
                }

                void deleteProduct(pendingDeleteProduct.id);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
