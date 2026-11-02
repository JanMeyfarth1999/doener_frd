import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { calculateOrderPrices } from "@/lib/orderPricing";

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
      order.orderType !== "pickup" ||
      typeof order.name !== "string" ||
      order.name.trim().length < 2 ||
      order.name.length > 120 ||
      typeof order.phone !== "string" ||
      order.phone.trim().length < 5 ||
      order.phone.length > 40
    ) {
      return NextResponse.json(
        { error: "Bitte gültige Abholdaten eingeben." },
        { status: 400 },
      );
    }

    // Preise anhand unserer Speisekarte neu berechnen.
    let pricedOrder;

    try {
      pricedOrder = calculateOrderPrices(order.items);
    } catch {
      return NextResponse.json(
        { error: "Der Warenkorb enthält ungültige Produkte oder Mengen." },
        { status: 400 },
      );
    }

    // Bei Abholung fallen keine Liefergebühren an.
    const deliveryFee = 0;
    const total = pricedOrder.subtotal;

    // Verbindung zur Supabase-Datenbank herstellen.
    const supabase = createSupabaseAdmin();

    // Geprüfte Bestellung dauerhaft speichern.
    const { data, error } = await supabase
      .from("orders")
      .insert({
        order_type: "pickup",
        status: "new",
        customer_name: order.name.trim(),
        customer_phone: order.phone.trim(),
        delivery_address: null,
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
