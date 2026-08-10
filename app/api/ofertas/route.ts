import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const estado = req.nextUrl.searchParams.get("estado") ?? "nueva";
  const db = getDb();
  const filas = db
    .prepare(
      `SELECT * FROM ofertas WHERE estado = ?
       ORDER BY puntuacion IS NULL, puntuacion DESC, fecha_publicacion DESC`
    )
    .all(estado);
  return NextResponse.json(filas);
}
