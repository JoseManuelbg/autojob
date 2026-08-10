export type EstadoCandidatura =
  | "guardada"
  | "enviada"
  | "entrevista"
  | "oferta"
  | "rechazada"
  | "descartada";

export const ESTADOS: { value: EstadoCandidatura; label: string; color: string }[] = [
  { value: "guardada", label: "Guardada", color: "bg-slate-500" },
  { value: "enviada", label: "Enviada", color: "bg-blue-500" },
  { value: "entrevista", label: "Entrevista", color: "bg-amber-500" },
  { value: "oferta", label: "Oferta", color: "bg-emerald-500" },
  { value: "rechazada", label: "Rechazada", color: "bg-rose-500" },
  { value: "descartada", label: "Descartada", color: "bg-zinc-600" },
];

export interface Cv {
  id: number;
  nombre: string;
  archivo: string;
  etiquetas: string;
  notas: string;
  creado_en: string;
}

export interface Candidatura {
  id: number;
  empresa: string;
  puesto: string;
  url: string;
  ubicacion: string;
  modalidad: string;
  salario: string;
  estado: EstadoCandidatura;
  cv_id: number | null;
  cv_nombre?: string | null;
  texto_oferta: string;
  puntuacion: number | null;
  notas: string;
  fecha_envio: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface Filtros {
  palabras_clave: string;
  palabras_excluidas: string;
  salario_minimo: number | null;
  ubicaciones: string;
  modalidades: string; // "remoto,hibrido,presencial"
  otros: string;
}

export type CheckEstado = "ok" | "fallo" | "desconocido";

export interface MatchCheck {
  criterio: string;
  estado: CheckEstado;
  detalle: string;
  peso: number;
}

export interface MatchResultado {
  puntuacion: number; // 0-100
  veredicto: "encaja" | "dudoso" | "no_encaja";
  checks: MatchCheck[];
  salario_detectado: string | null;
  modalidad_detectada: string | null;
}
