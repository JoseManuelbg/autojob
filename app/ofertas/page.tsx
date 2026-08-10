"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Cv } from "@/lib/types";

interface Oferta {
  id: number;
  fuente: string;
  titulo: string;
  empresa: string;
  ubicacion: string;
  url: string;
  descripcion: string;
  salario_texto: string;
  fecha_publicacion: string;
  puntuacion: number | null;
  estado: string;
}

interface ResumenFuente {
  fuente: string;
  encontradas: number;
  error: string | null;
}

const NOMBRES_FUENTES: Record<string, string> = {
  linkedin: "LinkedIn",
  infojobs: "InfoJobs",
  tecnoempleo: "Tecnoempleo",
  adzuna: "Adzuna",
  jooble: "Jooble",
  remotive: "Remotive",
  remoteok: "RemoteOK",
  arbeitnow: "Arbeitnow",
};

export default function Ofertas() {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [cvs, setCvs] = useState<Cv[]>([]);
  const [cvElegido, setCvElegido] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resumen, setResumen] = useState<ResumenFuente[] | null>(null);
  const [error, setError] = useState("");
  const [expandida, setExpandida] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    const [ro, rcv] = await Promise.all([fetch("/api/ofertas"), fetch("/api/cvs")]);
    setOfertas(await ro.json());
    const listaCvs = await rcv.json();
    setCvs(listaCvs);
    if (listaCvs.length > 0) setCvElegido((v) => v || String(listaCvs[0].id));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const buscar = async () => {
    setBuscando(true);
    setError("");
    setResumen(null);
    const r = await fetch("/api/ofertas/buscar", { method: "POST" });
    const datos = await r.json();
    setBuscando(false);
    if (!r.ok) {
      setError(datos.error ?? "Error al buscar");
      return;
    }
    setResumen(datos.resumen);
    cargar();
  };

  const accionar = async (id: number, accion: "aplicar" | "guardar" | "descartar") => {
    await fetch(`/api/ofertas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accion,
        cv_id: accion !== "descartar" && cvElegido ? Number(cvElegido) : null,
      }),
    });
    cargar();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ofertas</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Trae ofertas de LinkedIn, InfoJobs, Tecnoempleo y más, puntuadas con tus{" "}
            <Link href="/filtros" className="text-emerald-400 hover:underline">
              filtros
            </Link>
            . Cuando la eches, márcala como aplicada y se guarda como candidatura.
          </p>
        </div>
        <button
          onClick={buscar}
          disabled={buscando}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          {buscando ? "Buscando en las plataformas…" : "🔄 Buscar ofertas nuevas"}
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {resumen && (
        <div className="flex flex-wrap gap-2">
          {resumen.map((r) => (
            <span
              key={r.fuente}
              title={r.error ?? ""}
              className={`text-xs px-2.5 py-1 rounded-full border ${
                r.error
                  ? "border-zinc-700 text-zinc-500"
                  : "border-emerald-800 bg-emerald-950/40 text-emerald-300"
              }`}
            >
              {NOMBRES_FUENTES[r.fuente] ?? r.fuente}: {r.error ? "⚠︎" : r.encontradas}
            </span>
          ))}
        </div>
      )}

      {cvs.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-400">CV que estás enviando:</span>
          <select className="input" value={cvElegido} onChange={(e) => setCvElegido(e.target.value)}>
            {cvs.map((cv) => (
              <option key={cv.id} value={cv.id}>
                {cv.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {ofertas.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-4xl mb-3">📡</p>
          <p>No hay ofertas pendientes.</p>
          <p className="text-sm mt-1">
            Pulsa «Buscar ofertas nuevas». Configura qué buscar y tus claves gratuitas en{" "}
            <Link href="/filtros" className="text-emerald-400 hover:underline">
              Filtros
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {ofertas.map((o) => (
            <div key={o.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-4 flex-wrap">
                {o.puntuacion !== null ? (
                  <span
                    className={`text-sm font-bold w-12 text-center py-1.5 rounded-lg shrink-0 ${
                      o.puntuacion >= 70
                        ? "bg-emerald-900 text-emerald-300"
                        : o.puntuacion >= 40
                          ? "bg-amber-900 text-amber-300"
                          : "bg-rose-900 text-rose-300"
                    }`}
                  >
                    {o.puntuacion}%
                  </span>
                ) : (
                  <span
                    className="text-sm w-12 text-center py-1.5 rounded-lg bg-zinc-800 text-zinc-500 shrink-0"
                    title="Sin descripción suficiente para puntuar: ábrela y valórala tú"
                  >
                    —
                  </span>
                )}
                <div className="flex-1 min-w-48">
                  <a
                    href={o.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium hover:underline"
                  >
                    {o.titulo} ↗
                  </a>
                  <div className="text-sm text-zinc-400">
                    <span className="text-zinc-300">{NOMBRES_FUENTES[o.fuente] ?? o.fuente}</span>
                    {o.empresa && ` · ${o.empresa}`}
                    {o.ubicacion && ` · ${o.ubicacion}`}
                    {o.salario_texto && ` · ${o.salario_texto}`}
                    {o.fecha_publicacion && ` · ${o.fecha_publicacion}`}
                  </div>
                </div>
                <button
                  onClick={() => accionar(o.id, "aplicar")}
                  title="Ya la he echado: se guarda como candidatura enviada"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm"
                >
                  ✓ Aplicada
                </button>
                <button
                  onClick={() => accionar(o.id, "guardar")}
                  title="Guardar como candidatura pendiente"
                  className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg text-sm"
                >
                  💾 Para luego
                </button>
                <button
                  onClick={() => accionar(o.id, "descartar")}
                  className="text-zinc-500 hover:text-rose-400 px-2 py-1.5 text-sm"
                >
                  ✕
                </button>
              </div>
              {o.descripcion && (
                <button
                  onClick={() => setExpandida(expandida === o.id ? null : o.id)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 mt-2"
                >
                  {expandida === o.id ? "▲ Ocultar descripción" : "▼ Ver descripción"}
                </button>
              )}
              {expandida === o.id && (
                <p className="text-sm text-zinc-400 mt-2 whitespace-pre-wrap">{o.descripcion}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
