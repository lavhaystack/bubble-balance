"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  MoreVertical,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddProductButton } from "@/components/dashboard/add-product-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPhpCurrency } from "@/lib/currency";
import { fetchDashboardStats, fetchInventoryStocks } from "@/lib/dashboard-api";
import { getStockStatusByQuantity } from "@/lib/dashboard-stock";
import type {
  DashboardStats,
  InventoryStockRecord,
} from "@/lib/dashboard-types";

const statusStyles: Record<string, string> = {
  "In Stock": "border-transparent bg-green-100 text-green-700 hover:bg-green-200",
  "Low Stock": "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200",
  "Out of Stock": "border-transparent bg-red-100 text-red-700 hover:bg-red-200",
};

export default function OverviewPage() {
  const router = useRouter();
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryStockRecord[]>(
    [],
  );
  const [totalOutOfStock, setTotalOutOfStock] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<InventoryStockRecord[]>(
    [],
  );
  const [totalLowStock, setTotalLowStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [stocks, stats] = await Promise.all([
          fetchInventoryStocks({ includeArchived: true }),
          fetchDashboardStats(),
        ]);

        const activeStocks = stocks;

        // Group by SKU to determine true stock levels
        const stocksBySku = activeStocks.reduce(
          (acc, item) => {
            if (!acc[item.sku]) {
              acc[item.sku] = {
                totalQuantity: 0,
                representativeItem: item,
              };
            }
            acc[item.sku].totalQuantity += item.quantity;
            return acc;
          },
          {} as Record<
            string,
            { totalQuantity: number; representativeItem: InventoryStockRecord }
          >,
        );

        const skuGroups = Object.values(stocksBySku);

        const allOutOfStock = skuGroups
          .filter(
            (group) =>
              getStockStatusByQuantity(group.totalQuantity) === "Out of Stock",
          )
          .map((group) => ({
            ...group.representativeItem,
            quantity: 0,
          }))
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        setTotalOutOfStock(allOutOfStock.length);
        setOutOfStockItems(allOutOfStock.slice(0, 5));

        const allLowStock = skuGroups
          .filter(
            (group) =>
              getStockStatusByQuantity(group.totalQuantity) === "Low Stock",
          )
          .map((group) => ({
            ...group.representativeItem,
            quantity: group.totalQuantity,
          }))
          .sort((a, b) => a.quantity - b.quantity);

        setTotalLowStock(allLowStock.length);
        setLowStockItems(allLowStock.slice(0, 5));

        setDashboardStats(stats);
      } catch (error) {
        toast.error("Failed to load dashboard data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Total sales",
        value: mounted
          ? formatPhpCurrency(dashboardStats?.totalSales ?? 0)
          : "₱0.00",
        trend: null,
        trendType: null,
      },
      {
        label: "Units sold",
        value: mounted
          ? (dashboardStats?.unitsSold ?? 0).toLocaleString()
          : String(dashboardStats?.unitsSold ?? 0),
        trend: null,
        trendType: null,
      },
      {
        label: "Active stock",
        value: mounted
          ? (dashboardStats?.totalInventoryItems ?? 0).toLocaleString()
          : String(dashboardStats?.totalInventoryItems ?? 0),
        trend: null,
        trendType: null,
      },
      {
        label: "Low stock alert",
        value: mounted ? lowStockItems.length.toLocaleString() : "0",
        trend: null,
        trendType: "warning",
      },
    ],
    [mounted, dashboardStats, lowStockItems.length],
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Overview
          </h1>
          <AddProductButton />

        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <div className="mt-2 flex items-baseline justify-between">
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </section>

      {/* Out of stock */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Out of stock</h2>
            {totalOutOfStock > 5 && (
              <p className="text-sm text-gray-500">
                (showing 5 out of {totalOutOfStock} out of stock products)
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => router.push("/dashboard/inventory?status=Out of Stock")}
          >
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-50 text-xs uppercase tracking-wider text-gray-700 hover:bg-transparent">
              <TableHead className="pb-4 min-w-[200px] font-medium">
                Product name
              </TableHead>
              <TableHead className="pb-4 min-w-[100px] font-medium">
                SKU
              </TableHead>
              <TableHead className="pb-4 min-w-[120px] font-medium">
                Category
              </TableHead>
              <TableHead className="pb-4 min-w-[150px] font-medium">
                Supplier
              </TableHead>
              <TableHead className="pb-4 min-w-[100px] font-medium">
                Status
              </TableHead>
              <TableHead className="pb-4 min-w-[80px] text-right font-medium">
                Price
              </TableHead>
              <TableHead className="pb-4 w-10 text-right">&nbsp;</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-50">
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-gray-400"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : outOfStockItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-gray-400"
                >
                  No products out of stock
                </TableCell>
              </TableRow>
            ) : (
              outOfStockItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="group transition-colors hover:bg-gray-50"
                >
                  <TableCell className="py-4 font-medium text-red-600">
                    {item.name}
                  </TableCell>
                  <TableCell className="py-4 font-mono text-xs text-gray-700">
                    {item.sku}
                  </TableCell>
                  <TableCell className="py-4 text-gray-900">
                    {item.category}
                  </TableCell>
                  <TableCell className="py-4 text-gray-900">
                    {item.supplierName}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge className={statusStyles["Out of Stock"]}>
                      Out of Stock
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-right text-gray-900">
                    {mounted
                      ? formatPhpCurrency(item.price)
                      : `₱${item.price.toFixed(2)}`}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/dashboard/inventory?supplierId=${item.supplierId}&supplierProductId=${item.supplierProductId}`,
                            )
                          }
                          className="cursor-pointer"
                        >
                          Restock
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      {/* Top selling products */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Top selling products</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-50 text-xs uppercase tracking-wider text-gray-700 hover:bg-transparent">
              <TableHead className="pb-4 min-w-[200px] font-medium">
                Product name
              </TableHead>
              <TableHead className="pb-4 min-w-[100px] font-medium">
                SKU
              </TableHead>
              <TableHead className="pb-4 min-w-[100px] font-medium">
                Item sold
              </TableHead>
              <TableHead className="pb-4 min-w-[100px] font-medium">
                In Stock
              </TableHead>
              <TableHead className="pb-4 min-w-[120px] font-medium">
                Unit price
              </TableHead>
              <TableHead className="pb-4 min-w-[120px] font-medium">
                Total value
              </TableHead>
              <TableHead className="pb-4 min-w-[100px] font-medium">
                Status
              </TableHead>
              <TableHead className="pb-4 w-10 text-right">&nbsp;</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-50">
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-gray-400"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : !dashboardStats?.topProducts ||
              dashboardStats.topProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-gray-400"
                >
                  No sales data available
                </TableCell>
              </TableRow>
            ) : (
              dashboardStats.topProducts.map((product) => (
                <TableRow
                  key={product.sku}
                  className="group transition-colors hover:bg-gray-50"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fdf8e6]">
                        <Plus className="h-5 w-5 text-[#e6b12d]" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {product.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 font-mono text-xs text-gray-700">
                    {product.sku}
                  </TableCell>
                  <TableCell className="py-4 text-gray-900">
                    {mounted ? product.sold.toLocaleString() : "0"}
                  </TableCell>
                  <TableCell className="py-4 text-gray-900">
                    {mounted ? product.stock.toLocaleString() : "0"}
                  </TableCell>
                  <TableCell className="py-4 text-gray-900">
                    {mounted
                      ? formatPhpCurrency(product.price)
                      : `₱${product.price.toFixed(2)}`}
                  </TableCell>
                  <TableCell className="py-4 text-gray-900">
                    {mounted
                      ? formatPhpCurrency(product.totalValue)
                      : `₱${product.totalValue.toFixed(2)}`}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge className={statusStyles[product.status]}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/dashboard/inventory?supplierId=${product.supplierId}&supplierProductId=${product.supplierProductId}`,
                            )
                          }
                          className="cursor-pointer"
                        >
                          Restock
                        </DropdownMenuItem>
                        {product.inventoryId && (
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/checkout?inventoryId=${product.inventoryId}`,
                              )
                            }
                            className="cursor-pointer"
                          >
                            Quick Checkout
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      {/* Low Stock Alert */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Low Stock Alert
            </h2>
            {totalLowStock > 5 && (
              <p className="text-sm text-gray-500">
                (showing 5 out of {totalLowStock} low stock products)
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => router.push("/dashboard/inventory?status=Low Stock")}
          >
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-50 text-xs uppercase tracking-wider text-gray-700 hover:bg-transparent">
              <TableHead className="pb-4 min-w-[200px] font-medium">
                Product name
              </TableHead>
              <TableHead className="pb-4 min-w-[100px] font-medium">
                SKU
              </TableHead>
              <TableHead className="pb-4 min-w-[120px] font-medium">
                Current Stock
              </TableHead>
              <TableHead className="pb-4 min-w-[120px] font-medium">
                Category
              </TableHead>
              <TableHead className="pb-4 min-w-[150px] font-medium">
                Supplier
              </TableHead>
              <TableHead className="pb-4 min-w-[100px] font-medium">
                Status
              </TableHead>
              <TableHead className="pb-4 w-10 text-right">&nbsp;</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-50">
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-gray-400"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : lowStockItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-gray-400"
                >
                  No low stock alerts
                </TableCell>
              </TableRow>
            ) : (
              lowStockItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="group transition-colors hover:bg-gray-50"
                >
                  <TableCell className="py-4">
                    <span className="font-medium text-gray-900">
                      {item.name}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 font-mono text-xs text-gray-700">
                    {item.sku}
                  </TableCell>
                  <TableCell className="py-4 text-gray-900">
                    {mounted
                      ? `${item.quantity.toLocaleString()} ${item.unit}`
                      : `${item.quantity} ${item.unit}`}
                  </TableCell>
                  <TableCell className="py-4 text-gray-900">
                    {item.category}
                  </TableCell>
                  <TableCell className="py-4 text-gray-900">
                    {item.supplierName}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge className={statusStyles["Low Stock"]}>
                      Low Stock
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/dashboard/inventory?supplierId=${item.supplierId}&supplierProductId=${item.supplierProductId}`,
                            )
                          }
                          className="cursor-pointer"
                        >
                          Restock
                        </DropdownMenuItem>
                        {item.quantity > 0 && (
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/checkout?inventoryId=${item.id}`,
                              )
                            }
                            className="cursor-pointer"
                          >
                            Quick Checkout
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
