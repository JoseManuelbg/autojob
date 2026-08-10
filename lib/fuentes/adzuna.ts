import { limpiarHtml, TIMEOUT_MS, type AjustesBusqueda, type OfertaExterna, type ResultadoFuente } from "./tipos";

interface AdzunaJob {
  id: string;
  title: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  redirect_url: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  created: string;
}

/**
 * Adzuna agrega ofertas de muchos portales (incluida España).
 * Clave gratuita en https://developer.adzuna.com — app_id + app_key.
 */
export async function buscarAdzuna(consulta: string, ajustes: AjustesBusqueda): Promise<ResultadoFuente> {
  if (!ajustes.adzuna_app_id || !ajustes.adzuna_app_key) {
    return { fuente: "adzuna", ofertas: [], error: "Sin configurar (añade tus claves gratuitas en Filtros)" };
  }
  try {
    const pais = ajustes.pais || "es";
    const url =
      `https://api.adzuna.com/v1/api/jobs/${pais}/search/1` +
      `?app_id=${encodeURIComponent(ajustes.adzuna_app_id)}` +
      `&app_key=${encodeURIComponent(ajustes.adzuna_app_key)}` +
      `&what=${encodeURIComponent(consulta)}&results_per_page=30&content-type=application/json`;
    const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!r.ok) return { fuente: "adzuna", ofertas: [], error: `HTTP ${r.status} (¿claves correctas?)` };
    const datos = await r.json();
    const ofertas: OfertaExterna[] = (datos.results ?? []).map((j: AdzunaJob) => ({
      fuente: "adzuna",
      id_externo: String(j.id),
      titulo: j.title?.replace(/<[^>]+>/g, "") ?? "",
      empresa: j.company?.display_name ?? "",
      ubicacion: j.location?.display_name ?? "",
      url: j.redirect_url,
      descripcion: limpiarHtml(j.description ?? "").slice(0, 4000),
      salario_texto:
        j.salary_min && j.salary_max
          ? `${Math.round(j.salary_min).toLocaleString("es-ES")} - ${Math.round(j.salary_max).toLocaleString("es-ES")} €`
          : "",
      fecha_publicacion: (j.created ?? "").slice(0, 10),
    }));
    return { fuente: "adzuna", ofertas, error: null };
  } catch (e) {
    return { fuente: "adzuna", ofertas: [], error: e instanceof Error ? e.message : "error" };
  }
}
