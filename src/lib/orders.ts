
import "server-only";

import { createSupabaseAdmin } from "./supabaseAdmin";

// Definiert die Struktur einer gespeicherten Bestellung.
export type DatabaseOrder = {
  id: string;
  order_type: "pickup" | "delivery";
  status: "new" | "preparing" | "ready" | "rejected";
  customer_name: string;
  customer_phone: string;
  delivery_address: string | null;
  items: unknown;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
};

// Lädt die Bestellungen aus Supabase.
// Diese Funktion darf nur auf dem Server aufgerufen werden.
export async function getOrders(): Promise<DatabaseOrder[]> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Bestellungen konnten nicht geladen werden: ${error.message}`);
  }

  return (data ?? []) as DatabaseOrder[];
}
