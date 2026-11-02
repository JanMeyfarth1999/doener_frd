
// Mindestbestellwert bei Lieferung.
export const DELIVERY_MINIMUM = 20;

// Berechnet die Lieferkosten anhand der Entfernung.
export function calculateDeliveryFee(
  distanceKm: number
): number | null {
  // Ungültige Entfernungen abfangen.
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    return null;
  }

  // Alle Entfernungen unter 3 km kosten 1,50 €.
  if (distanceKm < 3) {
    return 1.5;
  }

  // Ab 3 km kosten Lieferungen 2,50 €.
  return 2.5;
}
