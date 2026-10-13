"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    api
      .listCustomers(query || undefined)
      .then((res) => {
        if (!ignore) setCustomers(res.data);
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
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-zinc-500">{customers.length} clientes</p>
        </div>
        <Link
          href="/customers/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Nuevo cliente
        </Link>
      </div>

      <input
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900"
        placeholder="Buscar por nombre, RUT o email…"
        value={query}
        onChange={(e) => {
          setLoading(true);
          setQuery(e.target.value);
        }}
      />

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <div className="h-64 animate-pulse rounded-lg border border-zinc-200 bg-white" />
      ) : customers.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
          No hay clientes.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">RUT</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2 text-right">Facturas</th>
                <th className="px-4 py-2">Alta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-2 font-medium">{customer.name}</td>
                  <td className="px-4 py-2 text-zinc-500">{customer.tax_id}</td>
                  <td className="px-4 py-2 text-zinc-500">
                    {customer.email ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {customer.invoices_count ?? 0}
                  </td>
                  <td className="px-4 py-2 text-zinc-500">
                    {formatDate(customer.created_at?.slice(0, 10))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
