"use client";

import { useEffect, useState } from "react";
import { ArrowDown, MoreVertical, Plus, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchInventoryStocks, fetchDashboardStats } from "@/lib/dashboard-api";
import type { InventoryStockRecord, DashboardStats } from "@/lib/dashboard-types";
import { toast } from "sonner";

export default function OverviewPage() {
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryStockRecord[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryStockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [stocks, stats] = await Promise.all([
          fetchInventoryStocks(),
          fetchDashboardStats(),
        ]);
        
        const outOfStock = stocks.filter(item => item.quantity === 0 && !item.archivedAt);
        setOutOfStockItems(outOfStock);

        const lowStock = stocks.filter(item => 
          item.quantity > 0 && 
          item.quantity <= item.reorderLevel && 
          !item.archivedAt
        );
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
      value: `₱${(dashboardStats?.totalSales ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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
          <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500">Track and manage inventory, sales and transactions</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-emerald-700 text-white hover:bg-emerald-800">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : outOfStockItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">
                    No products out of stock
                  </td>
                </tr>
              ) : (
                outOfStockItems.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <span className="font-medium text-red-600">{item.name}</span>
                    </td>
                    <td className="py-4 font-mono text-xs text-gray-400">{item.sku}</td>
                    <td className="py-4">
                      <span className="inline-flex rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-orange-700">
                        Out of Stock
                      </span>
                    </td>
                    <td className="py-4 text-right text-gray-900">
                      ₱{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    <td className="py-4 font-mono text-xs text-gray-400">{product.sku}</td>
                    <td className="py-4 text-gray-900">{product.sold.toLocaleString()}</td>
                    <td className="py-4 text-gray-900">{product.stock.toLocaleString()}</td>
                    <td className="py-4 text-gray-900">
                      ₱{product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 text-gray-900">
                      ₱{product.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        product.status === "In Stock" 
                          ? "bg-green-50 text-green-700" 
                          : product.status === "Out of Stock"
                          ? "bg-red-50 text-red-700"
                          : "bg-orange-50 text-orange-700"
                      }`}>
                        {product.status}
                      </span>
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
                <th className="pb-4 font-medium">Reorder Level</th>
                <th className="pb-4 font-medium">Category</th>
                <th className="pb-4 font-medium">Supplier</th>
                <th className="pb-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : lowStockItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No low stock alerts
                  </td>
                </tr>
              ) : (
                lowStockItems.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </td>
                    <td className="py-4 font-mono text-xs text-gray-400">{item.sku}</td>
                    <td className="py-4 text-gray-900">{item.quantity} {item.unit}</td>
                    <td className="py-4 text-gray-900">{item.reorderLevel}</td>
                    <td className="py-4 text-gray-900">{item.category}</td>
                    <td className="py-4 text-gray-900">{item.supplierName}</td>
                    <td className="py-4">
                      <span className="inline-flex rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                        Low Stock
                      </span>
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
