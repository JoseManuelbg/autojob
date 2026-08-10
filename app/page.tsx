"use client";

import { useCallback, useEffect, useState } from "react";
import { ESTADOS, type Candidatura, type Cv, type EstadoCandidatura } from "@/lib/types";

const FORM_VACIO = {
  empresa: "",
  puesto: "",
  url: "",
  ubicacion: "",
  modalidad: "",
  salario: "",
  estado: "guardada" as EstadoCandidatura,
  cv_id: "" as string,
  texto_oferta: "",
  puntuacion: null as number | null,
  notas: "",
};

export default function Dashboard() {
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [cvs, setCvs] = useState<Cv[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>("todas");
  const [busqueda, setBusqueda] = useState("");
  const [formAbierto, setFormAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...FORM_VACIO });
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    const [rc, rcv] = await Promise.all([fetch("/api/candidaturas"), fetch("/api/cvs")]);
    setCandidaturas(await rc.json());
    setCvs(await rcv.json());
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
    // Prefill desde el validador de ofertas
    const prefill = sessionStorage.getItem("autojob-prefill");
    if (prefill) {
      sessionStorage.removeItem("autojob-prefill");
      setForm({ ...FORM_VACIO, ...JSON.parse(prefill) });
      setFormAbierto(true);
    }
  }, [cargar]);

  const guardar = async () => {
    if (!form.empresa.trim() || !form.puesto.trim()) return;
    const cuerpo = { ...form, cv_id: form.cv_id ? Number(form.cv_id) : null };
    if (editandoId) {
      await fetch(`/api/candidaturas/${editandoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
    } else {
      await fetch("/api/candidaturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
    }
    setFormAbierto(false);
    setEditandoId(null);
    setForm({ ...FORM_VACIO });
    cargar();
  };

  const cambiarEstado = async (id: number, estado: string) => {
    await fetch(`/api/candidaturas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    cargar();
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar esta candidatura?")) return;
    await fetch(`/api/candidaturas/${id}`, { method: "DELETE" });
    cargar();
  };

  const editar = (c: Candidatura) => {
    setForm({
      empresa: c.empresa,
      puesto: c.puesto,
      url: c.url,
      ubicacion: c.ubicacion,
      modalidad: c.modalidad,
      salario: c.salario,
      estado: c.estado,
      cv_id: c.cv_id ? String(c.cv_id) : "",
      texto_oferta: c.texto_oferta,
      puntuacion: c.puntuacion,
      notas: c.notas,
    });
    setEditandoId(c.id);
    setFormAbierto(true);
  };

  const visibles = candidaturas.filter((c) => {
    if (filtroEstado !== "todas" && c.estado !== filtroEstado) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      return c.empresa.toLowerCase().includes(q) || c.puesto.toLowerCase().includes(q);
    }
    return true;
  });

  const enviadas = candidaturas.filter((c) => !["guardada", "descartada"].includes(c.estado));
  const stats = {
    total: candidaturas.length,
    enviadas: enviadas.length,
    entrevistas: candidaturas.filter((c) => c.estado === "entrevista").length,
    ofertas: candidaturas.filter((c) => c.estado === "oferta").length,
    respuesta:
      enviadas.length > 0
        ? Math.round(
            (candidaturas.filter((c) => ["entrevista", "oferta", "rechazada"].includes(c.estado)).length /
              enviadas.length) *
              100
          )
        : 0,
  };

  const set = (campo: string, valor: string | number | null) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Candidaturas</h1>
        <button
          onClick={() => {
            setForm({ ...FORM_VACIO });
            setEditandoId(null);
            setFormAbierto(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Nueva candidatura
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", valor: stats.total },
          { label: "Enviadas", valor: stats.enviadas },
          { label: "Entrevistas", valor: stats.entrevistas },
          { label: "Ofertas", valor: stats.ofertas },
          { label: "Tasa respuesta", valor: `${stats.respuesta}%` },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-2xl font-bold">{s.valor}</div>
            <div className="text-xs text-zinc-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Formulario */}
      {formAbierto && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold">{editandoId ? "Editar candidatura" : "Nueva candidatura"}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="input"
              placeholder="Empresa *"
              value={form.empresa}
              onChange={(e) => set("empresa", e.target.value)}
            />
            <input
              className="input"
              placeholder="Puesto *"
              value={form.puesto}
              onChange={(e) => set("puesto", e.target.value)}
            />
            <input
              className="input"
              placeholder="URL de la oferta"
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
            />
            <input
              className="input"
              placeholder="Ubicación"
              value={form.ubicacion}
              onChange={(e) => set("ubicacion", e.target.value)}
            />
            <select
              className="input"
              value={form.modalidad}
              onChange={(e) => set("modalidad", e.target.value)}
            >
              <option value="">Modalidad…</option>
              <option value="remoto">Remoto</option>
              <option value="hibrido">Híbrido</option>
              <option value="presencial">Presencial</option>
            </select>
            <input
              className="input"
              placeholder="Salario (ej. 30.000-35.000 €)"
              value={form.salario}
              onChange={(e) => set("salario", e.target.value)}
            />
            <select
              className="input"
              value={form.estado}
              onChange={(e) => set("estado", e.target.value)}
            >
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
            <select className="input" value={form.cv_id} onChange={(e) => set("cv_id", e.target.value)}>
              <option value="">CV utilizado…</option>
              {cvs.map((cv) => (
                <option key={cv.id} value={cv.id}>
                  {cv.nombre}
                </option>
              ))}
            </select>
          </div>
          <textarea
            className="input w-full h-24"
            placeholder="Notas"
            value={form.notas}
            onChange={(e) => set("notas", e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={guardar}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Guardar
            </button>
            <button
              onClick={() => {
                setFormAbierto(false);
                setEditandoId(null);
              }}
              className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Filtros de lista */}
      <div className="flex items-center gap-2 flex-wrap">
        {["todas", ...ESTADOS.map((e) => e.value)].map((e) => (
          <button
            key={e}
            onClick={() => setFiltroEstado(e)}
            className={`px-3 py-1 rounded-full text-xs capitalize ${
              filtroEstado === e ? "bg-white text-zinc-900 font-medium" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {e === "todas" ? "Todas" : ESTADOS.find((x) => x.value === e)?.label}
          </button>
        ))}
        <input
          className="input ml-auto w-48"
          placeholder="Buscar…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Lista */}
      {cargando ? (
        <p className="text-zinc-500">Cargando…</p>
      ) : visibles.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-4xl mb-3">🗂️</p>
          <p>No hay candidaturas{filtroEstado !== "todas" ? " con ese estado" : " todavía"}.</p>
          <p className="text-sm mt-1">
            Usa «Validar oferta» para comprobar si una oferta encaja y regístrala desde ahí.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibles.map((c) => {
            const estado = ESTADOS.find((e) => e.value === c.estado);
            return (
              <div
                key={c.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 flex-wrap"
              >
                <div className="flex-1 min-w-48">
                  <div className="font-medium flex items-center gap-2">
                    {c.url ? (
                      <a href={c.url} target="_blank" className="hover:underline" rel="noreferrer">
                        {c.puesto}
                      </a>
                    ) : (
                      c.puesto
                    )}
                    {c.puntuacion !== null && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          c.puntuacion >= 70
                            ? "bg-emerald-900 text-emerald-300"
                            : c.puntuacion >= 40
                              ? "bg-amber-900 text-amber-300"
                              : "bg-rose-900 text-rose-300"
                        }`}
                      >
                        {c.puntuacion}%
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {c.empresa}
                    {c.ubicacion && ` · ${c.ubicacion}`}
                    {c.modalidad && ` · ${c.modalidad}`}
                    {c.salario && ` · ${c.salario}`}
                    {c.cv_nombre && ` · CV: ${c.cv_nombre}`}
                    {c.fecha_envio && ` · enviada el ${c.fecha_envio}`}
                  </div>
                </div>
                <span className={`w-2 h-2 rounded-full ${estado?.color}`} />
                <select
                  value={c.estado}
                  onChange={(e) => cambiarEstado(c.id, e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-sm"
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
                <button onClick={() => editar(c)} className="text-zinc-400 hover:text-white text-sm">
                  Editar
                </button>
                <button onClick={() => eliminar(c.id)} className="text-zinc-500 hover:text-rose-400 text-sm">
                  Eliminar
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
