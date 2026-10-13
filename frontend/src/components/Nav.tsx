import Link from "next/link";

const links = [
  { href: "/", label: "Panel" },
  { href: "/invoices", label: "Facturas" },
  { href: "/customers", label: "Clientes" },
];

export function Nav() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-zinc-900 text-sm text-white">
            ₵
          </span>
          Mini Billing
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/invoices/new"
            className="ml-2 rounded-md bg-zinc-900 px-3 py-1.5 font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Nueva factura
          </Link>
        </nav>
      </div>
    </header>
  );
}
