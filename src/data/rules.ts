/** Tarifa fija de garantía por compra, en soles. */
export const TARIFA_GARANTIA = 10;

/** Precio máximo de reventa: 50 % sobre el precio original, redondeado. */
export function calcularTope(original: number): number {
  return Math.round(original * 1.5);
}

export function respetaTope(precio: number, original: number): boolean {
  return precio > 0 && precio <= calcularTope(original);
}
