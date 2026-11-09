import type { MomentoConfianza, NivelConfianza, TestEvent } from '@/data/types';

/** Nombres legibles de las pantallas registradas con registrarEvento('vista', …). */
const NOMBRES_PANTALLA: Record<string, string> = {
  inicio: 'Inicio',
  ofertas: 'Ofertas del evento',
  detalle: 'Detalle de la entrada',
  verificacion: 'Verificación',
  pago: 'Pago',
  confirmacion: 'Confirmación',
  entradas: 'Mis entradas',
  entrada: 'Tu entrada',
  reporte: 'Reporte de problema',
  vender: 'Vender',
  perfil: 'Perfil',
};

/** Una visita más corta que esto se considera un salto automático, no una visita real. */
const VISITA_MINIMA_MS = 300;

export const nombrePantalla =(p: string) => NOMBRES_PANTALLA[p] ?? p;

export type ResumenSesion = {
  hayDatos: boolean;
  inicio?: number;
  /** ¿Tocó "Verificar antes de pagar" antes de completar el pago (o sin llegar a pagar)? */
  verificoAntesDePagar: boolean;
  pago: boolean;
  /** Resultado visto en la pantalla de verificación, si llegó. */
  resultadoVerificacion?: 'ok' | 'falla';
  totalMs: number;
  porPantalla: { pantalla: string; ms: number; visitas: number }[];
  confianzaAntes?: NivelConfianza;
  confianzaDespues?: NivelConfianza;
};

/**
 * Resume los eventos de la sesión de prueba.
 * El tiempo de cada pantalla va desde su 'vista' hasta la siguiente 'vista'.
 * Las visitas a Perfil (donde el facilitador mira los resultados) no cuentan en los tiempos.
 */
export function resumirSesion(
  eventos: TestEvent[],
  confianza: Partial<Record<MomentoConfianza, NivelConfianza>>,
): ResumenSesion {
  const ev = [...eventos].sort((a, b) => a.t - b.t);
  const primero = (tipo: string) => ev.find((e) => e.tipo === tipo)?.t;

  const tPago = primero('pago_completado');
  const tVerificar = primero('tap_verificar');
  const verificoAntesDePagar = tVerificar !== undefined && (tPago === undefined || tVerificar < tPago);

  const ultimoResultado = ev.filter((e) => e.tipo === 'resultado_ok' || e.tipo === 'resultado_falla').pop();

  const vistas = ev.filter((e) => e.tipo === 'vista');
  const ultimoT = ev.length ? ev[ev.length - 1].t : 0;
  const acumulado = new Map<string, { ms: number; visitas: number }>();
  vistas.forEach((v, i) => {
    if (v.pantalla === 'perfil') return;
    const fin = i + 1 < vistas.length ? vistas[i + 1].t : ultimoT;
    const ms = Math.max(0, fin - v.t);
    // Pantallas que solo "pasan" (p. ej. Inicio antes de que el enlace de prueba salte al evento) no son visitas.
    if (i + 1 < vistas.length && ms < VISITA_MINIMA_MS) return;
    const prev = acumulado.get(v.pantalla) ?? { ms: 0, visitas: 0 };
    acumulado.set(v.pantalla, { ms: prev.ms + ms, visitas: prev.visitas + 1 });
  });
  const porPantalla = [...acumulado.entries()].map(([pantalla, d]) => ({ pantalla, ...d }));

  return {
    hayDatos: ev.length > 0,
    inicio: ev[0]?.t,
    verificoAntesDePagar,
    pago: tPago !== undefined,
    resultadoVerificacion: ultimoResultado ? (ultimoResultado.tipo === 'resultado_ok' ? 'ok' : 'falla') : undefined,
    totalMs: porPantalla.reduce((s, p) => s + p.ms, 0),
    porPantalla,
    confianzaAntes: confianza.antes,
    confianzaDespues: confianza.despues,
  };
}

/** 83000 → "1 min 23 s"; 9000 → "9 s" */
export function formatDuracion(ms: number): string {
  const s = Math.round(ms / 1000);
  const min = Math.floor(s / 60);
  const seg = s % 60;
  return min > 0 ? `${min} min ${seg} s` : `${seg} s`;
}

/** "2 → 5 (+3)", "2 → —" o "—" */
export function formatConfianza(antes?: number, despues?: number): string {
  if (antes === undefined && despues === undefined) return '—';
  const delta = antes !== undefined && despues !== undefined ? despues - antes : undefined;
  const signo = delta === undefined ? '' : delta > 0 ? ` (+${delta})` : delta < 0 ? ` (${delta})` : ' (sin cambio)';
  return `${antes ?? '—'} → ${despues ?? '—'}${signo}`;
}

/** Fecha y hora de Lima (UTC−5): "09/11/2026 21:15" */
function fechaHoraLima(t: number): string {
  const d = new Date(t - 5 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

/** Texto plano para pegar en el Experiment Board. */
export function textoResultados(r: ResumenSesion, eventos: TestEvent[], participante?: string): string {
  const si = (b: boolean) => (b ? 'Sí' : 'No');
  const ev = [...eventos].sort((a, b) => a.t - b.t);
  const t0 = ev[0]?.t ?? 0;
  const rel = (t: number) => {
    const s = Math.round((t - t0) / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  const lineas = [
    'Reventa Verificada · Sesión de prueba (Lab5)',
    `Fecha: ${r.inicio ? fechaHoraLima(r.inicio) : '—'}`,
    `Cuenta usada: ${participante ?? '—'}`,
    '',
    `Tocó "Verificar" antes de pagar: ${si(r.verificoAntesDePagar)}`,
    `Completó el pago: ${si(r.pago)}`,
    'Completó el pago sin ayuda: ___ (lo anota el observador)',
    `Resultado de la verificación: ${r.resultadoVerificacion === 'ok' ? 'Verificada' : r.resultadoVerificacion === 'falla' ? 'Falló' : '—'}`,
    `Confianza antes → después: ${formatConfianza(r.confianzaAntes, r.confianzaDespues)}`,
    '',
    `Tiempo total: ${formatDuracion(r.totalMs)}`,
    'Tiempo por pantalla:',
    ...r.porPantalla.map(
      (p) => `- ${nombrePantalla(p.pantalla)}: ${formatDuracion(p.ms)}${p.visitas > 1 ? ` (${p.visitas} visitas)` : ''}`,
    ),
    '',
    'Eventos:',
    ...ev.map((e) => `${rel(e.t)}  ${e.tipo} · ${nombrePantalla(e.pantalla)}`),
  ];
  return lineas.join('\n');
}
