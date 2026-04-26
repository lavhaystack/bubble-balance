import { Suspense } from "react";
import PageLoading from "@/app/dashboard/components/page-loading";
import InventoryContent from "./inventory-content";

export default function InventoryPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <InventoryContent />
    </Suspense>
  );
}
