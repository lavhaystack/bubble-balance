import { Suspense } from "react";
import PageLoading from "@/components/dashboard/page-loading";
import CheckoutContent from "@/features/checkout/components/checkout-page-content";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}
