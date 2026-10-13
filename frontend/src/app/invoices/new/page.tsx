import { Suspense } from "react";
import { InvoiceForm } from "@/components/InvoiceForm";

function Fallback() {
  return (
    <div className="h-64 animate-pulse rounded-lg border border-zinc-200 bg-white" />
  );
}

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nueva factura</h1>
        <p className="text-sm text-zinc-500">
          Completa los datos y calcula los totales automáticamente.
        </p>
      </div>
      <Suspense fallback={<Fallback />}>
        <InvoiceForm />
      </Suspense>
    </div>
  );
}
