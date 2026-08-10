import { limpiarHtml, TIMEOUT_MS, type OfertaExterna, type ResultadoFuente } from "./tipos";

/**
 * Tecnoempleo no tiene API ni RSS públicos: se parsea el buscador web
 * (una petición por búsqueda). Portal español de empleo tecnológico.
 */
export async function buscarTecnoempleo(consulta: string): Promise<ResultadoFuente> {
  try {
    const r = await fetch(
      `https://www.tecnoempleo.com/ofertas-trabajo/?te=${encodeURIComponent(consulta)}`,
      {
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        },
      }
    );
    if (!r.ok) return { fuente: "tecnoempleo", ofertas: [], error: `HTTP ${r.status}` };
    const html = await r.text();

    const tarjetas = html.split('class="p-3 border rounded mb-3 bg-white"').slice(1);
    const ofertas: OfertaExterna[] = [];
    for (const tarjeta of tarjetas.slice(0, 30)) {
      const m = tarjeta.match(
        /<a href="(https:\/\/www\.tecnoempleo\.com\/[^"]+\/(rf-[a-z0-9]+))" class="font-weight-bold text-cyan-700" title="([^"]*)"/
      );
      if (!m) continue;
      const [, url, id, titulo] = m;
      const empresa = tarjeta.match(/class="text-primary link-muted">\s*([\s\S]*?)\s*<\/a>/)?.[1];
      const lugarFecha = tarjeta.match(
        /d-block d-lg-none text-gray-800">\s*<b>([\s\S]*?)<\/b>\s*-\s*(\d{2}\/\d{2}\/\d{4})/
      );
      const descripcion = tarjeta.match(/hidden-md-down text-gray-800">\s*([\s\S]*?)<\/span>\s*<\/div>/)?.[1];
      const fecha = lugarFecha?.[2]
        ? lugarFecha[2].split("/").reverse().join("-")
        : "";
      ofertas.push({
        fuente: "tecnoempleo",
        id_externo: id,
        titulo: limpiarHtml(titulo),
        empresa: limpiarHtml(empresa ?? ""),
        ubicacion: limpiarHtml(lugarFecha?.[1] ?? ""),
        url,
        descripcion: limpiarHtml(descripcion ?? "").slice(0, 4000),
        salario_texto: "",
        fecha_publicacion: fecha,
      });
    }
    return { fuente: "tecnoempleo", ofertas, error: null };
  } catch (e) {
    return { fuente: "tecnoempleo", ofertas: [], error: e instanceof Error ? e.message : "error" };
  }
}
