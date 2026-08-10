import { limpiarHtml, TIMEOUT_MS, type AjustesBusqueda, type OfertaExterna, type ResultadoFuente } from "./tipos";

interface InfojobsItem {
  id: string;
  title: string;
  author?: { name?: string };
  city?: string;
  province?: { value?: string };
  link: string;
  salaryDescription?: string;
  published?: string;
  teleworking?: { value?: string };
  contractType?: { value?: string };
  requirementMin?: string;
}

/**
 * API oficial de InfoJobs (gratuita): crea una app en
 * https://developer.infojobs.net y pega el Client ID y el Client Secret.
 */
export async function buscarInfojobs(consulta: string, ajustes: AjustesBusqueda): Promise<ResultadoFuente> {
  if (!ajustes.infojobs_id || !ajustes.infojobs_secret) {
    return { fuente: "infojobs", ofertas: [], error: "Sin configurar (añade tus claves gratuitas en Filtros)" };
  }
  try {
    const credenciales = Buffer.from(`${ajustes.infojobs_id}:${ajustes.infojobs_secret}`).toString("base64");
    const r = await fetch(
      `https://api.infojobs.net/api/9/offer?q=${encodeURIComponent(consulta)}&maxResults=30`,
      {
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { Authorization: `Basic ${credenciales}` },
      }
    );
    if (r.status === 401 || r.status === 403) {
      return { fuente: "infojobs", ofertas: [], error: "Claves no válidas o app pendiente de aprobación" };
    }
    if (!r.ok) return { fuente: "infojobs", ofertas: [], error: `HTTP ${r.status}` };
    const datos = await r.json();
    const ofertas: OfertaExterna[] = (datos.items ?? []).map((j: InfojobsItem) => ({
      fuente: "infojobs",
      id_externo: j.id,
      titulo: j.title ?? "",
      empresa: j.author?.name ?? "",
      ubicacion: [j.city, j.province?.value].filter(Boolean).join(", "),
      url: j.link,
      descripcion: limpiarHtml(
        [j.requirementMin, j.contractType?.value, j.teleworking?.value].filter(Boolean).join(". ")
      ).slice(0, 4000),
      salario_texto: j.salaryDescription ?? "",
      fecha_publicacion: (j.published ?? "").slice(0, 10),
    }));
    return { fuente: "infojobs", ofertas, error: null };
  } catch (e) {
    return { fuente: "infojobs", ofertas: [], error: e instanceof Error ? e.message : "error" };
  }
}
