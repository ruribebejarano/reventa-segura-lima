import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { TARIFA_GARANTIA, calcularTope } from '@/data/rules';
import {
  SEED_EVENTS,
  SEED_LISTINGS,
  SEED_MY_LISTINGS,
  SEED_ORDERS,
  SEED_USER,
  SEED_VERSION,
  precioOriginalDe,
} from '@/data/seed';
import type {
  Event,
  Listing,
  MomentoConfianza,
  MyListing,
  NivelConfianza,
  Order,
  TestEvent,
  User,
} from '@/data/types';

/** Milisegundos que tarda un reembolso simulado en completarse. */
export const DEMORA_REEMBOLSO_MS = 4000;

export type DatosOferta = {
  eventId: string;
  zona: string;
  codigo: string;
  precio: number;
};

export type ResultadoPublicar =
  | { ok: true; oferta: MyListing }
  | { ok: false; error: string };

type DataState = {
  user: User | null;
  /** Cuentas creadas en este dispositivo (sin contraseñas: el login es simulado). */
  cuentas: User[];
  events: Event[];
  listings: Listing[];
  orders: Order[];
  myListings: MyListing[];
  /** Ofertas que el usuario ya verificó con éxito: solo esas pueden pagarse. */
  verificadas: string[];
  modoPrueba: boolean;
  testEvents: TestEvent[];
  confianza: Partial<Record<MomentoConfianza, NivelConfianza>>;
};

type Actions = {
  login: (user: User) => void;
  loginDemo: () => void;
  /** Guarda la cuenta (sin contraseña) para poder volver a ingresar con su correo. */
  registrarCuenta: (user: User) => void;
  marcarVerificada: (listingId: string) => void;
  /** Busca una cuenta por correo: las creadas aquí y la de Ana (demo). */
  buscarCuenta: (email: string) => User | undefined;
  logout: () => void;
  /** Compra la oferta y devuelve la orden. null si no hay sesión o la oferta ya no está disponible. */
  comprar: (listingId: string) => Order | null;
  simularIngreso: (orderId: string) => void;
  reportarProblema: (orderId: string) => void;
  publicarOferta: (datos: DatosOferta) => ResultadoPublicar;
  resetDemo: () => void;
  setModoPrueba: (activo: boolean) => void;
  registrarEvento: (tipo: string, pantalla: string) => void;
  limpiarEventos: () => void;
  setConfianza: (momento: MomentoConfianza, nivel: NivelConfianza) => void;
};

export type AppState = DataState & Actions;

function estadoInicial(): DataState {
  // structuredClone evita que las mutaciones del store toquen las constantes del seed.
  return {
    user: null,
    cuentas: [],
    events: structuredClone(SEED_EVENTS),
    listings: structuredClone(SEED_LISTINGS),
    orders: structuredClone(SEED_ORDERS),
    myListings: structuredClone(SEED_MY_LISTINGS),
    verificadas: [],
    modoPrueba: false,
    testEvents: [],
    confianza: {},
  };
}

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O ni 1/I para evitar confusiones

function nuevoId(largo = 6): string {
  let id = '';
  for (let i = 0; i < largo; i++) id += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  return id;
}

const timersReembolso = new Map<string, ReturnType<typeof setTimeout>>();

function cancelarTimers() {
  timersReembolso.forEach(clearTimeout);
  timersReembolso.clear();
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const actualizarOrden = (orderId: string, cambios: Partial<Order>) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, ...cambios } : o)) }));

      return {
        ...estadoInicial(),

        login: (user) => set({ user }),
        loginDemo: () => set({ user: structuredClone(SEED_USER) }),
        logout: () => set({ user: null }),

        registrarCuenta: (user) =>
          set((s) => ({
            cuentas: [...s.cuentas.filter((c) => c.email !== user.email), user],
          })),

        marcarVerificada: (listingId) =>
          set((s) => (s.verificadas.includes(listingId) ? s : { verificadas: [...s.verificadas, listingId] })),

        buscarCuenta: (email) => {
          const e = email.trim().toLowerCase();
          if (e === SEED_USER.email) return structuredClone(SEED_USER);
          return get().cuentas.find((c) => c.email === e);
        },

        comprar: (listingId) => {
          const { user, listings, orders } = get();
          const listing = listings.find((l) => l.id === listingId);
          if (!user || !listing || listing.estado !== 'disponible') return null;

          const ids = new Set(orders.map((o) => o.id));
          let id = nuevoId();
          while (ids.has(id)) id = nuevoId();

          const order: Order = {
            id,
            listingId: listing.id,
            eventId: listing.eventId,
            zona: listing.zona,
            precioEntrada: listing.precio,
            tarifaGarantia: TARIFA_GARANTIA,
            total: listing.precio + TARIFA_GARANTIA,
            titular: user.nombre,
            dniMasked: user.dniMasked,
            qr: `RV-${id}-${user.dni.slice(-4)}`,
            estadoPago: 'retenido',
            estadoEntrada: 'emitida',
            creadaEn: new Date().toISOString(),
          };

          set((s) => ({
            orders: [order, ...s.orders],
            listings: s.listings.map((l) => (l.id === listingId ? { ...l, estado: 'vendida' } : l)),
          }));
          return order;
        },

        simularIngreso: (orderId) => {
          const order = get().orders.find((o) => o.id === orderId);
          if (!order || order.estadoEntrada !== 'emitida' || order.estadoPago !== 'retenido') return;
          actualizarOrden(orderId, { estadoPago: 'liberado', estadoEntrada: 'usada' });
        },

        reportarProblema: (orderId) => {
          const order = get().orders.find((o) => o.id === orderId);
          if (!order || order.estadoPago !== 'retenido') return;

          actualizarOrden(orderId, { estadoPago: 'reembolso_en_proceso' });
          const timer = setTimeout(() => {
            timersReembolso.delete(orderId);
            const actual = get().orders.find((o) => o.id === orderId);
            if (actual?.estadoPago !== 'reembolso_en_proceso') return;
            // La entrada reemitida queda anulada al devolver el dinero.
            actualizarOrden(orderId, { estadoPago: 'reembolsado', estadoEntrada: 'anulada' });
          }, DEMORA_REEMBOLSO_MS);
          timersReembolso.set(orderId, timer);
        },

        publicarOferta: ({ eventId, zona, codigo, precio }) => {
          const original = precioOriginalDe(get().events, eventId, zona);
          if (original === undefined) return { ok: false, error: 'Elige un evento y una zona válidos.' };

          const codigoLimpio = codigo.trim().toUpperCase();
          if (codigoLimpio.length < 4) return { ok: false, error: 'Ingresa el código de tu entrada.' };
          if (get().myListings.some((m) => m.codigo === codigoLimpio)) {
            return { ok: false, error: 'Ya publicaste una entrada con ese código.' };
          }

          const tope = calcularTope(original);
          if (!Number.isFinite(precio) || precio <= 0) return { ok: false, error: 'Ingresa un precio válido.' };
          if (precio > tope) {
            return { ok: false, error: `El precio máximo para ${zona} es S/ ${tope} (150 % del original).` };
          }

          const oferta: MyListing = {
            id: `m-${nuevoId()}`,
            eventId,
            zona,
            codigo: codigoLimpio,
            precio: Math.round(precio),
            estado: 'publicada',
          };
          set((s) => ({ myListings: [oferta, ...s.myListings] }));
          return { ok: true, oferta };
        },

        resetDemo: () => {
          cancelarTimers();
          // Conservamos la sesión, las cuentas y el modo prueba; los datos vuelven al seed.
          const { user, cuentas, modoPrueba } = get();
          set({ ...estadoInicial(), user, cuentas, modoPrueba });
        },

        setModoPrueba: (activo) => set({ modoPrueba: activo }),

        registrarEvento: (tipo, pantalla) => {
          if (!get().modoPrueba) return;
          set((s) => ({ testEvents: [...s.testEvents, { tipo, pantalla, t: Date.now() }] }));
        },

        limpiarEventos: () => set({ testEvents: [], confianza: {} }),

        setConfianza: (momento, nivel) => {
          const n = Math.min(5, Math.max(1, Math.round(nivel))) as NivelConfianza;
          set((s) => ({ confianza: { ...s.confianza, [momento]: n } }));
        },
      };
    },
    {
      name: 'reventa-verificada',
      storage: createJSONStorage(() => AsyncStorage),
      version: SEED_VERSION,
      partialize: (s): DataState => ({
        user: s.user,
        cuentas: s.cuentas,
        events: s.events,
        listings: s.listings,
        orders: s.orders,
        myListings: s.myListings,
        verificadas: s.verificadas,
        modoPrueba: s.modoPrueba,
        testEvents: s.testEvents,
        confianza: s.confianza,
      }),
      // Si cambió SEED_VERSION, descartamos los datos guardados y volvemos al seed (conservando la sesión).
      migrate: (persisted) => {
        const anterior = persisted as Partial<DataState> | undefined;
        return { ...estadoInicial(), user: anterior?.user ?? null, cuentas: anterior?.cuentas ?? [] } as AppState;
      },
      onRehydrateStorage: () => (state) => {
        // Un reembolso que quedó "en proceso" al cerrar la app se completa al volver a abrirla.
        if (!state) return;
        const pendientes = state.orders.some((o) => o.estadoPago === 'reembolso_en_proceso');
        if (pendientes) {
          useAppStore.setState({
            orders: state.orders.map((o) =>
              o.estadoPago === 'reembolso_en_proceso'
                ? { ...o, estadoPago: 'reembolsado', estadoEntrada: 'anulada' }
                : o,
            ),
          });
        }
      },
    },
  ),
);
