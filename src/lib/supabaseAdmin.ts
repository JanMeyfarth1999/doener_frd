
import "server-only";

import { createClient } from "@supabase/supabase-js";

// Erstellt einen Supabase-Client für den Server.
export function createSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  // Prüfen, ob beide Umgebungsvariablen vorhanden sind.
  if (!supabaseUrl || !secretKey) {
    throw new Error(
      "Supabase-Konfiguration fehlt in .env.local"
    );
  }

  // Verbindung zu unserer Supabase-Datenbank.
  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
