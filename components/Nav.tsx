"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const enlaces = [
  { href: "/", label: "Candidaturas", icono: "📋" },
  { href: "/ofertas", label: "Ofertas", icono: "📡" },
  { href: "/validar", label: "Validar oferta", icono: "🎯" },
  { href: "/cvs", label: "Mis CVs", icono: "📄" },
  { href: "/filtros", label: "Filtros", icono: "⚙️" },
];

export default function Nav() {
  const ruta = usePathname();
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 flex items-center gap-1 h-14">
        <span className="font-bold text-lg mr-6 text-white">
          Auto<span className="text-emerald-400">Job</span>
        </span>
        {enlaces.map((e) => (
          <Link
            key={e.href}
            href={e.href}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              ruta === e.href
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <span className="mr-1.5">{e.icono}</span>
            {e.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
