import "server-only";

import { geocodeAddress } from "@/lib/geocoding";
import { checkDeliveryArea } from "@/lib/deliveryArea";

// Prüft eine Lieferadresse und berechnet die Lieferkosten.
export async function validateDeliveryAddress(
  street: string,
  postalCode: string,
  city: string,
) {
  // Eingaben von überflüssigen Leerzeichen befreien.
  street = street.trim();
  postalCode = postalCode.trim();
  city = city.trim();

  // Grundlegende Eingaben prüfen, bevor wir
  // eine externe Adresssuche starten.
  const validInput =
    street.length >= 5 &&
    street.length <= 120 &&
    /\b\d+[a-zA-Z]?\b/.test(street) &&
    /^\d{5}$/.test(postalCode) &&
    city.length >= 2 &&
    city.length <= 80;

  if (!validInput) {
    return {
      valid: false,
      message: "Bitte eine vollständige und gültige Lieferadresse eingeben.",
      distanceKm: null,
      deliveryFee: null,
    };
  }

  // Adresse in GPS-Koordinaten umwandeln.
  const position = await geocodeAddress(street, postalCode, city);

  // Keine eindeutige Adresse gefunden.
  if (!position) {
    return {
      valid: false,
      message: "Die Lieferadresse konnte nicht gefunden werden.",
      distanceKm: null,
      deliveryFee: null,
    };
  }

  // Entfernung zum Restaurant berechnen.
  const result = checkDeliveryArea(position.latitude, position.longitude);

  // Prüfen, ob die Adresse im 5-km-Radius liegt.
  if (!result.withinRadius) {
    return {
      valid: false,
      message: "Diese Adresse liegt außerhalb unseres Liefergebiets.",
      distanceKm: result.distanceKm,
      deliveryFee: null,
    };
  }

  return {
    valid: true,
    message: "Lieferung an diese Adresse möglich.",
    distanceKm: result.distanceKm,
    deliveryFee: result.deliveryFee,
  };
}
