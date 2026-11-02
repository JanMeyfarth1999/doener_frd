import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getOrders } from "@/lib/orders";

export async function GET() {
  try {
    const cookieStore = await cookies();

    // Supabase-Client mit der aktuellen Browser-Anmeldung.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },

          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      },
    );

    // Benutzer serverseitig überprüfen.
    const { data, error } = await supabase.auth.getUser();

    const isAdmin =
      !error &&
      !!data.user &&
      !!process.env.ADMIN_USER_ID &&
      data.user.id === process.env.ADMIN_USER_ID;

    // Ohne Admin-Berechtigung keine Bestelldaten!
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Zugriff verweigert." },
        { status: 403 },
      );
    }

    // Bestellungen aus der echten Datenbank laden.
    const orders = await getOrders();

    // Zunächst nur unkritische Felder zurückgeben.

    const result = orders.map((order) => ({
      // Allgemeine Bestelldaten
      id: order.id,
      status: order.status,
      type: order.order_type,

      // Kundendaten
      customer: order.customer_name,
      phone: order.customer_phone,
      address: order.delivery_address,

      // Bestellzeit
      time: new Date(order.created_at).toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Berlin",
      }),

      // Bestellte Gerichte
      items: order.items,

      // Preisübersicht
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.delivery_fee),
      total: Number(order.total),
    }));

    return NextResponse.json(
      { orders: result },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Fehler beim Abrufen der Bestellungen:", error);

    return NextResponse.json(
      { error: "Bestellungen konnten nicht geladen werden." },
      { status: 500 },
    );
  }
}

type OrderStatus = "new" | "preparing" | "ready" | "rejected";

// Legt fest, welche Statusänderungen erlaubt sind.
const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  new: ["preparing", "rejected"],
  preparing: ["ready"],
  ready: [],
  rejected: [],
};

// Prüft, ob ein Wert ein gültiger Bestellstatus ist.
function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    ["new", "preparing", "ready", "rejected"].includes(value)
  );
}

// Aktualisiert den Status einer Bestellung.
export async function PATCH(request: NextRequest) {
  try {
    // Nur Anfragen von unserer eigenen Website erlauben.
    const origin = request.headers.get("origin");

    if (!origin || origin !== request.nextUrl.origin) {
      return NextResponse.json(
        { error: "Ungültige Anfrage." },
        { status: 403 },
      );
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // Diese Route verändert keine Auth-Cookies.
          },
        },
      },
    );

    // Admin-Berechtigung serverseitig überprüfen.
    const { data, error: authError } =
      await supabase.auth.getUser();

    if (
      authError ||
      !data.user ||
      !process.env.ADMIN_USER_ID ||
      data.user.id !== process.env.ADMIN_USER_ID
    ) {
      return NextResponse.json(
        { error: "Zugriff verweigert." },
        { status: 403 },
      );
    }

    // Übermittelte Daten lesen.
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Ungültige Daten." },
        { status: 400 },
      );
    }

    const { id, status } = body as Record<string, unknown>;

    if (
      typeof id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) ||
      !isOrderStatus(status)
    ) {
      return NextResponse.json(
        { error: "Ungültige Bestell-ID oder Status." },
        { status: 400 },
      );
    }

    const admin = createSupabaseAdmin();

    // Aktuellen Status aus der Datenbank lesen.
    const { data: order, error: readError } = await admin
      .from("orders")
      .select("status")
      .eq("id", id)
      .maybeSingle();

    if (readError) {
      throw readError;
    }

    if (!order) {
      return NextResponse.json(
        { error: "Bestellung nicht gefunden." },
        { status: 404 },
      );
    }

    const currentStatus = order.status as OrderStatus;

    // Keine ungültigen Statuswechsel zulassen.
    if (!allowedTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json(
        { error: "Dieser Statuswechsel ist nicht erlaubt." },
        { status: 409 },
      );
    }

    // Status dauerhaft in Supabase speichern.
    const { data: updated, error: updateError } = await admin
      .from("orders")
      .update({ status })
      .eq("id", id)
      .eq("status", currentStatus)
      .select("id, status")
      .maybeSingle();

    if (updateError) {
      throw updateError;
    }

    // Verhindert, dass gleichzeitige Änderungen übersehen werden.
    if (!updated) {
      return NextResponse.json(
        { error: "Die Bestellung wurde zwischenzeitlich geändert." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { order: updated },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Fehler beim Aktualisieren:", error);

    return NextResponse.json(
      { error: "Bestellstatus konnte nicht gespeichert werden." },
      { status: 500 },
    );
  }
}

