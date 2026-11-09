import { TARIFA_GARANTIA, calcularTope } from './rules';
import type { Event, Listing, MyListing, Order, User, Vendedor } from './types';

/**
 * Súbelo cada vez que cambies estos datos: el store detecta la diferencia
 * al abrir la app y reinicia el estado guardado con el seed nuevo.
 */
export const SEED_VERSION = 2;

export const SEED_USER: User = {
  id: 'u1',
  nombre: 'Ana Torres',
  dni: '70124512',
  dniMasked: '••••4512',
  email: 'ana.torres@demo.pe',
  dniVerificado: true,
};

export const SEED_EVENTS: Event[] = [
  {
    id: 'e1',
    artista: 'Aurora',
    gira: 'Gira Aurora 2026',
    recinto: 'Estadio Nacional',
    ciudad: 'Lima',
    fechaISO: '2026-11-14T21:00:00-05:00',
    estadoVenta: 'preventa_agotada',
    zonas: [
      { nombre: 'Campo A', precioOriginal: 150 },
      { nombre: 'Campo B', precioOriginal: 150 },
      { nombre: 'Tribuna Occidente', precioOriginal: 280 },
      { nombre: 'Tribuna Oriente', precioOriginal: 220 },
    ],
  },
  {
    id: 'e2',
    artista: 'Neón Pacífico',
    gira: 'Tour Marea',
    recinto: 'Arena 1 (San Miguel)',
    ciudad: 'Lima',
    fechaISO: '2026-11-27T21:00:00-05:00',
    estadoVenta: 'preventa_agotada',
    zonas: [{ nombre: 'Campo', precioOriginal: 180 }],
  },
  {
    id: 'e3',
    artista: 'Los Cóndores del Sur',
    gira: 'Raíces en Vivo',
    recinto: 'Estadio San Marcos',
    ciudad: 'Lima',
    fechaISO: '2026-12-12T20:00:00-05:00',
    estadoVenta: 'venta_general',
    zonas: [{ nombre: 'General', precioOriginal: 120 }],
  },
  {
    id: 'e4',
    artista: 'Festival Lima Sonora',
    gira: 'Festival Lima Sonora 2027',
    recinto: 'Costa 21',
    ciudad: 'Lima',
    fechaISO: '2027-02-20T16:00:00-05:00',
    estadoVenta: 'preventa_agotada',
    zonas: [{ nombre: 'General', precioOriginal: 250 }],
  },
];

export function precioOriginalDe(events: Event[], eventId: string, zona: string): number | undefined {
  return events.find((e) => e.id === eventId)?.zonas.find((z) => z.nombre === zona)?.precioOriginal;
}

type OfertaSemilla = [zona: string, precio: number, vendedor: string, ventas: number, verificacionFalla?: boolean];

function crearOfertas(eventId: string, prefijo: string, ofertas: OfertaSemilla[]): Listing[] {
  return ofertas.map(([zona, precio, nombre, ventas, verificacionFalla], i) => {
    const precioOriginal = precioOriginalDe(SEED_EVENTS, eventId, zona);
    if (precioOriginal === undefined) {
      throw new Error(`Seed: la zona "${zona}" no existe en ${eventId}`);
    }
    const tope = calcularTope(precioOriginal);
    if (precio > tope) {
      throw new Error(`Seed: ${prefijo}${i + 1} (${zona}) cuesta S/ ${precio} y supera el tope S/ ${tope}`);
    }
    const vendedor: Vendedor = { nombre, dniVerificado: true, ventas };
    const listing: Listing = {
      id: `${prefijo}${i + 1}`,
      eventId,
      zona,
      precio,
      precioOriginal,
      tope,
      vendedor,
      estado: 'disponible',
    };
    if (verificacionFalla) listing.verificacionFalla = true;
    return listing;
  });
}

export const SEED_LISTINGS: Listing[] = [
  // e1 · Gira Aurora 2026 — tope Campo 225, Occidente 420, Oriente 330
  ...crearOfertas('e1', 'l1-', [
    ['Campo B', 220, 'Diego R.', 4],
    ['Campo A', 210, 'María P.', 7],
    ['Campo B', 225, 'Luis G.', 2],
    ['Campo A', 195, 'Carla M.', 9],
    ['Campo B', 200, 'Jorge V.', 3],
    ['Campo A', 225, 'Rosa Q.', 5],
    ['Tribuna Occidente', 400, 'Andrés T.', 6],
    ['Tribuna Occidente', 360, 'Valeria S.', 1],
    ['Tribuna Oriente', 300, 'Kevin H.', 8],
    ['Tribuna Oriente', 330, 'Fiorella C.', 3],
    ['Campo B', 215, 'Miguel A.', 2],
    ['Campo A', 180, 'Sofía L.', 4, true],
  ]),
  // e2 · Neón Pacífico — tope Campo 270
  ...crearOfertas('e2', 'l2-', [
    ['Campo', 220, 'Patricia N.', 5],
    ['Campo', 235, 'Renzo F.', 2],
    ['Campo', 250, 'Lucía V.', 7],
    ['Campo', 260, 'Óscar M.', 1],
    ['Campo', 270, 'Daniela C.', 3],
  ]),
  // e3 · Los Cóndores del Sur — tope General 180
  ...crearOfertas('e3', 'l3-', [
    ['General', 130, 'Gonzalo P.', 6],
    ['General', 155, 'Milagros R.', 2],
    ['General', 180, 'Bruno S.', 4],
  ]),
  // e4 · Festival Lima Sonora — tope General 375
  ...crearOfertas('e4', 'l4-', [
    ['General', 300, 'Camila D.', 3],
    ['General', 320, 'Sebastián L.', 8],
    ['General', 350, 'Ximena B.', 1],
    ['General', 375, 'Thiago R.', 5],
  ]),
];

/** Compra pasada de Ana: ya ingresó al concierto y el pago se liberó al vendedor. */
export const SEED_ORDERS: Order[] = [
  {
    id: 'H2N8QD',
    listingId: 'past-e2-1',
    eventId: 'e2',
    zona: 'Campo',
    precioEntrada: 240,
    tarifaGarantia: TARIFA_GARANTIA,
    total: 240 + TARIFA_GARANTIA,
    titular: SEED_USER.nombre,
    dniMasked: SEED_USER.dniMasked,
    qr: `RV-H2N8QD-${SEED_USER.dni.slice(-4)}`,
    estadoPago: 'liberado',
    estadoEntrada: 'usada',
    creadaEn: '2026-10-20T19:32:00-05:00',
  },
];

export const SEED_MY_LISTINGS: MyListing[] = [];
