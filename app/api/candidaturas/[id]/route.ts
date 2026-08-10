import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { Candidatura } from "@/lib/types";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/candidaturas/[id]">) {
  const { id } = await ctx.params;
  const b = await req.json();
  const db = getDb();

  const actual = db.prepare("SELECT * FROM candidaturas WHERE id = ?").get(id) as Candidatura | undefined;
  if (!actual) return NextResponse.json({ error: "No existe" }, { status: 404 });

  // Si pasa a "enviada" por primera vez, registra la fecha de envío
  let fechaEnvio = actual.fecha_envio;
  if (b.estado === "enviada" && !fechaEnvio) {
    fechaEnvio = new Date().toISOString().slice(0, 10);
  }

  db.prepare(
    `UPDATE candidaturas SET
      empresa = ?, puesto = ?, url = ?, ubicacion = ?, modalidad = ?, salario = ?,
      estado = ?, cv_id = ?, texto_oferta = ?, puntuacion = ?, notas = ?, fecha_envio = ?,
      actualizado_en = datetime('now')
     WHERE id = ?`
  ).run(
    b.empresa ?? actual.empresa,
    b.puesto ?? actual.puesto,
    b.url ?? actual.url,
    b.ubicacion ?? actual.ubicacion,
    b.modalidad ?? actual.modalidad,
    b.salario ?? actual.salario,
    b.estado ?? actual.estado,
    b.cv_id !== undefined ? b.cv_id : actual.cv_id,
    b.texto_oferta ?? actual.texto_oferta,
    b.puntuacion !== undefined ? b.puntuacion : actual.puntuacion,
    b.notas ?? actual.notas,
    fechaEnvio,
    id
  );

  return NextResponse.json(db.prepare("SELECT * FROM candidaturas WHERE id = ?").get(id));
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/candidaturas/[id]">) {
  const { id } = await ctx.params;
  const db = getDb();
  const info = db.prepare("DELETE FROM candidaturas WHERE id = ?").run(id);
  if (info.changes === 0) return NextResponse.json({ error: "No existe" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
