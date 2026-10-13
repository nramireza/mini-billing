import { Suspense } from "react";
import type { Metadata } from "next";
import { InvoiceEdit } from "@/components/InvoiceEdit";

export const metadata: Metadata = {
  title: "Editar factura · Mini Billing",
};

function Fallback() {
  return (
    <div className="h-64 animate-pulse rounded-lg border border-zinc-200 bg-white" />
  );
}

export default function InvoiceEditPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <InvoiceEdit />
    </Suspense>
  );
}
