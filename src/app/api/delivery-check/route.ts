
import { NextResponse, type NextRequest } from "next/server";
import { validateDeliveryAddress } from "@/lib/validateDeliveryAddress";

// Prüft eine Lieferadresse auf unserem Server.
export async function POST(request: NextRequest) {
  try {
    // Nur Anfragen unserer eigenen Website akzeptieren.
    const origin = request.headers.get("origin");

    if (origin !== request.nextUrl.origin) {
      return NextResponse.json(
        { error: "Ungültige Anfrage." },
        { status: 403 },
      );
    }

    // Übermittelte Daten einlesen.
    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Ungültige Adressdaten." },
        { status: 400 },
      );
    }

    const address = body as Record<string, unknown>;

    if (
      typeof address.street !== "string" ||
      typeof address.postalCode !== "string" ||
      typeof address.city !== "string"
    ) {
      return NextResponse.json(
        { error: "Bitte eine vollständige Adresse angeben." },
        { status: 400 },
      );
    }

    // Externe Suche nur bei plausiblen Eingaben starten.
    if (
      address.street.length > 120 ||
      address.postalCode.length > 10 ||
      address.city.length > 80
    ) {
      return NextResponse.json(
        { error: "Adresseingabe ist zu lang." },
        { status: 400 },
      );
    }

    // Liefergebiet und Gebühr prüfen.
    const result = await validateDeliveryAddress(
      address.street,
      address.postalCode,
      address.city,
    );

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Fehler bei der Lieferadressprüfung:", error);

    return NextResponse.json(
      { error: "Lieferadresse konnte nicht überprüft werden." },
      { status: 503 },
    );
  }
}
