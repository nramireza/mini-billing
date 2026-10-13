"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import {
  INVOICE_STATUSES,
  STATUS_LABELS,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/types";

export function InvoiceDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .getInvoice(params.id)
      .then(setInvoice)
      .catch((err: Error) => setError(err.message));
  }, [params.id]);

  async function changeStatus(status: InvoiceStatus) {
    if (!invoice) return;
    setBusy(true);
    try {
      const updated = await api.updateInvoiceStatus(invoice.id, status);
      setInvoice(updated);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!invoice) return;
    if (!window.confirm(`¿Eliminar la factura ${invoice.number}?`)) return;
    setBusy(true);
    try {
      await api.deleteInvoice(invoice.id);
      router.push("/invoices");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{invoice.number}</h1>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-sm text-zinc-500">
            Emitida el {formatDate(invoice.issue_date)} · vence{" "}
            {formatDate(invoice.due_date)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/invoices/${invoice.id}/edit`}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100"
          >
            Editar
          </Link>
          <button
            onClick={remove}
            disabled={busy}
            className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Cliente</p>
          <p className="mt-1 font-medium">{invoice.customer?.name ?? "—"}</p>
          <p className="text-sm text-zinc-500">{invoice.customer?.tax_id}</p>
          {invoice.customer?.email && (
            <p className="text-sm text-zinc-500">{invoice.customer.email}</p>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Estado</p>
          <select
            className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            value={invoice.status}
            disabled={busy}
            onChange={(e) => changeStatus(e.target.value as InvoiceStatus)}
          >
            {INVOICE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2 text-right">Cantidad</th>
              <th className="px-4 py-2 text-right">Precio unitario</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {invoice.items?.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2">{item.description}</td>
                <td className="px-4 py-2 text-right">{item.quantity}</td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(item.line_total ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto max-w-xs space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">Subtotal</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">IVA ({invoice.tax_rate}%)</span>
          <span>{formatCurrency(invoice.tax)}</span>
        </div>
        <div className="flex justify-between border-t border-zinc-200 pt-1 text-base font-semibold">
          <span>Total</span>
          <span>{formatCurrency(invoice.total)}</span>
        </div>
      </div>

      {invoice.notes && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Notas</p>
          <p className="mt-1 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}
