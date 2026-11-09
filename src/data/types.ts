export type User = {
  id: string;
  nombre: string;
  dni: string;
  /** Ej. "••••4512". Es lo único que se muestra en pantalla. */
  dniMasked: string;
  email: string;
  dniVerificado: boolean;
};

export type EstadoVenta = 'preventa_agotada' | 'venta_general';

export type Zona = {
  nombre: string;
  precioOriginal: number;
};

export type Event = {
  id: string;
  artista: string;
  gira: string;
  recinto: string;
  ciudad: string;
  /** ISO 8601 con zona horaria de Lima, ej. "2026-11-14T21:00:00-05:00". */
  fechaISO: string;
  estadoVenta: EstadoVenta;
  zonas: Zona[];
};

export type Vendedor = {
  nombre: string;
  dniVerificado: boolean;
  ventas: number;
};

export type EstadoListing = 'disponible' | 'vendida';

export type Listing = {
  id: string;
  eventId: string;
  zona: string;
  precio: number;
  precioOriginal: number;
  /** Precio máximo permitido: calcularTope(precioOriginal). */
  tope: number;
  vendedor: Vendedor;
  estado: EstadoListing;
  /** Si es true, la verificación con la ticketera falla (caso de demo). */
  verificacionFalla?: boolean;
};

export type EstadoPago = 'retenido' | 'liberado' | 'reembolso_en_proceso' | 'reembolsado';
export type EstadoEntrada = 'emitida' | 'usada' | 'anulada';

export type Order = {
  id: string;
  listingId: string;
  eventId: string;
  zona: string;
  precioEntrada: number;
  tarifaGarantia: number;
  total: number;
  titular: string;
  dniMasked: string;
  /** "RV-{orderId}-{últimos 4 del DNI}" */
  qr: string;
  estadoPago: EstadoPago;
  estadoEntrada: EstadoEntrada;
  /** ISO 8601 */
  creadaEn: string;
};

export type EstadoMyListing = 'publicada' | 'vendida';

export type MyListing = {
  id: string;
  eventId: string;
  zona: string;
  /** Código de la entrada en la ticketera. */
  codigo: string;
  precio: number;
  estado: EstadoMyListing;
};

export type TestEvent = {
  tipo: string;
  pantalla: string;
  /** Marca de tiempo en ms (Date.now()). */
  t: number;
};

export type MomentoConfianza = 'antes' | 'despues';
export type NivelConfianza = 1 | 2 | 3 | 4 | 5;
