import { Suspense } from "react";
import PageLoading from "@/components/dashboard/page-loading";
import SuppliersContent from "@/features/suppliers/components/suppliers-page-content";

export default function SuppliersPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SuppliersContent />
    </Suspense>
  );
}
