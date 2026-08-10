import { limpiarHtml, TIMEOUT_MS, type OfertaExterna, type ResultadoFuente } from "./tipos";

/**
 * Fuente EXPERIMENTAL: usa el listado público de invitados de LinkedIn
 * (lo que ve cualquier persona sin iniciar sesión). No usa tu cuenta ni
 * cookies, así que no hay cuenta que puedan sancionar; el riesgo es que
 * LinkedIn limite la IP o cambie el HTML. Una sola petición por búsqueda.
 */
export async function buscarLinkedin(consulta: string, pais: string): Promise<ResultadoFuente> {
  try {
    const ubicacion = pais === "es" ? "España" : pais;
    const url =
      "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search" +
      `?keywords=${encodeURIComponent(consulta)}&location=${encodeURIComponent(ubicacion)}&start=0`;
    const r = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        "Accept-Language": "es-ES,es;q=0.9",
      },
    });
    if (r.status === 429) {
      return { fuente: "linkedin", ofertas: [], error: "LinkedIn ha limitado la IP temporalmente, prueba en unos minutos" };
    }
    if (!r.ok) return { fuente: "linkedin", ofertas: [], error: `HTTP ${r.status}` };
    const html = await r.text();

    const tarjetas = html.split('data-entity-urn="urn:li:jobPosting:').slice(1);
    const ofertas: OfertaExterna[] = [];
    for (const tarjeta of tarjetas.slice(0, 25)) {
      const id = tarjeta.match(/^(\d+)/)?.[1];
      const enlace = tarjeta.match(/href="(https:\/\/[^"]*\/jobs\/view\/[^"]+)"/)?.[1];
      const titulo = tarjeta.match(/base-search-card__title[^>]*>\s*([\s\S]*?)\s*</)?.[1];
      const empresa = tarjeta.match(/base-search-card__subtitle[^>]*>[\s\S]*?<a[^>]*>\s*([\s\S]*?)\s*</)?.[1];
      const lugar = tarjeta.match(/job-search-card__location[^>]*>\s*([\s\S]*?)\s*</)?.[1];
      const fecha = tarjeta.match(/datetime="(\d{4}-\d{2}-\d{2})"/)?.[1];
      if (!id || !titulo) continue;
      ofertas.push({
        fuente: "linkedin",
        id_externo: id,
        titulo: limpiarHtml(titulo),
        empresa: limpiarHtml(empresa ?? ""),
        ubicacion: limpiarHtml(lugar ?? ""),
        url: enlace ? enlace.split("?")[0] : `https://www.linkedin.com/jobs/view/${id}`,
        descripcion: "",
        salario_texto: "",
        fecha_publicacion: fecha ?? "",
      });
    }
    return { fuente: "linkedin", ofertas, error: null };
  } catch (e) {
    return { fuente: "linkedin", ofertas: [], error: e instanceof Error ? e.message : "error" };
  }
}
