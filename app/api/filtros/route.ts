import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.prepare("SELECT * FROM filtros WHERE id = 1").get());
}

export async function PUT(req: NextRequest) {
  const b = await req.json();
  const db = getDb();
  db.prepare(
    `UPDATE filtros SET
      palabras_clave = ?, palabras_excluidas = ?, salario_minimo = ?,
      ubicaciones = ?, modalidades = ?, otros = ?
     WHERE id = 1`
  ).run(
    b.palabras_clave ?? "",
    b.palabras_excluidas ?? "",
    b.salario_minimo || null,
    b.ubicaciones ?? "",
    b.modalidades ?? "",
    b.otros ?? ""
  );
  return NextResponse.json(db.prepare("SELECT * FROM filtros WHERE id = 1").get());
}
