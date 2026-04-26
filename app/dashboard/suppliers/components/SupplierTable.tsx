"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, MoreVertical, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import PaginationControls from "@/components/shared/pagination-controls";
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
import type { SupplierRecord } from "@/lib/dashboard-types";
import { PAGINATION_PAGE_SIZE, paginateItems } from "@/lib/pagination";

type SupplierTableProps = {
  rows: SupplierRecord[];
  expandedIds: Record<string, boolean>;
  onToggleExpanded: (supplierId: string) => void;
  onOpenAddProductModal: (supplierId: string) => void;
  onEditSupplier: (supplierId: string) => void;
  onRequestRemoveSupplier: (supplierId: string) => void;
  onEditSupplierProduct: (productId: string) => void;
  onAddProductToInventory: (supplierId: string, productId: string) => void;
  onRequestRemoveSupplierProduct: (
    supplierId: string,
    productId: string,
    productName: string,
  ) => void;
  loading?: boolean;
};

export default function SupplierTable({
  rows,
  expandedIds,
  onToggleExpanded,
  onOpenAddProductModal,
  onEditSupplier,
  onRequestRemoveSupplier,
  onEditSupplierProduct,
  onAddProductToInventory,
  onRequestRemoveSupplierProduct,
  loading = false,
}: SupplierTableProps) {
  const [productPages, setProductPages] = useState<Record<string, number>>({});

  const setProductPage = (supplierId: string, page: number) => {
    setProductPages((current) => ({
      ...current,
      [supplierId]: page,
    }));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
            <TableHead className="w-[30px]" />
            <TableHead>Supplier Name</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Products</TableHead>
            <TableHead className="w-[40px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-20 text-center text-muted-foreground"
              >
                {loading ? "Loading..." : "No suppliers match your filters."}
              </TableCell>
            </TableRow>
          )}
          {rows.map((supplier) => {
            const isExpanded = Boolean(expandedIds[supplier.id]);
            const productPagination = paginateItems(
              supplier.products,
              productPages[supplier.id] ?? 1,
              PAGINATION_PAGE_SIZE,
            );

            return (
              <Fragment key={supplier.id}>
                <TableRow>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onToggleExpanded(supplier.id)}
                      aria-label={
                        isExpanded ? "Collapse supplier" : "Expand supplier"
                      }
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {supplier.name}
                  </TableCell>
                  <TableCell>{supplier.contactPerson}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {supplier.products.length} product
                    {supplier.products.length === 1 ? "" : "s"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Row actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={() => onEditSupplier(supplier.id)}
                        >
                          Edit info
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => onRequestRemoveSupplier(supplier.id)}
                        >
                          Remove supplier
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>

                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-slate-50/70 py-4">
                      <p className="mb-3 text-sm font-semibold text-slate-900">
                        Products from this Supplier
                      </p>
                      {supplier.products.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No products listed yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {productPagination.items.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between rounded-md px-3 py-2 text-sm"
                            >
                              <div>
                                <p>{product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  SKU: {product.sku}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-medium">
                                  {formatPhpCurrency(product.price)}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      aria-label="Product actions"
                                    >
                                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-40"
                                  >
                                    <DropdownMenuItem
                                      onClick={() =>
                                        onAddProductToInventory(
                                          supplier.id,
                                          product.id,
                                        )
                                      }
                                    >
                                      Add to Inventory
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        onEditSupplierProduct(product.id)
                                      }
                                    >
                                      Edit product
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600 focus:text-red-600"
                                      onClick={() =>
                                        onRequestRemoveSupplierProduct(
                                          supplier.id,
                                          product.id,
                                          product.name,
                                        )
                                      }
                                    >
                                      Delete product
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}

                          <PaginationControls
                            currentPage={productPagination.page}
                            totalPages={productPagination.totalPages}
                            onPageChange={(page) =>
                              setProductPage(supplier.id, page)
                            }
                            className="pt-2"
                          />
                        </div>
                      )}

                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenAddProductModal(supplier.id)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Product to Supplier
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
