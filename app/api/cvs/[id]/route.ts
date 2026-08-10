import { NextRequest, NextResponse } from "next/server";
import { getDb, CVS_DIR } from "@/lib/db";
import fs from "fs";
import path from "path";
import type { Cv } from "@/lib/types";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/cvs/[id]">) {
  const { id } = await ctx.params;
  const body = await req.json();
  const db = getDb();

  const cv = db.prepare("SELECT * FROM cvs WHERE id = ?").get(id) as Cv | undefined;
  if (!cv) return NextResponse.json({ error: "No existe" }, { status: 404 });

  db.prepare("UPDATE cvs SET nombre = ?, etiquetas = ?, notas = ? WHERE id = ?").run(
    body.nombre ?? cv.nombre,
    body.etiquetas ?? cv.etiquetas,
    body.notas ?? cv.notas,
    id
  );
  return NextResponse.json(db.prepare("SELECT * FROM cvs WHERE id = ?").get(id));
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/cvs/[id]">) {
  const { id } = await ctx.params;
  const db = getDb();

  const cv = db.prepare("SELECT * FROM cvs WHERE id = ?").get(id) as Cv | undefined;
  if (!cv) return NextResponse.json({ error: "No existe" }, { status: 404 });

  const ruta = path.join(CVS_DIR, cv.archivo);
  if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
  db.prepare("DELETE FROM cvs WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
