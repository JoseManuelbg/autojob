import { limpiarHtml, TIMEOUT_MS, type OfertaExterna, type ResultadoFuente } from "./tipos";

interface ArbeitnowJob {
  slug: string;
  title: string;
  company_name: string;
  location: string;
  url: string;
  description: string;
  remote: boolean;
  created_at: number;
  tags?: string[];
}

export async function buscarArbeitnow(consulta: string): Promise<ResultadoFuente> {
  try {
    const r = await fetch("https://www.arbeitnow.com/api/job-board-api", {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!r.ok) return { fuente: "arbeitnow", ofertas: [], error: `HTTP ${r.status}` };
    const datos = await r.json();
    const trabajos: ArbeitnowJob[] = datos.data ?? [];

    const terminos = consulta
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(Boolean);

    const ofertas: OfertaExterna[] = trabajos
      .filter((j) => {
        if (terminos.length === 0) return true;
        const texto = `${j.title} ${(j.tags ?? []).join(" ")} ${j.description ?? ""}`.toLowerCase();
        return terminos.some((t) => texto.includes(t));
      })
      .slice(0, 30)
      .map((j) => ({
        fuente: "arbeitnow",
        id_externo: j.slug,
        titulo: j.title,
        empresa: j.company_name ?? "",
        ubicacion: j.remote ? `${j.location || ""} (remoto)`.trim() : j.location ?? "",
        url: j.url,
        descripcion: limpiarHtml(j.description ?? "").slice(0, 4000),
        salario_texto: "",
        fecha_publicacion: j.created_at ? new Date(j.created_at * 1000).toISOString().slice(0, 10) : "",
      }));
    return { fuente: "arbeitnow", ofertas, error: null };
  } catch (e) {
    return { fuente: "arbeitnow", ofertas: [], error: e instanceof Error ? e.message : "error" };
  }
}
