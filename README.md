# AutoJob 🎯

Aplicación web local para llevar el registro de tus candidaturas de empleo, gestionar tus versiones de CV y validar automáticamente si una oferta encaja con tus criterios — **100% gratuita y sin servicios externos**: todo se guarda y analiza en tu ordenador.

## Funcionalidades

- **📋 Candidaturas** — registra cada oferta a la que aplicas con empresa, puesto, URL, salario, estado (guardada → enviada → entrevista → oferta / rechazada) y el CV que enviaste. Incluye estadísticas (total, enviadas, entrevistas, tasa de respuesta) y búsqueda/filtrado.
- **📄 Mis CVs** — sube tus distintas versiones de CV (PDF/DOCX), etiquétalas y asígnalas a cada candidatura para saber siempre cuál enviaste.
- **🎯 Validar oferta** — pega el texto de una oferta y el motor local la puntúa de 0 a 100 según tus filtros:
  - Palabras clave requeridas (40%)
  - Palabras excluidas (20%)
  - Salario mínimo — detecta salarios en el texto: `30.000€`, `30k-40k`, `banda salarial…` (20%)
  - Modalidad remoto/híbrido/presencial (10%)
  - Ubicación (10%)

  Los criterios que la oferta no menciona no puntúan ni penalizan. Desde el resultado puedes registrar la candidatura con un clic.
- **⚙️ Filtros** — configura tus criterios una vez y reutilízalos en todas las validaciones.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · SQLite (better-sqlite3)

Los datos viven en `data/autojob.db` y los CVs en `data/cvs/` (carpeta ignorada por git).

## Uso

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Producción local

```bash
npm run build
npm start
```
