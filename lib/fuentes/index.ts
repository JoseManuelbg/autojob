import type { AjustesBusqueda, ResultadoFuente } from "./tipos";
import { buscarRemotive } from "./remotive";
import { buscarRemoteOk } from "./remoteok";
import { buscarArbeitnow } from "./arbeitnow";
import { buscarAdzuna } from "./adzuna";
import { buscarJooble } from "./jooble";
import { buscarLinkedin } from "./linkedin";
import { buscarTecnoempleo } from "./tecnoempleo";
import { buscarInfojobs } from "./infojobs";

export const FUENTES = [
  { id: "linkedin", nombre: "LinkedIn", ambito: "España (listado público, experimental)", necesitaClave: false },
  { id: "infojobs", nombre: "InfoJobs", ambito: "España (API oficial)", necesitaClave: true },
  { id: "tecnoempleo", nombre: "Tecnoempleo", ambito: "España, empleo tecnológico", necesitaClave: false },
  { id: "adzuna", nombre: "Adzuna", ambito: "España y más (agregador)", necesitaClave: true },
  { id: "jooble", nombre: "Jooble", ambito: "España y más (agregador)", necesitaClave: true },
  { id: "remotive", nombre: "Remotive", ambito: "Remoto internacional", necesitaClave: false },
  { id: "remoteok", nombre: "RemoteOK", ambito: "Remoto internacional", necesitaClave: false },
  { id: "arbeitnow", nombre: "Arbeitnow", ambito: "Europa / remoto", necesitaClave: false },
];

export async function buscarEnTodas(ajustes: AjustesBusqueda): Promise<ResultadoFuente[]> {
  const consulta = ajustes.consulta.trim();
  return Promise.all([
    buscarLinkedin(consulta, ajustes.pais || "es"),
    buscarInfojobs(consulta, ajustes),
    buscarTecnoempleo(consulta),
    buscarAdzuna(consulta, ajustes),
    buscarJooble(consulta, ajustes),
    buscarRemotive(consulta),
    buscarRemoteOk(consulta),
    buscarArbeitnow(consulta),
  ]);
}
