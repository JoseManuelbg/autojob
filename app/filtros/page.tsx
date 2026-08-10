"use client";

import { useEffect, useState } from "react";
import type { Filtros } from "@/lib/types";
import type { AjustesBusqueda } from "@/lib/fuentes/tipos";

const MODALIDADES = [
  { value: "remoto", label: "Remoto" },
  { value: "hibrido", label: "Híbrido" },
  { value: "presencial", label: "Presencial" },
];

export default function PaginaFiltros() {
  const [filtros, setFiltros] = useState<Filtros | null>(null);
  const [ajustes, setAjustes] = useState<AjustesBusqueda | null>(null);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch("/api/filtros")
      .then((r) => r.json())
      .then(setFiltros);
    fetch("/api/ajustes")
      .then((r) => r.json())
      .then(setAjustes);
  }, []);

  if (!filtros || !ajustes) return <p className="text-zinc-500">Cargando…</p>;

  const set = (campo: keyof Filtros, valor: string | number | null) => {
    setFiltros({ ...filtros, [campo]: valor });
    setGuardado(false);
  };

  const modalidadesActivas = filtros.modalidades
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const alternarModalidad = (m: string) => {
    const nuevas = modalidadesActivas.includes(m)
      ? modalidadesActivas.filter((x) => x !== m)
      : [...modalidadesActivas, m];
    set("modalidades", nuevas.join(","));
  };

  const setAjuste = (campo: keyof AjustesBusqueda, valor: string) => {
    setAjustes({ ...ajustes, [campo]: valor });
    setGuardado(false);
  };

  const guardar = async () => {
    await Promise.all([
      fetch("/api/filtros", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filtros),
      }),
      fetch("/api/ajustes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ajustes),
      }),
    ]);
    setGuardado(true);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Mis filtros</h1>
        <p className="text-zinc-400 text-sm mt-1">
          El validador de ofertas usa estos criterios para puntuar cada oferta de 0 a 100.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Palabras clave que buscas <span className="text-zinc-500">(peso 40%)</span>
          </label>
          <textarea
            className="input w-full h-20"
            placeholder="Separadas por comas: react, typescript, frontend, junior…"
            value={filtros.palabras_clave}
            onChange={(e) => set("palabras_clave", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Palabras que descartan una oferta <span className="text-zinc-500">(peso 20%)</span>
          </label>
          <textarea
            className="input w-full h-20"
            placeholder="Separadas por comas: comercial, autónomo, guardias, php…"
            value={filtros.palabras_excluidas}
            onChange={(e) => set("palabras_excluidas", e.target.value)}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Salario mínimo anual (€) <span className="text-zinc-500">(peso 20%)</span>
            </label>
            <input
              type="number"
              className="input w-full"
              placeholder="Ej. 25000"
              value={filtros.salario_minimo ?? ""}
              onChange={(e) => set("salario_minimo", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Modalidad <span className="text-zinc-500">(peso 10%)</span>
            </label>
            <div className="flex gap-2">
              {MODALIDADES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => alternarModalidad(m.value)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    modalidadesActivas.includes(m.value)
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Ubicaciones que te valen <span className="text-zinc-500">(peso 10%)</span>
          </label>
          <input
            className="input w-full"
            placeholder="Separadas por comas: Madrid, Sevilla, España…"
            value={filtros.ubicaciones}
            onChange={(e) => set("ubicaciones", e.target.value)}
          />
        </div>
      </div>

      {/* Búsqueda automática en plataformas */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5">
        <div>
          <h2 className="font-semibold">📡 Búsqueda automática de ofertas</h2>
          <p className="text-zinc-400 text-sm mt-1">
            LinkedIn (listado público), Tecnoempleo, Remotive, RemoteOK y Arbeitnow funcionan sin
            configurar nada. InfoJobs, Adzuna y Jooble necesitan claves gratuitas (se consiguen en
            minutos y multiplican la oferta en España).
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Qué buscar *</label>
            <input
              className="input w-full"
              placeholder="Ej. desarrollador frontend"
              value={ajustes.consulta}
              onChange={(e) => setAjuste("consulta", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">País (LinkedIn/Adzuna)</label>
            <select className="input w-full" value={ajustes.pais} onChange={(e) => setAjuste("pais", e.target.value)}>
              <option value="es">España</option>
              <option value="gb">Reino Unido</option>
              <option value="de">Alemania</option>
              <option value="fr">Francia</option>
              <option value="nl">Países Bajos</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              InfoJobs{" "}
              <a
                href="https://developer.infojobs.net"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline font-normal"
              >
                (consigue tus claves gratis aquí)
              </a>
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                className="input"
                placeholder="Client ID"
                value={ajustes.infojobs_id}
                onChange={(e) => setAjuste("infojobs_id", e.target.value)}
              />
              <input
                className="input"
                type="password"
                placeholder="Client Secret"
                value={ajustes.infojobs_secret}
                onChange={(e) => setAjuste("infojobs_secret", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Adzuna{" "}
              <a
                href="https://developer.adzuna.com"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline font-normal"
              >
                (claves gratis aquí)
              </a>
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                className="input"
                placeholder="App ID"
                value={ajustes.adzuna_app_id}
                onChange={(e) => setAjuste("adzuna_app_id", e.target.value)}
              />
              <input
                className="input"
                type="password"
                placeholder="App Key"
                value={ajustes.adzuna_app_key}
                onChange={(e) => setAjuste("adzuna_app_key", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Jooble{" "}
              <a
                href="https://jooble.org/api/about"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline font-normal"
              >
                (clave gratis aquí, la envían por email)
              </a>
            </label>
            <input
              className="input w-full"
              type="password"
              placeholder="API key"
              value={ajustes.jooble_key}
              onChange={(e) => setAjuste("jooble_key", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={guardar}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-medium"
        >
          Guardar todo
        </button>
        {guardado && <span className="text-emerald-400 text-sm">✓ Guardado</span>}
      </div>
    </div>
  );
}
