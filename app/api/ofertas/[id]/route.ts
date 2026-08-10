import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface Oferta {
  id: number;
  fuente: string;
  titulo: string;
  empresa: string;
  ubicacion: string;
  url: string;
  descripcion: string;
  salario_texto: string;
  puntuacion: number | null;
  estado: string;
}

/** Cambia el estado de una oferta. Con accion "aplicar" o "guardar" crea además la candidatura. */
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/ofertas/[id]">) {
  const { id } = await ctx.params;
  const b = await req.json();
  const db = getDb();

  const oferta = db.prepare("SELECT * FROM ofertas WHERE id = ?").get(id) as Oferta | undefined;
  if (!oferta) return NextResponse.json({ error: "No existe" }, { status: 404 });

  if (b.accion === "descartar") {
    db.prepare("UPDATE ofertas SET estado = 'descartada' WHERE id = ?").run(id);
    return NextResponse.json({ ok: true });
  }

  if (b.accion === "aplicar" || b.accion === "guardar") {
    const estadoCandidatura = b.accion === "aplicar" ? "enviada" : "guardada";
    db.prepare(
      `INSERT INTO candidaturas
        (empresa, puesto, url, ubicacion, salario, estado, cv_id, texto_oferta, puntuacion, notas, fecha_envio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      oferta.empresa || oferta.fuente,
      oferta.titulo,
      oferta.url,
      oferta.ubicacion,
      oferta.salario_texto,
      estadoCandidatura,
      b.cv_id ?? null,
      oferta.descripcion,
      oferta.puntuacion,
      `Origen: ${oferta.fuente}`,
      estadoCandidatura === "enviada" ? new Date().toISOString().slice(0, 10) : null
    );
    db.prepare("UPDATE ofertas SET estado = 'gestionada' WHERE id = ?").run(id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
