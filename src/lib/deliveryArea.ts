
import "server-only";

import { calculateDistanceKm } from "@/lib/distance";
import {
  MAX_DELIVERY_DISTANCE_KM,
  calculateDeliveryFee,
} from "@/lib/delivery";

// GPS-Koordinaten des Restaurants in Frielendorf.
const RESTAURANT_LAT = 50.9754032;
const RESTAURANT_LON = 9.324197;

// Prüft, ob eine GPS-Position im Liefergebiet liegt.
export function checkDeliveryArea(
  customerLat: number,
  customerLon: number,
) {
  // Ungültige Koordinaten ablehnen.
  if (
    !Number.isFinite(customerLat) ||
    !Number.isFinite(customerLon) ||
    Math.abs(customerLat) > 90 ||
    Math.abs(customerLon) > 180
  ) {
    throw new Error("Ungültige GPS-Koordinaten.");
  }

  // Entfernung vom Restaurant zur Lieferadresse.
  const distanceKm = calculateDistanceKm(
    RESTAURANT_LAT,
    RESTAURANT_LON,
    customerLat,
    customerLon,
  );

  // Prüfen, ob die Adresse maximal 5 km entfernt ist.
  const withinRadius =
    distanceKm <= MAX_DELIVERY_DISTANCE_KM;

  // Lieferkosten nur innerhalb des Radius berechnen.
  const deliveryFee = withinRadius
    ? calculateDeliveryFee(distanceKm)
    : null;

  return {
    withinRadius,
    distanceKm: Math.round(distanceKm * 100) / 100,
    deliveryFee,
  };
}
