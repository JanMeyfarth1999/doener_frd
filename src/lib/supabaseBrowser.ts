
import { createBrowserClient } from "@supabase/ssr";

// Erstellt den Supabase-Client für die Anmeldung im Browser.
export function createSupabaseBrowser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Prüfen, ob die benötigten Einstellungen vorhanden sind.
  if (!supabaseUrl || !publishableKey) {
    throw new Error("Supabase-Auth-Konfiguration fehlt.");
  }

  return createBrowserClient(supabaseUrl, publishableKey);
}
