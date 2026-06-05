import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  ArrowLeftRight,
  ShoppingCart,
  History,
} from "lucide-react";

const links = [
  { href: "/",             label: "Inicio",         icon: LayoutDashboard },
  { href: "/piezas",       label: "Piezas",          icon: Package },
  { href: "/ordenes",      label: "Órdenes",         icon: ClipboardList },
  { href: "/lookup-merge", label: "Lookup+Merge",    icon: ArrowLeftRight },
  { href: "/solicitudes",  label: "Solicitudes",     icon: ShoppingCart },
  { href: "/historial",    label: "Historial",       icon: History },
];

export default function Navbar() {
  return (
    <header className="bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-1">
        {/* Brand */}
        <span className="font-bold text-sm tracking-tight mr-6 text-white shrink-0 select-none">
          Formatto{" "}
          <span className="font-light opacity-50 text-xs">Fabricación</span>
        </span>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
