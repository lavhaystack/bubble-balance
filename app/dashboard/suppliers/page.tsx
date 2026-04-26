import { Suspense } from "react";
import PageLoading from "@/app/dashboard/components/page-loading";
import SuppliersContent from "./suppliers-content";

export default function SuppliersPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SuppliersContent />
    </Suspense>
  );
}
