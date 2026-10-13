import { Suspense } from "react";
import type { Metadata } from "next";
import { InvoiceDetail } from "@/components/InvoiceDetail";

export const metadata: Metadata = {
  title: "Detalle de factura · Mini Billing",
};

function Fallback() {
  return (
    <div className="h-64 animate-pulse rounded-lg border border-zinc-200 bg-white" />
  );
}

export default function InvoiceDetailPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <InvoiceDetail />
    </Suspense>
  );
}
