import { Suspense } from "react";
import PageLoading from "@/components/dashboard/page-loading";
import InventoryContent from "@/features/inventory/components/inventory-page-content";

export default function InventoryPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <InventoryContent />
    </Suspense>
  );
}
