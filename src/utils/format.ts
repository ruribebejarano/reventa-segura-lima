const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
/** Lima está en UTC−5 todo el año (sin horario de verano). */
const OFFSET_LIMA_MS = -5 * 60 * 60 * 1000;

/** Partes de la fecha en hora de Lima, sin depender de la zona horaria del dispositivo ni de Intl. */
function enLima(iso: string) {
  const d = new Date(Date.parse(iso) + OFFSET_LIMA_MS);
  return { dia: d.getUTCDay(), fecha: d.getUTCDate(), mes: d.getUTCMonth(), hora: d.getUTCHours(), min: d.getUTCMinutes() };
}

/** "2026-11-14T21:00:00-05:00" → "Sáb 14 nov" */
export function formatFechaCorta(iso: string): string {
  const p = enLima(iso);
  return `${DIAS[p.dia]} ${p.fecha} ${MESES[p.mes]}`;
}

/** "2026-11-14T21:00:00-05:00" → "9:00 p. m." */
export function formatHora(iso: string): string {
  const { hora, min } = enLima(iso);
  const h12 = hora % 12 === 0 ? 12 : hora % 12;
  return `${h12}:${String(min).padStart(2, '0')} ${hora < 12 ? 'a. m.' : 'p. m.'}`;
}

/**
 * Formatea un monto en soles: formatSoles(220) → "S/ 220", formatSoles(1250.5) → "S/ 1,250.50".
 */
export function formatSoles(n: number): string {
  const hasCents = Math.round(n * 100) % 100 !== 0;
  const fixed = Math.abs(n).toFixed(hasCents ? 2 : 0);
  const [int, dec] = fixed.split('.');
  const withThousands = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${n < 0 ? '-' : ''}S/ ${withThousands}${dec ? `.${dec}` : ''}`;
}
