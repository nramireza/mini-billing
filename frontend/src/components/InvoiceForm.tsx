"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import {
  INVOICE_STATUSES,
  STATUS_LABELS,
  type Customer,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/types";

interface ItemRow {
  description: string;
  quantity: number;
  unit_price: number;
}

interface Props {
  initial?: Invoice;
}

export function InvoiceForm({ initial }: Props) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<string>(
    initial?.customer ? String(initial.customer.id) : "",
  );
  const [issueDate, setIssueDate] = useState(
    initial?.issue_date ?? new Date().toISOString().slice(0, 10),
  );
  const [dueDate, setDueDate] = useState(initial?.due_date ?? "");
  const [status, setStatus] = useState<InvoiceStatus>(
    initial?.status ?? "draft",
  );
  const [taxRate, setTaxRate] = useState<number>(initial?.tax_rate ?? 19);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [items, setItems] = useState<ItemRow[]>(
    initial?.items?.length
      ? initial.items.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price),
        }))
      : [{ description: "", quantity: 1, unit_price: 0 }],
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .listCustomers()
      .then((res) => setCustomers(res.data))
      .catch((err: Error) => setError(err.message));
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
      0,
    );
    const tax = subtotal * ((Number(taxRate) || 0) / 100);
    return { subtotal, tax, total: subtotal + tax };
  }, [items, taxRate]);

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unit_price: 0 },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!customerId) {
      setError("Selecciona un cliente.");
      return;
    }

    const payload = {
      customer_id: Number(customerId),
      issue_date: issueDate,
      due_date: dueDate || null,
      status,
      tax_rate: Number(taxRate),
      notes: notes || null,
      items: items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
      })),
    };

    try {
      setSaving(true);
      const invoice = initial
        ? await api.updateInvoice(initial.id, payload)
        : await api.createInvoice(payload);
      router.push(`/invoices/${invoice.id}`);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Cliente</span>
          <select
            className={input}
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Selecciona…</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} · {customer.tax_id}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Estado</span>
          <select
            className={input}
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
          >
            {INVOICE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Fecha de emisión</span>
          <input
            type="date"
            className={input}
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Vencimiento</span>
          <input
            type="date"
            className={input}
            value={dueDate ?? ""}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">IVA (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            className={input}
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Ítems</h2>
          <button
            type="button"
            onClick={addItem}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
          >
            + Agregar ítem
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 rounded-md border border-zinc-200 bg-white p-2"
            >
              <input
                className={`${input} col-span-12 sm:col-span-6`}
                placeholder="Descripción"
                value={item.description}
                onChange={(e) => updateItem(index, { description: e.target.value })}
              />
              <input
                className={`${input} col-span-4 sm:col-span-2`}
                type="number"
                min={0.01}
                step="0.01"
                placeholder="Cant."
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, { quantity: Number(e.target.value) })
                }
              />
              <input
                className={`${input} col-span-5 sm:col-span-3`}
                type="number"
                min={0}
                step="0.01"
                placeholder="Precio unitario"
                value={item.unit_price}
                onChange={(e) =>
                  updateItem(index, { unit_price: Number(e.target.value) })
                }
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className="col-span-3 rounded-md px-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-30 sm:col-span-1"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Notas</span>
        <textarea
          className={input}
          rows={3}
          value={notes ?? ""}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      <div className="flex flex-col items-end gap-1 border-t border-zinc-200 pt-4 text-sm">
        <div className="flex w-full max-w-xs justify-between">
          <span className="text-zinc-500">Subtotal</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="flex w-full max-w-xs justify-between">
          <span className="text-zinc-500">IVA ({taxRate}%)</span>
          <span>{formatCurrency(totals.tax)}</span>
        </div>
        <div className="flex w-full max-w-xs justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {saving ? "Guardando…" : initial ? "Guardar cambios" : "Crear factura"}
        </button>
      </div>
    </form>
  );
}
