import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { evaluarOferta } from "@/lib/matcher";
import type { Filtros } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { texto } = await req.json();
  if (!texto || typeof texto !== "string" || texto.trim().length < 30) {
    return NextResponse.json(
      { error: "Pega el texto de la oferta (al menos 30 caracteres)" },
      { status: 400 }
    );
  }

  const db = getDb();
  const filtros = db.prepare("SELECT * FROM filtros WHERE id = 1").get() as Filtros;

  const tieneFiltros =
    filtros.palabras_clave.trim() ||
    filtros.palabras_excluidas.trim() ||
    filtros.salario_minimo ||
    filtros.ubicaciones.trim() ||
    filtros.modalidades.trim();

  if (!tieneFiltros) {
    return NextResponse.json(
      { error: "Configura primero tus filtros en la pestaña Filtros" },
      { status: 400 }
    );
  }

  return NextResponse.json(evaluarOferta(texto, filtros));
}
