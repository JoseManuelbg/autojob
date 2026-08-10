import { limpiarHtml, TIMEOUT_MS, type OfertaExterna, type ResultadoFuente } from "./tipos";

interface RemoteOkJob {
  id: string;
  position: string;
  company: string;
  location: string;
  url: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  date: string;
  tags?: string[];
}

export async function buscarRemoteOk(consulta: string): Promise<ResultadoFuente> {
  try {
    const r = await fetch("https://remoteok.com/api", {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": "AutoJob/1.0 (uso personal)" },
    });
    if (!r.ok) return { fuente: "remoteok", ofertas: [], error: `HTTP ${r.status}` };
    const datos = await r.json();
    // El primer elemento es un aviso legal, no una oferta
    const trabajos: RemoteOkJob[] = (Array.isArray(datos) ? datos : []).filter(
      (j: RemoteOkJob) => j.id && j.position
    );

    const terminos = consulta
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(Boolean);

    const ofertas: OfertaExterna[] = trabajos
      .filter((j) => {
        if (terminos.length === 0) return true;
        const texto = `${j.position} ${(j.tags ?? []).join(" ")} ${j.description ?? ""}`.toLowerCase();
        return terminos.some((t) => texto.includes(t));
      })
      .slice(0, 30)
      .map((j) => ({
        fuente: "remoteok",
        id_externo: String(j.id),
        titulo: j.position,
        empresa: j.company ?? "",
        ubicacion: j.location || "Remoto",
        url: j.url,
        descripcion: limpiarHtml(j.description ?? "").slice(0, 4000),
        salario_texto:
          j.salary_min && j.salary_max ? `${j.salary_min} - ${j.salary_max} USD` : "",
        fecha_publicacion: (j.date ?? "").slice(0, 10),
      }));
    return { fuente: "remoteok", ofertas, error: null };
  } catch (e) {
    return { fuente: "remoteok", ofertas: [], error: e instanceof Error ? e.message : "error" };
  }
}
