"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import {
  INVOICE_STATUSES,
  STATUS_LABELS,
  type Invoice,
  type Paginated,
} from "@/lib/types";

export default function InvoicesPage() {
  const [result, setResult] = useState<Paginated<Invoice> | null>(null);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    api
      .listInvoices({ status: status || undefined, q: query || undefined, page })
      .then((res) => {
        if (!ignore) setResult(res);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [status, query, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Facturas</h1>
          <p className="text-sm text-zinc-500">
            {result ? `${result.meta.total} facturas` : "Cargando…"}
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Nueva factura
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
          placeholder="Buscar por número o cliente…"
          value={query}
          onChange={(e) => {
            setLoading(true);
            setPage(1);
            setQuery(e.target.value);
          }}
        />
        <select
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          value={status}
          onChange={(e) => {
            setLoading(true);
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">Todos los estados</option>
          {INVOICE_STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <div className="h-64 animate-pulse rounded-lg border border-zinc-200 bg-white" />
      ) : !result || result.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
          No hay facturas que coincidan.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-2">Número</th>
                <th className="px-4 py-2">Cliente</th>
                <th className="px-4 py-2">Emisión</th>
                <th className="px-4 py-2">Vence</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {result.data.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-2 font-medium">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {invoice.number}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{invoice.customer?.name ?? "—"}</td>
                  <td className="px-4 py-2">{formatDate(invoice.issue_date)}</td>
                  <td className="px-4 py-2">{formatDate(invoice.due_date)}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(invoice.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result && result.meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button
            onClick={() => {
              setLoading(true);
              setPage((p) => Math.max(1, p - 1));
            }}
            disabled={page <= 1}
            className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-100 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-zinc-500">
            Página {result.meta.current_page} de {result.meta.last_page}
          </span>
          <button
            onClick={() => {
              setLoading(true);
              setPage((p) => Math.min(result.meta.last_page, p + 1));
            }}
            disabled={page >= result.meta.last_page}
            className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-100 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
