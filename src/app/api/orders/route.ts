import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { calculateOrderPrices } from "@/lib/orderPricing";
import { validateDeliveryAddress } from "@/lib/validateDeliveryAddress";
import { DELIVERY_MINIMUM } from "@/lib/delivery";
import { createHash } from "node:crypto";

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

    // Jede Bestellung benötigt eine eindeutige Kennung.
    const idempotencyKey = order.idempotencyKey;

    // UUID-Format überprüfen.
    if (
      typeof idempotencyKey !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idempotencyKey,
      )
    ) {
      return NextResponse.json(
        { error: "Ungültige Bestellkennung." },
        { status: 400 },
      );
    }

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

    // Bestelldaten für den digitalen Fingerabdruck zusammenstellen.
    const requestData = {
      orderType: order.orderType,
      name: order.name.trim(),
      phone: order.phone.trim(),

      // Lieferadresse nur bei Lieferbestellungen berücksichtigen.
      address:
        order.orderType === "delivery"
          ? {
              street: String(order.street).trim(),
              postalCode: String(order.postalCode).trim(),
              city: String(order.city).trim(),
            }
          : null,

      // Nur serverseitig geprüfte Artikel und Preise verwenden.
      items: pricedOrder.items,
    };

    // SHA-256-Fingerabdruck der Bestellung erzeugen.
    const requestHash = createHash("sha256")
      .update(JSON.stringify(requestData))
      .digest("hex");

      
    // Datenbankverbindung bereits vor der Lieferadressprüfung herstellen.
    const supabase = createSupabaseAdmin();

    // Prüfen, ob diese Bestellkennung bereits gespeichert wurde.
    const { data: existingOrder, error: lookupError } = await supabase
      .from("orders")
      .select(
        "id, status, request_hash, items, subtotal, delivery_fee, total",
      )
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    // Bei einem Datenbankfehler keine weitere Bestellung anlegen.
    if (lookupError) {
      console.error("Fehler bei der Bestellprüfung:", lookupError.message);

      return NextResponse.json(
        { error: "Bestellung konnte nicht überprüft werden." },
        { status: 503 },
      );
    }

    if (existingOrder) {
      // Dieselbe Kennung mit veränderten Bestelldaten ablehnen.
      if (existingOrder.request_hash !== requestHash) {
        return NextResponse.json(
          {
            error:
              "Diese Bestellkennung wurde bereits für eine andere Bestellung verwendet.",
          },
          { status: 409 },
        );
      }

      // Bereits gespeicherte Bestellung erneut bestätigen.
      return NextResponse.json(
        {
          orderId: existingOrder.id,
          status: existingOrder.status,
          items: existingOrder.items,
          subtotal: Number(existingOrder.subtotal),
          deliveryFee: Number(existingOrder.delivery_fee),
          total: Number(existingOrder.total),
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        },
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

      if (!deliveryResult.valid || deliveryResult.deliveryFee === null) {
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

  

    // Geprüfte Bestellung dauerhaft speichern.
    const { data, error } = await supabase

      .from("orders")
      .insert({
        idempotency_key: idempotencyKey,
        request_hash: requestHash,
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
      // PostgreSQL-Code 23505 = eindeutiger Wert existiert bereits.
      if (error.code === "23505") {
        const { data: existingOrder, error: lookupError } = await supabase
          .from("orders")

          .select(
            "id, status, request_hash, order_type, items, subtotal, delivery_fee, total",
          )

          .eq("idempotency_key", idempotencyKey)
          .maybeSingle();

        if (lookupError) {
          console.error("Fehler beim Abrufen:", lookupError.message);
        }

        if (existingOrder) {
          // Dieselbe Kennung darf nicht für andere Bestelldaten
          // verwendet werden.
          if (existingOrder.request_hash !== requestHash) {
            return NextResponse.json(
              {
                error:
                  "Diese Bestellkennung wurde bereits für eine andere Bestellung verwendet.",
              },
              {
                status: 409,
                headers: { "Cache-Control": "no-store" },
              },
            );
          }

          // Eine bereits gespeicherte Bestellung zurückgeben.
          return NextResponse.json(
            {
              orderId: existingOrder.id,
              status: existingOrder.status,
              items: existingOrder.items,
              subtotal: Number(existingOrder.subtotal),
              deliveryFee: Number(existingOrder.delivery_fee),
              total: Number(existingOrder.total),
            },
            {
              status: 200,
              headers: { "Cache-Control": "no-store" },
            },
          );
        }
      }

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
