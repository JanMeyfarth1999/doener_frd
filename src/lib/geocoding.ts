import "server-only";


// Speichert erfolgreich geprüfte Adressen im Server-Arbeitsspeicher.
const addressCache = new Map<
  string,
  {
    position: GeoPosition;
    expiresAt: number;
  }
>();

// Ergebnisse 24 Stunden aufbewahren.
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;


/**
 * Einfache Begrenzung für unsere lokale Demo.
 * Zwischen zwei externen Anfragen müssen mindestens
 * 1.100 Millisekunden liegen.
 */
const MIN_REQUEST_INTERVAL_MS = 1100;

// Zeitpunkt der letzten externen Anfrage.
let lastRequestAt = 0;

// Warteschlange für externe Geocoding-Anfragen.
let requestQueue: Promise<void> = Promise.resolve();

async function waitForGeocodingSlot(): Promise<void> {
  const previousRequest = requestQueue;

  let release!: () => void;

  requestQueue = new Promise<void>((resolve) => {
    release = resolve;
  });

  // Warten, bis die vorherige Anfrage ihren Platz freigibt.
  await previousRequest;

  const elapsed = Date.now() - lastRequestAt;
  const remaining = Math.max(0, MIN_REQUEST_INTERVAL_MS - elapsed);

  if (remaining > 0) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, remaining);
    });
  }

  lastRequestAt = Date.now();
  release();
}



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

  
// Eindeutigen Schlüssel für die Adresse erstellen.
const cacheKey = [
  street,
  postalCode,
  city,
]
  .map((value) => value.trim().toLowerCase())
  .join("|");

// Prüfen, ob diese Adresse bereits gespeichert ist.
const cached = addressCache.get(cacheKey);

if (cached) {
  if (cached.expiresAt > Date.now()) {
    return cached.position;
  }

  // Abgelaufenen Eintrag entfernen.
  addressCache.delete(cacheKey);
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

  await waitForGeocodingSlot();

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

  
const position: GeoPosition = {
  latitude,
  longitude,
};

// Erfolgreiches Ergebnis zwischenspeichern.
addressCache.set(cacheKey, {
  position,
  expiresAt: Date.now() + CACHE_DURATION_MS,
});

return position;

}
