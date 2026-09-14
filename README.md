# AutoJob 🎯

> **EN:** Local job-search tracker and offer scorer. Pulls offers from LinkedIn (public guest listing), Tecnoempleo, Remotive, RemoteOK and Arbeitnow (plus InfoJobs, Adzuna and Jooble with free API keys), scores each one 0–100 against your own filters (keywords, salary parsing, remote/hybrid, location), and tracks every application with the CV version you sent. Next.js 16 · React 19 · TypeScript · Tailwind 4 · SQLite. Everything runs and stays on your machine: no accounts, no external services, it never applies on your behalf. Docs below are in Spanish.

Aplicación web local para llevar el registro de tus candidaturas de empleo, gestionar tus versiones de CV y validar automáticamente si una oferta encaja con tus criterios — **100% gratuita y sin servicios externos**: todo se guarda y analiza en tu ordenador.

## Funcionalidades

- **📡 Ofertas** — trae ofertas automáticamente de varias plataformas, las puntúa con tus filtros y las ordena por encaje. Cuando eches una, márcala «✓ Aplicada» y se guarda como candidatura enviada con su CV y fecha.

  | Fuente | Ámbito | Configuración |
  |---|---|---|
  | LinkedIn | España (listado público de invitados, experimental) | Ninguna |
  | Tecnoempleo | España, empleo tech | Ninguna |
  | Remotive / RemoteOK / Arbeitnow | Remoto internacional / Europa | Ninguna |
  | InfoJobs | España (API oficial) | Claves gratis en [developer.infojobs.net](https://developer.infojobs.net) |
  | Adzuna | España y más (agregador) | Claves gratis en [developer.adzuna.com](https://developer.adzuna.com) |
  | Jooble | España y más (agregador) | Clave gratis en [jooble.org/api/about](https://jooble.org/api/about) |

  La fuente de LinkedIn usa el listado público sin iniciar sesión (no toca tu cuenta ni tus cookies); puede dejar de funcionar si LinkedIn cambia el HTML o limita la IP. JobToday no tiene API ni feed público, pero sus ofertas suelen aparecer vía Jooble/Adzuna. La app nunca aplica automáticamente por ti: tú abres la oferta y aplicas tú.

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
