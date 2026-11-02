
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

// Zugangsdaten aus .env.local laden.
const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

// Prüfen, ob die Konfiguration vorhanden ist.
if (!url || !secretKey) {
  throw new Error("Supabase-Zugangsdaten fehlen.");
}

// Verbindung zur Datenbank herstellen.
const supabase = createClient(url, secretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Nur die Anzahl der gespeicherten Bestellungen abfragen.
// Keine persönlichen Kundendaten ausgeben.

const { data, count, error, status, statusText } =
  await supabase
    .from("orders")
    .select("id", { count: "exact" })
    .limit(5);

console.log("HTTP-Status:", status, statusText);
console.log("Datenbankfehler:", error?.message ?? "Keiner");
console.log("Anzahl Bestellungen:", count);
console.log("Abgerufene Datensätze:", data?.length ?? 0);


if (error) {
  console.error("Datenbankfehler:", error.message);
  process.exitCode = 1;
} else {
  console.log("Supabase-Verbindung erfolgreich!");
  console.log("Gespeicherte Bestellungen:", count);
}
