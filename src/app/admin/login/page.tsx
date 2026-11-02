
"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabaseBrowser";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Meldet den Administrator bei Supabase Auth an.
  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const supabase = createSupabaseBrowser();

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        setError("Anmeldung fehlgeschlagen. Bitte Zugangsdaten prüfen.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Die Anmeldung konnte nicht gestartet werden.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0C100D] px-5 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1C251E] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#B5F28B]">
            Frielendorfer Pizza & Dönerhaus
          </p>

          <h1 className="text-3xl font-bold">
            Admin Login
          </h1>

          <p className="mt-3 text-sm text-white/50">
            Melde dich an, um die Verwaltung vorzubereiten.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm text-white/70"
            >
              E-Mail-Adresse
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@beispiel.de"
              className="w-full rounded-xl border border-white/10 bg-[#0C100D] px-4 py-3 outline-none focus:border-[#B5F28B]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-white/70"
            >
              Passwort
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Dein Passwort"
              className="w-full rounded-xl border border-white/10 bg-[#0C100D] px-4 py-3 outline-none focus:border-[#B5F28B]"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="text-sm text-[#B5F28B]">
              Anmeldung erfolgreich!
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#B5F28B] px-5 py-4 font-bold text-[#0C100D] transition hover:bg-[#C9FFAA] disabled:opacity-50"
          >
            {loading ? "Anmeldung läuft..." : "Anmelden"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-white/30">
          Geschützter Verwaltungsbereich · Demo
        </p>
      </div>
    </main>
  );
}
