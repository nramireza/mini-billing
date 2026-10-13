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
  type Stats,
} from "@/lib/types";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getStats(), api.listInvoices({ per_page: 5 })])
      .then(([s, invoices]) => {
        setStats(s);
        setRecent(invoices.data);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Panel</h1>
          <p className="text-sm text-zinc-500">
            Resumen de facturación y últimas facturas emitidas.
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Nueva factura
        </Link>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border border-zinc-200 bg-white"
            />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Clientes" value={String(stats.customers)} />
          <StatCard label="Facturas" value={String(stats.invoices)} />
          <StatCard
            label="Total facturado"
            value={formatCurrency(stats.billed_total)}
          />
        </div>
      ) : null}

      {stats && (
        <div className="flex flex-wrap gap-2">
          {INVOICE_STATUSES.map((status) => (
            <span
              key={status}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm"
            >
              {STATUS_LABELS[status]}:{" "}
              <strong>{stats.by_status[status] ?? 0}</strong>
            </span>
          ))}
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Últimas facturas</h2>
          <Link href="/invoices" className="text-sm text-blue-600 hover:underline">
            Ver todas
          </Link>
        </div>

        {loading ? (
          <div className="h-40 animate-pulse rounded-lg border border-zinc-200 bg-white" />
        ) : recent.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
            Aún no hay facturas. Crea la primera.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-2">Número</th>
                  <th className="px-4 py-2">Cliente</th>
                  <th className="px-4 py-2">Emisión</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recent.map((invoice) => (
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
      </section>
    </div>
  );
}
