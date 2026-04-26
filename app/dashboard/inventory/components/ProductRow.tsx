import {
  Archive,
  CalendarDays,
  MoreVertical,
  ShoppingCart,
  Trash2,
  Undo2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatPhpCurrency } from "@/lib/currency";

import { getStockStatus, type Product } from "./types";

type ProductRowProps = {
  product: Product;
  deleteProduct: (id: string) => void;
  setProductArchived: (id: string, archived: boolean) => void;
  quickCheckout: (id: string) => void;
  isArchivedView: boolean;
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("en-US");
};

const isExpiringSoon = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const now = new Date();
  const threshold = new Date();
  threshold.setDate(now.getDate() + 150);
  return parsed <= threshold;
};

const statusStyles: Record<string, string> = {
  "In Stock":
    "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  "Low Stock": "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200",
  "Out of Stock":
    "border-transparent bg-rose-100 text-rose-700 hover:bg-rose-200",
};

export default function ProductRow({
  product,
  deleteProduct,
  setProductArchived,
  quickCheckout,
  isArchivedView,
}: ProductRowProps) {
  const status = getStockStatus(product);
  const expirationSoon = isExpiringSoon(product.expiration);
  const canArchive = status === "Out of Stock";

  return (
    <TableRow>
      <TableCell className="w-[320px]">
        <p className="font-semibold text-slate-900">{product.name}</p>
        <p className="text-sm text-muted-foreground">{product.supplier}</p>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-mono">
          {product.sku}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-mono">
          {product.batchId}
        </Badge>
      </TableCell>
      <TableCell>{product.category}</TableCell>
      <TableCell>
        {product.quantity}/{product.initialQuantity} {product.unit}
      </TableCell>
      <TableCell>{formatPhpCurrency(product.price)}</TableCell>
      <TableCell>
        <Badge className={statusStyles[status]}>{status}</Badge>
      </TableCell>
      <TableCell>
        <span
          className={
            expirationSoon
              ? "inline-flex items-center gap-1 text-rose-600"
              : "text-slate-700"
          }
        >
          {expirationSoon && <CalendarDays className="h-3.5 w-3.5" />}
          {formatDate(product.expiration)}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open actions">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              disabled={product.quantity <= 0 || isArchivedView}
              onClick={() => quickCheckout(product.id)}
            >
              <ShoppingCart className="h-4 w-4" />
              Quick checkout
            </DropdownMenuItem>
            {isArchivedView ? (
              <DropdownMenuItem
                onClick={() => setProductArchived(product.id, false)}
              >
                <Undo2 className="h-4 w-4" />
                Unarchive
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled={!canArchive}
                onClick={() => setProductArchived(product.id, true)}
              >
                <Archive className="h-4 w-4" />
                Archive
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => deleteProduct(product.id)}
            >
              <Trash2 className="h-4 w-4" />
              Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
