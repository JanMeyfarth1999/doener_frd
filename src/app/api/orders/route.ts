import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { calculateOrderPrices } from "@/lib/orderPricing";
import { validateDeliveryAddress } from "@/lib/validateDeliveryAddress";
import { DELIVERY_MINIMUM } from "@/lib/delivery";

// Vorläufig nur Abholung erlauben.
// Lieferkosten dürfen nicht durch den Kunden festgelegt werden.
export async function POST(request: NextRequest) {
  try {
    // Nur Anfragen vom selben Ursprung akzeptieren.
    const origin = request.headers.get("origin");

    if (origin !== request.nextUrl.origin) {
      return NextResponse.json(
        { error: "Ungültige Anfrage." },
        { status: 403 },
      );
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Ungültige Bestelldaten." },
        { status: 400 },
      );
    }

    const order = body as Record<string, unknown>;

    // Eingaben des Kunden prüfen.
    if (
      (order.orderType !== "pickup" && order.orderType !== "delivery") ||
      typeof order.name !== "string" ||
      typeof order.phone !== "string"
    ) {
      return NextResponse.json(
        { error: "Bitte gültige Bestelldaten eingeben." },
        { status: 400 },
      );
    }

    // Ab hier weiß TypeScript, dass Name und Telefon Texte sind.
    if (
      order.name.trim().length < 2 ||
      order.name.length > 120 ||
      order.phone.trim().length < 5 ||
      order.phone.length > 40
    ) {
      return NextResponse.json(
        { error: "Bitte Name und Telefonnummer überprüfen." },
        { status: 400 },
      );
    }

    let pricedOrder;

    try {
      pricedOrder = calculateOrderPrices(order.items);
    } catch {
      return NextResponse.json(
        { error: "Der Warenkorb enthält ungültige Produkte oder Mengen." },
        { status: 400 },
      );
    }

   
    // Standardwerte für Abholbestellungen.
    let deliveryFee = 0;
    let deliveryAddress: string | null = null;

    // Lieferbestellungen zusätzlich überprüfen.
    if (order.orderType === "delivery") {
      // Mindestbestellwert anhand der Serverpreise prüfen.
      if (pricedOrder.subtotal < DELIVERY_MINIMUM) {
        return NextResponse.json(
          {
            error: `Der Mindestbestellwert beträgt ${DELIVERY_MINIMUM} €.`,
          },
          { status: 400 },
        );
      }

      // Lieferadresse vollständig prüfen.
      if (
        typeof order.street !== "string" ||
        typeof order.postalCode !== "string" ||
        typeof order.city !== "string"
      ) {
        return NextResponse.json(
          { error: "Bitte eine vollständige Lieferadresse eingeben." },
          { status: 400 },
        );
      }

      // Adresse und 5-km-Lieferradius serverseitig prüfen.
      let deliveryResult;

      try {
        deliveryResult = await validateDeliveryAddress(
          order.street,
          order.postalCode,
          order.city,
        );
      } catch {
        return NextResponse.json(
          { error: "Adressprüfung momentan nicht verfügbar." },
          { status: 503 },
        );
      }

      if (
        !deliveryResult.valid ||
        deliveryResult.deliveryFee === null
      ) {
        return NextResponse.json(
          { error: deliveryResult.message },
          { status: 400 },
        );
      }

      // Nur die vom Server berechnete Liefergebühr verwenden.
      deliveryFee = deliveryResult.deliveryFee;

      deliveryAddress = [
        order.street.trim(),
        `${order.postalCode.trim()} ${order.city.trim()}`,
      ].join(", ");
    }

    // Gesamtbetrag inklusive geprüfter Liefergebühr.
    const total = pricedOrder.subtotal + deliveryFee;


    // Verbindung zur Supabase-Datenbank herstellen.
    const supabase = createSupabaseAdmin();

    // Geprüfte Bestellung dauerhaft speichern.
    const { data, error } = await supabase
      .from("orders")
      .insert({
       
        // Tatsächliche Bestellart speichern.
        order_type: order.orderType,
        status: "new",

        // Kundendaten speichern.
        customer_name: order.name.trim(),
        customer_phone: order.phone.trim(),

        // Bei Abholung null, bei Lieferung die geprüfte Adresse.
        delivery_address: deliveryAddress,

        items: pricedOrder.items,
        subtotal: pricedOrder.subtotal,
        delivery_fee: deliveryFee,
        total,
      })
      .select("id, status, total")
      .single();

    if (error) {
      console.error("Fehler beim Speichern der Bestellung:", error.message);

      return NextResponse.json(
        { error: "Bestellung konnte nicht gespeichert werden." },
        { status: 500 },
      );
    }

    // Erfolgreiche Bestellung bestätigen.

    return NextResponse.json(
      {
        orderId: data.id,
        status: data.status,

        // Vom Server überprüfte Gerichte und Preise.
        items: pricedOrder.items,
        subtotal: pricedOrder.subtotal,
        deliveryFee,
        total: Number(data.total),
        
      },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Die Anfrage konnte nicht verarbeitet werden." },
      { status: 400 },
    );
  }
}
