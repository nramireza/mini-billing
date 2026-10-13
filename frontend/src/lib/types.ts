export type InvoiceStatus = "draft" | "issued" | "paid" | "cancelled";

export interface Customer {
  id: number;
  name: string;
  tax_id: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  invoices_count?: number;
  created_at?: string;
}

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  line_total?: number;
}

export interface Invoice {
  id: number;
  number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  tax_rate: number;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  customer?: Customer;
  items?: InvoiceItem[];
  created_at?: string;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface Stats {
  customers: number;
  invoices: number;
  billed_total: number;
  by_status: Record<InvoiceStatus, number>;
}

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "draft",
  "issued",
  "paid",
  "cancelled",
];

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Borrador",
  issued: "Emitida",
  paid: "Pagada",
  cancelled: "Anulada",
};
