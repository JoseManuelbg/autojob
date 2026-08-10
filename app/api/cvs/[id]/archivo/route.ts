import { NextRequest, NextResponse } from "next/server";
import { getDb, CVS_DIR } from "@/lib/db";
import fs from "fs";
import path from "path";
import type { Cv } from "@/lib/types";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/cvs/[id]/archivo">) {
  const { id } = await ctx.params;
  const db = getDb();
  const cv = db.prepare("SELECT * FROM cvs WHERE id = ?").get(id) as Cv | undefined;
  if (!cv) return NextResponse.json({ error: "No existe" }, { status: 404 });

  const ruta = path.join(CVS_DIR, cv.archivo);
  if (!fs.existsSync(ruta)) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  const buffer = fs.readFileSync(ruta);
  const ext = path.extname(cv.archivo).toLowerCase();
  const tipo =
    ext === ".pdf"
      ? "application/pdf"
      : ext === ".docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/octet-stream";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": tipo,
      "Content-Disposition": `inline; filename="${encodeURIComponent(cv.nombre + ext)}"`,
    },
  });
}
