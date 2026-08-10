import { limpiarHtml, TIMEOUT_MS, type OfertaExterna, type ResultadoFuente } from "./tipos";

interface RemotiveJob {
  id: number;
  title: string;
  company_name: string;
  candidate_required_location: string;
  url: string;
  description: string;
  salary: string;
  publication_date: string;
}

export async function buscarRemotive(consulta: string): Promise<ResultadoFuente> {
  try {
    const r = await fetch(
      `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(consulta)}&limit=30`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) }
    );
    if (!r.ok) return { fuente: "remotive", ofertas: [], error: `HTTP ${r.status}` };
    const datos = await r.json();
    const ofertas: OfertaExterna[] = (datos.jobs ?? []).map((j: RemotiveJob) => ({
      fuente: "remotive",
      id_externo: String(j.id),
      titulo: j.title,
      empresa: j.company_name,
      ubicacion: j.candidate_required_location || "Remoto",
      url: j.url,
      descripcion: limpiarHtml(j.description ?? "").slice(0, 4000),
      salario_texto: j.salary ?? "",
      fecha_publicacion: (j.publication_date ?? "").slice(0, 10),
    }));
    return { fuente: "remotive", ofertas, error: null };
  } catch (e) {
    return { fuente: "remotive", ofertas: [], error: e instanceof Error ? e.message : "error" };
  }
}
