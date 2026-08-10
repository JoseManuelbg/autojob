import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const filas = db
    .prepare(
      `SELECT c.*, cv.nombre AS cv_nombre
       FROM candidaturas c
       LEFT JOIN cvs cv ON cv.id = c.cv_id
       ORDER BY c.actualizado_en DESC`
    )
    .all();
  return NextResponse.json(filas);
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  if (!b.empresa || !b.puesto) {
    return NextResponse.json({ error: "Empresa y puesto son obligatorios" }, { status: 400 });
  }

  const db = getDb();
  const info = db
    .prepare(
      `INSERT INTO candidaturas
        (empresa, puesto, url, ubicacion, modalidad, salario, estado, cv_id, texto_oferta, puntuacion, notas, fecha_envio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      b.empresa,
      b.puesto,
      b.url ?? "",
      b.ubicacion ?? "",
      b.modalidad ?? "",
      b.salario ?? "",
      b.estado ?? "guardada",
      b.cv_id ?? null,
      b.texto_oferta ?? "",
      b.puntuacion ?? null,
      b.notas ?? "",
      b.estado === "enviada" ? new Date().toISOString().slice(0, 10) : null
    );

  const fila = db.prepare("SELECT * FROM candidaturas WHERE id = ?").get(info.lastInsertRowid);
  return NextResponse.json(fila, { status: 201 });
}
