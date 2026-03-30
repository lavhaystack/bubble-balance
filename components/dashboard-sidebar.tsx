"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  {
    label: "Overview",
    href: "/dashboard/overview",
    icon: LayoutDashboard,
  },
  {
    label: "Inventory",
    href: "/dashboard/inventory",
    icon: Package,
  },
  {
    label: "Sales",
    href: "/dashboard/sales",
    icon: TrendingUp,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full bg-white md:w-64 md:shrink-0 md:border-r md:border-gray-200">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800">
            <Package className="h-5 w-5 text-white" />
          </div>
          <h2 className="font-semibold text-gray-900">Blubble Balance</h2>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-[#f5f3e8] text-gray-900"
                    : "text-gray-600 hover:bg-gray-50",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
