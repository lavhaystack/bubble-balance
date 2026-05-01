"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, MoreVertical, Plus, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchInventoryStocks, fetchDashboardStats } from "@/lib/dashboard-api";
import type { InventoryStockRecord, DashboardStats } from "@/lib/dashboard-types";
import { toast } from "sonner";
import { formatPhpCurrency } from "@/lib/currency";
import { getStockStatusByQuantity } from "@/lib/dashboard-stock";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusStyles: Record<string, string> = {
  "In Stock": "border-transparent bg-green-100 text-green-700 hover:bg-green-200",
  "Low Stock": "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200",
  "Out of Stock": "border-transparent bg-red-100 text-red-700 hover:bg-red-200",
};

export default function OverviewPage() {
  const router = useRouter();
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryStockRecord[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryStockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [stocks, stats] = await Promise.all([
          fetchInventoryStocks(),
          fetchDashboardStats(),
        ]);
        
        const activeStocks = stocks.filter(item => !item.archivedAt);
        
        // Group by SKU to determine true stock levels
        const stocksBySku = activeStocks.reduce((acc, item) => {
          if (!acc[item.sku]) {
            acc[item.sku] = {
              totalQuantity: 0,
              representativeItem: item,
            };
          }
          acc[item.sku].totalQuantity += item.quantity;
          return acc;
        }, {} as Record<string, { totalQuantity: number, representativeItem: InventoryStockRecord }>);

        const skuGroups = Object.values(stocksBySku);

        const outOfStock = skuGroups
          .filter(group => getStockStatusByQuantity(group.totalQuantity) === "Out of Stock")
          .map(group => ({
            ...group.representativeItem,
            quantity: 0
          }));
        setOutOfStockItems(outOfStock);

        const lowStock = skuGroups
          .filter(group => getStockStatusByQuantity(group.totalQuantity) === "Low Stock")
          .map(group => ({
            ...group.representativeItem,
            quantity: group.totalQuantity
          }));
        setLowStockItems(lowStock);

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

  const stats = [
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
      value: (dashboardStats?.unitsSold ?? 0).toLocaleString(),
      trend: null,
      trendType: null,
    },
    {
      label: "Out of stock",
      value: outOfStockItems.length.toString(),
      trend: null,
      trendType: null,
    },
  ];


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Overview</h1>
          <p className="text-sm text-muted-foreground">Track and manage inventory, sales and transactions</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => router.push("/dashboard/inventory?add=true")}
            className="bg-emerald-700 text-white hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add product
          </Button>
          <Button variant="outline">
            Inventory transfer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`mt-2 text-3xl font-bold ${stat.label === "Out of Stock" ? "text-red-600" : "text-gray-900"}`}>
              {stat.value}
            </p>
            {stat.trend && (
              <p className="mt-2 flex items-center gap-1 text-sm text-red-500">
                <ArrowDown className="h-4 w-4" />
                {stat.trend}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Out of stock */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900">Out of stock</h2>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead>
              <tr className="border-b border-gray-50 pb-4 text-xs uppercase tracking-wider text-gray-700">
                <th className="pb-4 font-medium">Product name</th>
                <th className="pb-4 font-medium">SKU</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 text-right font-medium">Price</th>
                <th className="pb-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : outOfStockItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No products out of stock
                  </td>
                </tr>
              ) : (
                outOfStockItems.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <span className="font-medium text-red-600">{item.name}</span>
                    </td>
                    <td className="py-4 font-mono text-xs text-gray-700">{item.sku}</td>
                    <td className="py-4">
                      <Badge className={statusStyles["Out of Stock"]}>
                        Out of Stock
                      </Badge>
                    </td>
                    <td className="py-4 text-right text-gray-900">
                      {mounted ? formatPhpCurrency(item.price) : `₱${item.price.toFixed(2)}`}
                    </td>
                    <td className="py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => router.push(`/dashboard/inventory?supplierId=${item.supplierId}&supplierProductId=${item.supplierProductId}`)}
                            className="cursor-pointer"
                          >
                            Restock
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top selling products */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900">Top selling products</h2>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead>
              <tr className="border-b border-gray-50 pb-4 text-xs uppercase tracking-wider text-gray-700">
                <th className="pb-4 font-medium">Product name</th>
                <th className="pb-4 font-medium">SKU</th>
                <th className="pb-4 font-medium">Item sold</th>
                <th className="pb-4 font-medium">In Stock</th>
                <th className="pb-4 font-medium">Unit price</th>
                <th className="pb-4 font-medium">Total value</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : !dashboardStats?.topProducts || dashboardStats.topProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No sales data available
                  </td>
                </tr>
              ) : (
                dashboardStats.topProducts.map((product) => (
                  <tr key={product.sku} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-[#fdf8e6] flex items-center justify-center">
                          <Plus className="h-5 w-5 text-[#e6b12d]" />
                        </div>
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-xs text-gray-700">{product.sku}</td>
                    <td className="py-4 text-gray-900">{product.sold.toLocaleString()}</td>
                    <td className="py-4 text-gray-900">{product.stock.toLocaleString()}</td>
                    <td className="py-4 text-gray-900">
                      {mounted ? formatPhpCurrency(product.price) : `₱${product.price.toFixed(2)}`}
                    </td>
                    <td className="py-4 text-gray-900">
                      {mounted ? formatPhpCurrency(product.totalValue) : `₱${product.totalValue.toFixed(2)}`}
                    </td>
                    <td className="py-4">
                      <Badge className={statusStyles[product.status]}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Low Stock Alert */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Low Stock Alert
          </h2>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead>
              <tr className="border-b border-gray-50 pb-4 text-xs uppercase tracking-wider text-gray-700">
                <th className="pb-4 font-medium">Product name</th>
                <th className="pb-4 font-medium">SKU</th>
                <th className="pb-4 font-medium">Current Stock</th>
                <th className="pb-4 font-medium">Category</th>
                <th className="pb-4 font-medium">Supplier</th>
                <th className="pb-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : lowStockItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No low stock alerts
                  </td>
                </tr>
              ) : (
                lowStockItems.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </td>
                    <td className="py-4 font-mono text-xs text-gray-700">{item.sku}</td>
                    <td className="py-4 text-gray-900">{item.quantity} {item.unit}</td>
                    <td className="py-4 text-gray-900">{item.category}</td>
                    <td className="py-4 text-gray-900">{item.supplierName}</td>
                    <td className="py-4">
                      <Badge className={statusStyles["Low Stock"]}>
                        Low Stock
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
