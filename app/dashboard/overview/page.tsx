import { Suspense } from "react";
import PageLoading from "@/components/dashboard/page-loading";
import OverviewContent from "@/features/overview/components/overview-page-content";

export default function OverviewPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <OverviewContent />
    </Suspense>
  );
}
