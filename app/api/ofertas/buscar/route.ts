import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { leerAjustes } from "@/lib/ajustes";
import { buscarEnTodas } from "@/lib/fuentes";
import { evaluarOferta } from "@/lib/matcher";
import type { Filtros } from "@/lib/types";

export async function POST() {
  const ajustes = leerAjustes();
  if (!ajustes.consulta.trim()) {
    return NextResponse.json(
      { error: "Configura qué buscar (ej. «desarrollador frontend») en la pestaña Filtros" },
      { status: 400 }
    );
  }

  const db = getDb();
  const filtros = db.prepare("SELECT * FROM filtros WHERE id = 1").get() as Filtros;
  const resultados = await buscarEnTodas(ajustes);

  const insertar = db.prepare(
    `INSERT INTO ofertas
      (fuente, id_externo, titulo, empresa, ubicacion, url, descripcion, salario_texto, fecha_publicacion, puntuacion)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(fuente, id_externo) DO UPDATE SET puntuacion = excluded.puntuacion
     WHERE ofertas.estado = 'nueva'`
  );

  const contar = db.prepare("SELECT COUNT(*) AS n FROM ofertas");
  const antes = (contar.get() as { n: number }).n;

  const resumen = resultados.map((r) => {
    for (const o of r.ofertas) {
      // Solo se puntúa si hay descripción suficiente; si no, queda sin nota
      const texto = `${o.titulo}\n${o.empresa}\n${o.ubicacion}\n${o.salario_texto}\n${o.descripcion}`;
      const puntuacion = o.descripcion.length >= 40 ? evaluarOferta(texto, filtros).puntuacion : null;
      insertar.run(
        o.fuente,
        o.id_externo,
        o.titulo,
        o.empresa,
        o.ubicacion,
        o.url,
        o.descripcion,
        o.salario_texto,
        o.fecha_publicacion,
        puntuacion
      );
    }
    return { fuente: r.fuente, encontradas: r.ofertas.length, error: r.error };
  });

  const nuevas = (contar.get() as { n: number }).n - antes;

  return NextResponse.json({ resumen, nuevas });
}
