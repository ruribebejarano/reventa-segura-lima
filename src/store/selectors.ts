import { useShallow } from 'zustand/react/shallow';

import type { Event, Listing, Order } from '@/data/types';
import { useAppStore, type AppState } from './useAppStore';

type Datos = Pick<AppState, 'events' | 'listings' | 'orders'>;

/** Minúsculas y sin tildes: "Cóndores" coincide con "condores". */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

const porFecha = (a: Event, b: Event) => Date.parse(a.fechaISO) - Date.parse(b.fechaISO);

// ---------- Selectores puros (útiles fuera de React o en tests) ----------

/** Eventos cuyo artista, gira o recinto contienen el texto, ordenados por fecha. */
export function eventosFiltrados(s: Pick<Datos, 'events'>, texto = ''): Event[] {
  const q = normalizar(texto);
  const lista = q
    ? s.events.filter((e) => normalizar(`${e.artista} ${e.gira} ${e.recinto}`).includes(q))
    : s.events;
  return [...lista].sort(porFecha);
}

/** Ofertas disponibles de un evento (opcionalmente de una zona), de menor a mayor precio. */
export function ofertasPorEvento(s: Pick<Datos, 'listings'>, eventId: string, zona?: string): Listing[] {
  return s.listings
    .filter((l) => l.eventId === eventId && l.estado === 'disponible' && (!zona || l.zona === zona))
    .sort((a, b) => a.precio - b.precio);
}

function fechaEvento(s: Pick<Datos, 'events'>, o: Order): number {
  const e = s.events.find((ev) => ev.id === o.eventId);
  return e ? Date.parse(e.fechaISO) : 0;
}

/**
 * Entradas vigentes (aún no usadas ni anuladas), por fecha del evento.
 * Se decide por estado y no por fecha, para que la demo funcione en cualquier día.
 */
export function ordenesProximas(s: Pick<Datos, 'events' | 'orders'>): Order[] {
  return s.orders
    .filter((o) => o.estadoEntrada === 'emitida')
    .sort((a, b) => fechaEvento(s, a) - fechaEvento(s, b));
}

/** Entradas usadas o anuladas (reembolsadas), de la más reciente a la más antigua. */
export function ordenesPasadas(s: Pick<Datos, 'orders'>): Order[] {
  return s.orders
    .filter((o) => o.estadoEntrada !== 'emitida')
    .sort((a, b) => Date.parse(b.creadaEn) - Date.parse(a.creadaEn));
}

export function eventoPorId(s: Pick<Datos, 'events'>, id: string): Event | undefined {
  return s.events.find((e) => e.id === id);
}

/** Cantidad de ofertas disponibles por evento: { e1: 12, e2: 5, ... } */
export function conteoOfertas(s: Pick<Datos, 'listings'>): Record<string, number> {
  const conteo: Record<string, number> = {};
  for (const l of s.listings) {
    if (l.estado === 'disponible') conteo[l.eventId] = (conteo[l.eventId] ?? 0) + 1;
  }
  return conteo;
}

/** Título visible del evento: la gira si ya nombra al artista; si no, "Artista – Gira". */
export function tituloEvento(e: Pick<Event, 'artista' | 'gira'>): string {
  return normalizar(e.gira).includes(normalizar(e.artista)) ? e.gira : `${e.artista} – ${e.gira}`;
}

// ---------- Hooks (useShallow evita renders infinitos al devolver arrays nuevos) ----------

export const useEventosFiltrados = (texto = '') =>
  useAppStore(useShallow((s) => eventosFiltrados(s, texto)));

export const useOfertasPorEvento = (eventId: string, zona?: string) =>
  useAppStore(useShallow((s) => ofertasPorEvento(s, eventId, zona)));

export const useConteoOfertas = () => useAppStore(useShallow(conteoOfertas));

export const useOrdenesProximas =() => useAppStore(useShallow(ordenesProximas));

export const useOrdenesPasadas = () => useAppStore(useShallow(ordenesPasadas));

export const useEvento = (id: string) => useAppStore((s) => eventoPorId(s, id));

export const useOrden = (id: string) => useAppStore((s) => s.orders.find((o) => o.id === id));

export const useOferta = (id: string) => useAppStore((s) => s.listings.find((l) => l.id === id));
