import { Suspense } from "react";
import PageLoading from "@/app/dashboard/components/page-loading";
import CheckoutContent from "./checkout-content";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}
