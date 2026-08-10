export interface OfertaExterna {
  fuente: string;
  id_externo: string;
  titulo: string;
  empresa: string;
  ubicacion: string;
  url: string;
  descripcion: string;
  salario_texto: string;
  fecha_publicacion: string;
}

export interface ResultadoFuente {
  fuente: string;
  ofertas: OfertaExterna[];
  error: string | null;
}

export interface AjustesBusqueda {
  consulta: string;
  pais: string;
  adzuna_app_id: string;
  adzuna_app_key: string;
  jooble_key: string;
  infojobs_id: string;
  infojobs_secret: string;
}

/** Quita etiquetas HTML y entidades comunes de las descripciones de las APIs.
 *  Algunas APIs (p. ej. Arbeitnow) devuelven el HTML escapado, así que primero
 *  se decodifican las entidades y después se quitan las etiquetas. */
export function limpiarHtml(html: string): string {
  return html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#?\w+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const TIMEOUT_MS = 12000;
