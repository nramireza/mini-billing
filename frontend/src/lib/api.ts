import type {
  Customer,
  Invoice,
  InvoiceStatus,
  Paginated,
  Stats,
} from "./types";

const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Error ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
      else if (body?.errors)
        message = Object.values(body.errors).flat().join(" ");
    } catch {
      /* ignore parse errors */
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export interface InvoicePayload {
  customer_id: number;
  issue_date: string;
  due_date?: string | null;
  status?: InvoiceStatus;
  tax_rate?: number;
  notes?: string | null;
  items: { description: string; quantity: number; unit_price: number }[];
}

export interface InvoiceFilters {
  status?: string;
  q?: string;
  page?: number;
  per_page?: number;
}

export const api = {
  getStats: () => request<{ data: Stats }>("/stats").then((r) => r.data),

  listInvoices: (filters: InvoiceFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.q) params.set("q", filters.q);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.per_page) params.set("per_page", String(filters.per_page));
    const qs = params.toString();
    return request<Paginated<Invoice>>(`/invoices${qs ? `?${qs}` : ""}`);
  },

  getInvoice: (id: string | number) =>
    request<{ data: Invoice }>(`/invoices/${id}`).then((r) => r.data),

  createInvoice: (payload: InvoicePayload) =>
    request<{ data: Invoice }>("/invoices", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((r) => r.data),

  updateInvoice: (id: string | number, payload: Partial<InvoicePayload>) =>
    request<{ data: Invoice }>(`/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }).then((r) => r.data),

  updateInvoiceStatus: (id: string | number, status: InvoiceStatus) =>
    request<{ data: Invoice }>(`/invoices/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }).then((r) => r.data),

  deleteInvoice: (id: string | number) =>
    request<void>(`/invoices/${id}`, { method: "DELETE" }),

  listCustomers: (q?: string) => {
    const params = new URLSearchParams({ per_page: "50" });
    if (q) params.set("q", q);
    return request<Paginated<Customer>>(`/customers?${params.toString()}`);
  },

  createCustomer: (payload: {
    name: string;
    tax_id: string;
    email?: string;
    phone?: string;
    address?: string;
  }) =>
    request<{ data: Customer }>("/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((r) => r.data),
};
