import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
export const CVS_DIR = path.join(DATA_DIR, "cvs");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  fs.mkdirSync(CVS_DIR, { recursive: true });
  db = new Database(path.join(DATA_DIR, "autojob.db"));
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS cvs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      archivo TEXT NOT NULL,
      etiquetas TEXT NOT NULL DEFAULT '',
      notas TEXT NOT NULL DEFAULT '',
      creado_en TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS candidaturas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa TEXT NOT NULL,
      puesto TEXT NOT NULL,
      url TEXT NOT NULL DEFAULT '',
      ubicacion TEXT NOT NULL DEFAULT '',
      modalidad TEXT NOT NULL DEFAULT '',
      salario TEXT NOT NULL DEFAULT '',
      estado TEXT NOT NULL DEFAULT 'guardada',
      cv_id INTEGER REFERENCES cvs(id) ON DELETE SET NULL,
      texto_oferta TEXT NOT NULL DEFAULT '',
      puntuacion INTEGER,
      notas TEXT NOT NULL DEFAULT '',
      fecha_envio TEXT,
      creado_en TEXT NOT NULL DEFAULT (datetime('now')),
      actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS filtros (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      palabras_clave TEXT NOT NULL DEFAULT '',
      palabras_excluidas TEXT NOT NULL DEFAULT '',
      salario_minimo INTEGER,
      ubicaciones TEXT NOT NULL DEFAULT '',
      modalidades TEXT NOT NULL DEFAULT '',
      otros TEXT NOT NULL DEFAULT ''
    );

    INSERT OR IGNORE INTO filtros (id) VALUES (1);
  `);

  return db;
}
