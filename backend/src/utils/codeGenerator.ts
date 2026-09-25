/**
 * Generates an uppercase reservation code e.g. NS-RES-83921
 */
export function generateReservationCode(): string {
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  return `NS-RES-${randomPart}`;
}

/**
 * Generates an uppercase order number e.g. NS-ORD-49201
 */
export function generateOrderNumber(): string {
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  return `NS-ORD-${randomPart}`;
}
