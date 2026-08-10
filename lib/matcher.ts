import type { Filtros, MatchCheck, MatchResultado } from "./types";

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function separarLista(csv: string): string[] {
  return csv
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Convierte "30.000", "30k", "30,5k" o "30000" en un número de euros anuales. */
function parsearCantidad(bruto: string): number {
  const esK = /k/i.test(bruto);
  let limpio = bruto.replace(/k/i, "").trim();
  // Punto o coma como separador de miles (30.000) vs decimal (30,5)
  if (/^\d{1,3}([.,]\d{3})+$/.test(limpio)) {
    limpio = limpio.replace(/[.,]/g, "");
  } else {
    limpio = limpio.replace(",", ".");
  }
  let n = parseFloat(limpio);
  if (isNaN(n)) return 0;
  if (esK) n *= 1000;
  // "30" o "45" a secas en contexto salarial casi siempre son miles
  if (n > 0 && n < 1000) n *= 1000;
  return Math.round(n);
}

/** Busca salarios en el texto de la oferta. Devuelve [min, max] o null. */
export function detectarSalario(texto: string): [number, number] | null {
  const t = texto.toLowerCase();
  const patrones = [
    // Rango: 30.000 - 40.000 €, 30k-40k, entre 30 y 40k
    /(\d[\d.,]*\s*k?)\s*(?:€|eur(?:os)?)?\s*(?:-|–|a|y)\s*(\d[\d.,]*\s*k?)\s*(?:€|eur(?:os)?|bruto|anual)/gi,
    // Cantidad única con símbolo: 35.000€, 35k €, €35.000
    /(\d[\d.,]*\s*k?)\s*(?:€|eur(?:os)?)/gi,
    /(?:€)\s*(\d[\d.,]*\s*k?)/gi,
    // "salario: 35000", "banda salarial 35.000"
    /(?:salario|banda salarial|retribuci[oó]n|sueldo)[^\d]{0,20}(\d[\d.,]*\s*k?)/gi,
  ];

  for (const patron of patrones) {
    const m = patron.exec(t);
    if (!m) continue;
    const a = parsearCantidad(m[1]);
    const b = m[2] ? parsearCantidad(m[2]) : a;
    const min = Math.min(a, b);
    const max = Math.max(a, b);
    // Descarta falsos positivos (años, porcentajes pequeños...)
    if (max >= 8000 && max <= 500000) return [min, max];
  }
  return null;
}

/** Detecta la modalidad de trabajo mencionada en la oferta. */
export function detectarModalidad(texto: string): string | null {
  const t = normalizar(texto);
  if (/(100\s*%\s*remoto|full\s*remote|totalmente remoto|teletrabajo total|remote[- ]first)/.test(t)) return "remoto";
  if (/(hibrido|hybrid|mixto|\d\s*dias?\s*(en\s*)?(la\s*)?oficina)/.test(t)) return "hibrido";
  if (/(remoto|remote|teletrabajo|en remoto|trabajo a distancia)/.test(t)) return "remoto";
  if (/(presencial|on[- ]?site|en oficina|oficina de)/.test(t)) return "presencial";
  return null;
}

export function evaluarOferta(textoOferta: string, filtros: Filtros): MatchResultado {
  const texto = normalizar(textoOferta);
  const checks: MatchCheck[] = [];

  // 1. Palabras clave requeridas (peso 40)
  const claves = separarLista(filtros.palabras_clave);
  if (claves.length > 0) {
    const encontradas = claves.filter((k) => texto.includes(normalizar(k)));
    const ratio = encontradas.length / claves.length;
    checks.push({
      criterio: "Palabras clave",
      estado: ratio >= 0.5 ? "ok" : "fallo",
      detalle:
        encontradas.length > 0
          ? `Encontradas ${encontradas.length}/${claves.length}: ${encontradas.join(", ")}`
          : `Ninguna de tus ${claves.length} palabras clave aparece en la oferta`,
      peso: Math.round(40 * ratio),
    });
  }

  // 2. Palabras excluidas (peso 20, penaliza)
  const excluidas = separarLista(filtros.palabras_excluidas);
  if (excluidas.length > 0) {
    const presentes = excluidas.filter((k) => texto.includes(normalizar(k)));
    checks.push({
      criterio: "Palabras excluidas",
      estado: presentes.length === 0 ? "ok" : "fallo",
      detalle:
        presentes.length === 0
          ? "La oferta no contiene ninguna palabra que quieras evitar"
          : `Contiene términos que excluyes: ${presentes.join(", ")}`,
      peso: presentes.length === 0 ? 20 : 0,
    });
  }

  // 3. Salario (peso 20)
  const salario = detectarSalario(textoOferta);
  let salarioDetectado: string | null = null;
  if (salario) {
    salarioDetectado =
      salario[0] === salario[1]
        ? `${salario[1].toLocaleString("es-ES")} €`
        : `${salario[0].toLocaleString("es-ES")} – ${salario[1].toLocaleString("es-ES")} €`;
  }
  if (filtros.salario_minimo) {
    if (salario) {
      const cumple = salario[1] >= filtros.salario_minimo;
      checks.push({
        criterio: "Salario",
        estado: cumple ? "ok" : "fallo",
        detalle: cumple
          ? `Detectado ${salarioDetectado}, alcanza tu mínimo de ${filtros.salario_minimo.toLocaleString("es-ES")} €`
          : `Detectado ${salarioDetectado}, por debajo de tu mínimo de ${filtros.salario_minimo.toLocaleString("es-ES")} €`,
        peso: cumple ? 20 : 0,
      });
    } else {
      checks.push({
        criterio: "Salario",
        estado: "desconocido",
        detalle: "La oferta no indica salario (no puntúa ni penaliza)",
        peso: 0,
      });
    }
  }

  // 4. Modalidad (peso 10)
  const modalidadDetectada = detectarModalidad(textoOferta);
  const modalidades = separarLista(filtros.modalidades).map(normalizar);
  if (modalidades.length > 0) {
    if (modalidadDetectada) {
      const cumple = modalidades.includes(modalidadDetectada);
      checks.push({
        criterio: "Modalidad",
        estado: cumple ? "ok" : "fallo",
        detalle: cumple
          ? `La oferta es "${modalidadDetectada}", compatible con tus preferencias`
          : `La oferta parece "${modalidadDetectada}" y tú buscas: ${modalidades.join(", ")}`,
        peso: cumple ? 10 : 0,
      });
    } else {
      checks.push({
        criterio: "Modalidad",
        estado: "desconocido",
        detalle: "No se menciona modalidad de trabajo (no puntúa ni penaliza)",
        peso: 0,
      });
    }
  }

  // 5. Ubicación (peso 10)
  const ubicaciones = separarLista(filtros.ubicaciones);
  if (ubicaciones.length > 0) {
    const remotoOk = modalidadDetectada === "remoto";
    const coincide = ubicaciones.find((u) => texto.includes(normalizar(u)));
    checks.push({
      criterio: "Ubicación",
      estado: coincide || remotoOk ? "ok" : "desconocido",
      detalle: coincide
        ? `Menciona "${coincide}", que está entre tus ubicaciones`
        : remotoOk
          ? "Es remoto, la ubicación no importa"
          : "No menciona ninguna de tus ubicaciones (no puntúa ni penaliza)",
      peso: coincide || remotoOk ? 10 : 0,
    });
  }

  // Puntuación: peso conseguido / peso máximo evaluable
  const pesoMaximo: Record<string, number> = {
    "Palabras clave": 40,
    "Palabras excluidas": 20,
    Salario: 20,
    Modalidad: 10,
    "Ubicación": 10,
  };
  let conseguido = 0;
  let posible = 0;
  for (const c of checks) {
    if (c.estado === "desconocido") continue;
    conseguido += c.peso;
    posible += pesoMaximo[c.criterio] ?? 0;
  }

  const puntuacion = posible > 0 ? Math.round((conseguido / posible) * 100) : 50;
  const veredicto = puntuacion >= 70 ? "encaja" : puntuacion >= 40 ? "dudoso" : "no_encaja";

  return {
    puntuacion,
    veredicto,
    checks,
    salario_detectado: salarioDetectado,
    modalidad_detectada: modalidadDetectada,
  };
}
