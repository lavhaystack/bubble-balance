import { CalendarDays, MoreVertical, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";

import { getStockStatus, type Product } from "./types";

type ProductRowProps = {
  product: Product;
  deleteProduct: (sku: string) => void;
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
  threshold.setDate(now.getDate() + 120);
  return parsed <= threshold;
};

const statusStyles: Record<string, string> = {
  "In Stock": "border-transparent bg-slate-100 text-slate-800",
  "Low Stock": "border-transparent bg-slate-900 text-slate-50",
  "Out of Stock": "border-transparent bg-rose-100 text-rose-700",
};

export default function ProductRow({
  product,
  deleteProduct,
}: ProductRowProps) {
  const status = getStockStatus(product);
  const expirationSoon = isExpiringSoon(product.expiration);

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
      <TableCell>{product.category}</TableCell>
      <TableCell>
        {product.quantity} {product.unit}
      </TableCell>
      <TableCell>${product.price.toFixed(2)}</TableCell>
      <TableCell>
        <Badge className={statusStyles[status]}>{status}</Badge>
      </TableCell>
      <TableCell>
        <span
          className={expirationSoon ? "inline-flex items-center gap-1 text-rose-600" : "text-slate-700"}
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
              className="text-red-600 focus:text-red-600"
              onClick={() => deleteProduct(product.sku)}
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