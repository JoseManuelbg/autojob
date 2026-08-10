"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { MatchResultado } from "@/lib/types";

export default function Validar() {
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<MatchResultado | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const validar = async () => {
    setError("");
    setResultado(null);
    setCargando(true);
    const r = await fetch("/api/validar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto }),
    });
    const datos = await r.json();
    setCargando(false);
    if (!r.ok) {
      setError(datos.error ?? "Error al validar");
      return;
    }
    setResultado(datos);
  };

  const registrar = () => {
    if (!resultado) return;
    sessionStorage.setItem(
      "autojob-prefill",
      JSON.stringify({
        texto_oferta: texto,
        puntuacion: resultado.puntuacion,
        salario: resultado.salario_detectado ?? "",
        modalidad: resultado.modalidad_detectada ?? "",
      })
    );
    router.push("/");
  };

  const colorVeredicto =
    resultado?.veredicto === "encaja"
      ? "text-emerald-400"
      : resultado?.veredicto === "dudoso"
        ? "text-amber-400"
        : "text-rose-400";

  const textoVeredicto =
    resultado?.veredicto === "encaja"
      ? "✅ La oferta encaja con tus filtros"
      : resultado?.veredicto === "dudoso"
        ? "🤔 Encaje dudoso, revísala con calma"
        : "❌ La oferta no encaja con tus filtros";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Validar oferta</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Pega el texto completo de la oferta y la compararé con tus{" "}
          <Link href="/filtros" className="text-emerald-400 hover:underline">
            filtros
          </Link>
          : palabras clave, salario mínimo, modalidad y ubicación. Todo se analiza en local, sin
          servicios externos.
        </p>
      </div>

      <textarea
        className="input w-full h-64 font-mono text-xs leading-relaxed"
        placeholder="Pega aquí la descripción completa de la oferta (título, requisitos, salario, ubicación...)"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          onClick={validar}
          disabled={cargando || texto.trim().length < 30}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium"
        >
          {cargando ? "Analizando…" : "🎯 Validar oferta"}
        </button>
        {texto && (
          <button
            onClick={() => {
              setTexto("");
              setResultado(null);
              setError("");
            }}
            className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm"
          >
            Limpiar
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {resultado && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-5">
            {/* Anillo de puntuación */}
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#27272a" strokeWidth="3.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke={
                    resultado.puntuacion >= 70 ? "#34d399" : resultado.puntuacion >= 40 ? "#fbbf24" : "#fb7185"
                  }
                  strokeWidth="3.5"
                  strokeDasharray={`${resultado.puntuacion} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-bold">
                {resultado.puntuacion}%
              </span>
            </div>
            <div>
              <p className={`font-semibold ${colorVeredicto}`}>{textoVeredicto}</p>
              <p className="text-sm text-zinc-400 mt-1">
                {resultado.salario_detectado && <>Salario detectado: {resultado.salario_detectado}. </>}
                {resultado.modalidad_detectada && <>Modalidad detectada: {resultado.modalidad_detectada}.</>}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {resultado.checks.map((c) => (
              <div key={c.criterio} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5">
                  {c.estado === "ok" ? "✅" : c.estado === "fallo" ? "❌" : "➖"}
                </span>
                <div>
                  <span className="font-medium">{c.criterio}: </span>
                  <span className="text-zinc-400">{c.detalle}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={registrar}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            📋 Registrar como candidatura
          </button>
        </div>
      )}
    </div>
  );
}
