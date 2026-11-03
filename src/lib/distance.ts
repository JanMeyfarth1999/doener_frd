
/**
 * Berechnet die Luftlinienentfernung zwischen zwei
 * GPS-Positionen in Kilometern.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  // Ungefähren Erdradius in Kilometern festlegen.
  const earthRadius = 6371;

  // Grad in Bogenmaß umrechnen.
  const toRadians = (degrees: number) =>
    (degrees * Math.PI) / 180;

  // Unterschied zwischen den Koordinaten.
  const latDifference = toRadians(lat2 - lat1);
  const lonDifference = toRadians(lon2 - lon1);

  // Haversine-Formel.
  const a =
    Math.sin(latDifference / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(lonDifference / 2) ** 2;

  const c = 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a),
  );

  // Entfernung in Kilometern zurückgeben.
  return earthRadius * c;
}
