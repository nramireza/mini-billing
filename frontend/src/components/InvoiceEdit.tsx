"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { InvoiceForm } from "@/components/InvoiceForm";
import type { Invoice } from "@/lib/types";

export function InvoiceEdit() {
  const params = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getInvoice(params.id)
      .then(setInvoice)
      .catch((err: Error) => setError(err.message));
  }, [params.id]);

  if (error) {
    return (
      <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
        {error}
      </p>
    );
  }

  if (!invoice) {
    return (
      <div className="h-64 animate-pulse rounded-lg border border-zinc-200 bg-white" />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Editar {invoice.number}</h1>
      <InvoiceForm initial={invoice} />
    </div>
  );
}
