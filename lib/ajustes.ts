import { getDb } from "./db";
import type { AjustesBusqueda } from "./fuentes/tipos";

const CLAVES: (keyof AjustesBusqueda)[] = [
  "consulta",
  "pais",
  "adzuna_app_id",
  "adzuna_app_key",
  "jooble_key",
  "infojobs_id",
  "infojobs_secret",
];

export function leerAjustes(): AjustesBusqueda {
  const db = getDb();
  const filas = db.prepare("SELECT clave, valor FROM ajustes").all() as {
    clave: string;
    valor: string;
  }[];
  const mapa = Object.fromEntries(filas.map((f) => [f.clave, f.valor]));
  return {
    consulta: mapa.consulta ?? "",
    pais: mapa.pais ?? "es",
    adzuna_app_id: mapa.adzuna_app_id ?? "",
    adzuna_app_key: mapa.adzuna_app_key ?? "",
    jooble_key: mapa.jooble_key ?? "",
    infojobs_id: mapa.infojobs_id ?? "",
    infojobs_secret: mapa.infojobs_secret ?? "",
  };
}

export function guardarAjustes(datos: Partial<AjustesBusqueda>): AjustesBusqueda {
  const db = getDb();
  const upsert = db.prepare(
    "INSERT INTO ajustes (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor"
  );
  for (const clave of CLAVES) {
    if (datos[clave] !== undefined) upsert.run(clave, String(datos[clave]));
  }
  return leerAjustes();
}
