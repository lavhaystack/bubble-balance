import ProductRow from "./ProductRow";
import type { Product } from "./types";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type InventoryTableProps = {
  products: Product[];
  deleteProduct: (id: string) => void;
  setProductArchived: (id: string, archived: boolean) => void;
  quickCheckout: (id: string) => void;
  isArchivedView: boolean;
  loading?: boolean;
};

export default function InventoryTable({
  products,
  deleteProduct,
  setProductArchived,
  quickCheckout,
  isArchivedView,
  loading = false,
}: InventoryTableProps) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Batch ID</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                deleteProduct={deleteProduct}
                setProductArchived={setProductArchived}
                quickCheckout={quickCheckout}
                isArchivedView={isArchivedView}
              />
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-20 text-center text-muted-foreground"
                >
                  {loading ? "Loading..." : "No products match your filters."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
