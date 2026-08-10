import { NextRequest, NextResponse } from "next/server";
import { getDb, CVS_DIR } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET() {
  const db = getDb();
  const cvs = db.prepare("SELECT * FROM cvs ORDER BY creado_en DESC").all();
  return NextResponse.json(cvs);
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const archivo = form.get("archivo") as File | null;
  const nombre = (form.get("nombre") as string) || archivo?.name || "CV sin nombre";
  const etiquetas = (form.get("etiquetas") as string) || "";
  const notas = (form.get("notas") as string) || "";

  if (!archivo) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }

  const extension = path.extname(archivo.name) || ".pdf";
  const nombreArchivo = `${Date.now()}-${archivo.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const buffer = Buffer.from(await archivo.arrayBuffer());
  fs.writeFileSync(path.join(CVS_DIR, nombreArchivo), buffer);

  const db = getDb();
  const info = db
    .prepare("INSERT INTO cvs (nombre, archivo, etiquetas, notas) VALUES (?, ?, ?, ?)")
    .run(nombre, nombreArchivo, etiquetas, notas);

  const cv = db.prepare("SELECT * FROM cvs WHERE id = ?").get(info.lastInsertRowid);
  return NextResponse.json(cv, { status: 201 });
}
