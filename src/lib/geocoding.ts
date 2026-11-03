import "server-only";

/**
 * Vereinheitlicht Straßennamen für den Vergleich.
 *
 * Beispiele:
 * "Hauptstraße" → "hauptstrasse"
 * "Hauptstr."   → "hauptstrasse"
 */
function normalizeStreetName(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/ß/g, "ss")
    .replace(/straße/g, "strasse")
    .replace(/str\./g, "strasse")
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

// GPS-Position einer gefundenen Adresse.
export type GeoPosition = {
  latitude: number;
  longitude: number;
};

// Erwartete Antwort des Geocoding-Dienstes.
type NominatimResult = {
  lat: string;
  lon: string;
  addresstype?: string;
  address?: {
    house_number?: string;
    road?: string;
    postcode?: string;
  };
};

// Wandelt eine Adresse in GPS-Koordinaten um.
export async function geocodeAddress(
  street: string,
  postalCode: string,
  city: string,
): Promise<GeoPosition | null> {
  // Nur vollständige Adressen zulassen.
  if (!street.trim() || !postalCode.trim() || !city.trim()) {
    return null;
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");

  // Adresse für die Suche zusammensetzen.
  url.searchParams.set(
    "q",
    `${street.trim()}, ${postalCode.trim()} ${city.trim()}, Deutschland`,
  );

  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "de");
  url.searchParams.set("limit", "1");

  const response = await fetch(url, {
    headers: {
      // Identifiziert unsere Demo-Anwendung.
      "User-Agent": "FrielendorferDoenerhausDemo/1.0",
      "Accept-Language": "de",
    },
    next: {
      revalidate: 86400,
    },
  });

  if (!response.ok) {
    throw new Error("Adresssuche momentan nicht verfügbar.");
  }

  const results = (await response.json()) as NominatimResult[];

  const result = results[0];

  if (!result) {
    return null;
  }

  // Keine ungefähren Ortsmittelpunkte als Lieferadresse akzeptieren.
  if (
    !result.address?.house_number ||
    !result.address?.road ||
    !result.address?.postcode
  ) {
    return null;
  }

  // Hausnummer aus der Kundeneingabe ermitteln.
  const enteredHouseNumber = street.trim().match(/\b\d+[a-zA-Z]?\b/)?.[0];

  if (!enteredHouseNumber) {
    return null;
  }

  // Prüfen, ob die gefundene Hausnummer übereinstimmt.
  if (
    result.address.house_number.toLowerCase() !==
    enteredHouseNumber.toLowerCase()
  ) {
    return null;
  }

  // Postleitzahl muss mit der Eingabe übereinstimmen.
  if (result.address.postcode !== postalCode.trim()) {
    return null;
  }

  // Hausnummer aus der eingegebenen Straße entfernen.
  const enteredStreetName = street.replace(/\b\d+[a-zA-Z]?\b/, "").trim();

  // Straßennamen für den Vergleich vereinheitlichen.
  const normalizedEnteredStreet = normalizeStreetName(enteredStreetName);

  const normalizedFoundStreet = normalizeStreetName(result.address.road);

  // Unterschiedliche Straßennamen ablehnen.
  if (
    !normalizedEnteredStreet ||
    normalizedEnteredStreet !== normalizedFoundStreet
  ) {
    return null;
  }

  const latitude = Number(result.lat);
  const longitude = Number(result.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}
