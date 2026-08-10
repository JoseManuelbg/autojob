"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Cv } from "@/lib/types";

export default function Cvs() {
  const [cvs, setCvs] = useState<Cv[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [nombre, setNombre] = useState("");
  const [etiquetas, setEtiquetas] = useState("");
  const inputArchivo = useRef<HTMLInputElement>(null);

  const cargar = useCallback(async () => {
    const r = await fetch("/api/cvs");
    setCvs(await r.json());
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const subir = async () => {
    const archivo = inputArchivo.current?.files?.[0];
    if (!archivo) {
      alert("Selecciona un archivo (PDF o DOCX)");
      return;
    }
    setSubiendo(true);
    const form = new FormData();
    form.append("archivo", archivo);
    form.append("nombre", nombre || archivo.name.replace(/\.[^.]+$/, ""));
    form.append("etiquetas", etiquetas);
    await fetch("/api/cvs", { method: "POST", body: form });
    setSubiendo(false);
    setNombre("");
    setEtiquetas("");
    if (inputArchivo.current) inputArchivo.current.value = "";
    cargar();
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar este CV? Las candidaturas que lo usaban lo perderán.")) return;
    await fetch(`/api/cvs/${id}`, { method: "DELETE" });
    cargar();
  };

  const renombrar = async (cv: Cv) => {
    const nuevo = prompt("Nuevo nombre:", cv.nombre);
    if (!nuevo || nuevo === cv.nombre) return;
    await fetch(`/api/cvs/${cv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nuevo }),
    });
    cargar();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Mis CVs</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Sube tus distintas versiones de CV (por idioma, por tipo de puesto…) y asígnalas a cada
          candidatura para saber siempre cuál enviaste.
        </p>
      </div>

      {/* Subida */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-sm">Subir CV</h2>
        <input
          ref={inputArchivo}
          type="file"
          accept=".pdf,.doc,.docx,.odt"
          className="block text-sm text-zinc-400 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-zinc-700 file:text-zinc-100 file:text-sm hover:file:bg-zinc-600 file:cursor-pointer"
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            className="input"
            placeholder="Nombre (ej. CV Frontend ES)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            className="input"
            placeholder="Etiquetas (ej. frontend, inglés)"
            value={etiquetas}
            onChange={(e) => setEtiquetas(e.target.value)}
          />
        </div>
        <button
          onClick={subir}
          disabled={subiendo}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          {subiendo ? "Subiendo…" : "⬆️ Subir"}
        </button>
      </div>

      {/* Lista */}
      {cvs.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-4xl mb-3">📄</p>
          <p>Todavía no has subido ningún CV.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cvs.map((cv) => (
            <div
              key={cv.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 flex-wrap"
            >
              <span className="text-2xl">📄</span>
              <div className="flex-1 min-w-40">
                <div className="font-medium">{cv.nombre}</div>
                <div className="text-xs text-zinc-500">
                  Subido el {cv.creado_en.slice(0, 10)}
                  {cv.etiquetas && (
                    <>
                      {" · "}
                      {cv.etiquetas.split(",").map((t) => (
                        <span
                          key={t}
                          className="inline-block bg-zinc-800 rounded px-1.5 py-0.5 mr-1 text-zinc-300"
                        >
                          {t.trim()}
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>
              <a
                href={`/api/cvs/${cv.id}/archivo`}
                target="_blank"
                className="text-emerald-400 hover:underline text-sm"
              >
                Ver
              </a>
              <button onClick={() => renombrar(cv)} className="text-zinc-400 hover:text-white text-sm">
                Renombrar
              </button>
              <button
                onClick={() => eliminar(cv.id)}
                className="text-zinc-500 hover:text-rose-400 text-sm"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
