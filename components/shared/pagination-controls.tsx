"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildPaginationItems, clampPage } from "@/lib/pagination";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const safePage = clampPage(currentPage, totalPages);
  const items = buildPaginationItems(safePage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-between gap-2", className)}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={safePage <= 1}
        onClick={() => onPageChange(safePage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="flex flex-wrap items-center justify-center gap-1">
        {items.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-sm text-slate-500"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const isActive = item === safePage;
          return (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={isActive ? "default" : "outline"}
              className={cn("min-w-8 px-2", isActive && "pointer-events-none")}
              onClick={() => onPageChange(item)}
              aria-current={isActive ? "page" : undefined}
            >
              {item}
            </Button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={safePage >= totalPages}
        onClick={() => onPageChange(safePage + 1)}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
