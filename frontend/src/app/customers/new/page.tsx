"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function NewCustomerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    tax_id: "",
    email: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      setSaving(true);
      await api.createCustomer(form);
      router.push("/customers");
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Nuevo cliente</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </p>
        )}

        <label className="block space-y-1 text-sm">
          <span className="font-medium">Nombre *</span>
          <input
            required
            className={input}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">RUT *</span>
          <input
            required
            className={input}
            placeholder="76.543.210-K"
            value={form.tax_id}
            onChange={(e) => update("tax_id", e.target.value)}
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">Email</span>
          <input
            type="email"
            className={input}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">Teléfono</span>
          <input
            className={input}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">Dirección</span>
          <input
            className={input}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </label>

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
            {saving ? "Guardando…" : "Crear cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}
