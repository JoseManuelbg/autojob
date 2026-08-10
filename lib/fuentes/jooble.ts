import { limpiarHtml, TIMEOUT_MS, type AjustesBusqueda, type OfertaExterna, type ResultadoFuente } from "./tipos";

interface JoobleJob {
  id: number | string;
  title: string;
  company: string;
  location: string;
  link: string;
  snippet: string;
  salary: string;
  updated: string;
}

/**
 * Jooble agrega ofertas de cientos de portales (mucha oferta en España).
 * Clave gratuita en https://jooble.org/api/about — la envían por email.
 */
export async function buscarJooble(consulta: string, ajustes: AjustesBusqueda): Promise<ResultadoFuente> {
  if (!ajustes.jooble_key) {
    return { fuente: "jooble", ofertas: [], error: "Sin configurar (añade tu clave gratuita en Filtros)" };
  }
  try {
    const r = await fetch(`https://jooble.org/api/${encodeURIComponent(ajustes.jooble_key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: consulta, location: "", page: 1 }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!r.ok) return { fuente: "jooble", ofertas: [], error: `HTTP ${r.status} (¿clave correcta?)` };
    const datos = await r.json();
    const ofertas: OfertaExterna[] = (datos.jobs ?? []).slice(0, 30).map((j: JoobleJob) => ({
      fuente: "jooble",
      id_externo: String(j.id),
      titulo: j.title ?? "",
      empresa: j.company ?? "",
      ubicacion: j.location ?? "",
      url: j.link,
      descripcion: limpiarHtml(j.snippet ?? "").slice(0, 4000),
      salario_texto: j.salary ?? "",
      fecha_publicacion: (j.updated ?? "").slice(0, 10),
    }));
    return { fuente: "jooble", ofertas, error: null };
  } catch (e) {
    return { fuente: "jooble", ofertas: [], error: e instanceof Error ? e.message : "error" };
  }
}
