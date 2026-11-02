"use client";
import { useEffect, useRef, useState } from "react";
import { type AdminOrder, type OrderStatus } from "@/data/demoOrders";

// Spielt einen kurzen Signalton ab.
function playNotificationSound(context: AudioContext) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  // Heller, gut hörbarer Signalton.
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, context.currentTime);

  // Lautstärke sanft ausblenden.
  gain.gain.setValueAtTime(0.2, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + 0.35);
}

export default function AdminPage() {
  // Hier speichern wir die Bestellungen aus Supabase.
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  // Ladezustand und mögliche Fehlermeldung.
  const [loading, setLoading] = useState(true);
  // Merkt sich, welche Bestellung gerade gespeichert wird.
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);

  // Speichert die Audioverbindung für Benachrichtigungstöne.
  const audioContextRef = useRef<AudioContext | null>(null);

  // Merkt sich die IDs der bereits bekannten Bestellungen.
  const knownOrderIdsRef = useRef<Set<string>>(new Set());

  // Verhindert einen Signalton beim ersten Laden.
  const initialLoadDoneRef = useRef(false);

  // Speichert den aktuellen Tonstatus für das Polling.
  const soundEnabledRef = useRef(false);

  // Zeigt an, ob Benachrichtigungstöne aktiviert wurden.
  const [soundEnabled, setSoundEnabled] = useState(false);

  const [error, setError] = useState("");

  // Bestellungen beim Öffnen des Dashboards abrufen.

  useEffect(() => {
    let active = true;
    let requestRunning = false;

    // Lädt die aktuellen Bestellungen aus Supabase.
    async function loadOrders() {
      // Keine parallelen Anfragen starten.
      if (requestRunning) return;

      requestRunning = true;

      try {
        const response = await fetch("/api/admin/orders", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Bestellungen konnten nicht geladen werden.");
        }

        const data = await response.json();

        if (active) {
          const updatedOrders = data.orders as AdminOrder[];

          // Alle aktuell vorhandenen Bestell-IDs erfassen.
          const currentIds = new Set(updatedOrders.map((order) => order.id));

          if (initialLoadDoneRef.current) {
            // Nur bisher unbekannte Bestellungen mit Status "new" zählen.
            const newOrders = updatedOrders.filter(
              (order) =>
                order.status === "new" &&
                !knownOrderIdsRef.current.has(order.id),
            );

            // Bei mindestens einer neuen Bestellung Ton abspielen.
            if (newOrders.length > 0 && soundEnabledRef.current) {
              const context = audioContextRef.current;

              if (context?.state === "running") {
                playNotificationSound(context);
              }
            }
          }

          // Nach dem ersten erfolgreichen Abruf ist die Ausgangsliste bekannt.
          knownOrderIdsRef.current = currentIds;
          initialLoadDoneRef.current = true;

          // Bestellungen im Dashboard aktualisieren.
          setOrders(updatedOrders);
          setError("");
        }
      } catch {
        if (active) {
          setError("Fehler beim Laden der Bestellungen.");
        }
      } finally {
        requestRunning = false;

        if (active) {
          setLoading(false);
        }
      }
    }

    // Beim Öffnen sofort laden.
    void loadOrders();

    // Anschließend alle fünf Sekunden aktualisieren.

    const interval = setInterval(() => {
      // Zeigt uns im Browser, ob der Timer funktioniert.

      void loadOrders();
    }, 5000);

    // Beim Verlassen der Seite den Timer entfernen.
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  async function updateStatus(id: string, status: OrderStatus) {
    // Verhindert zusätzliche Klicks während einer Statusänderung.
    if (savingOrderId !== null) return;

    setSavingOrderId(id);
    setError("");

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error("Status konnte nicht gespeichert werden.");
      }

      const data = await response.json();

      // Oberfläche erst nach erfolgreicher Datenbankänderung aktualisieren.
      setOrders((current) =>
        current.map((order) =>
          order.id === id
            ? { ...order, status: data.order.status as OrderStatus }
            : order,
        ),
      );
    } catch {
      setError("Statusänderung fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      // Buttons nach Abschluss wieder freigeben.
      setSavingOrderId(null);
    }
  }

  const newOrders = orders.filter((order) => order.status === "new").length;

  const preparingOrders = orders.filter(
    (order) => order.status === "preparing",
  ).length;

  // Aktiviert die Audiowiedergabe nach einem Benutzerklick.
  async function enableSound() {
    try {
      const context = audioContextRef.current ?? new AudioContext();

      await context.resume();

      audioContextRef.current = context;
      soundEnabledRef.current = true;
      setSoundEnabled(true);

      // Kurzen Testton abspielen.
      playNotificationSound(context);
    } catch {
      setError("Benachrichtigungston konnte nicht aktiviert werden.");
    }
  }

  return (
    <main className="min-h-screen bg-[#0C100D] px-5 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Dashboard-Header */}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#B5F28B]">
              FRIELENDORFER / ADMIN
            </p>

            <h1 className="mt-3 text-3xl font-black">Bestellzentrale</h1>

            <button
              type="button"
              onClick={() => void enableSound()}
              className="mt-4 rounded-xl border border-[#B5F28B]/40 px-4 py-3 text-sm font-bold text-[#B5F28B] transition hover:bg-[#B5F28B]/10"
            >
              {soundEnabled
                ? "✓ Ton aktiviert"
                : "🔔 Benachrichtigungston aktivieren"}
            </button>
          </div>

          <span className="rounded-full bg-[#B5F28B]/10 px-4 py-2 text-xs font-bold text-[#B5F28B]">
            DEMO
          </span>
        </header>

        {/* Kennzahlen */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#1C251E] p-5">
            <p className="text-xs text-white/50">Neue Bestellungen</p>

            <p className="mt-3 text-3xl font-black">{newOrders}</p>
          </div>

          <div className="rounded-2xl bg-[#1C251E] p-5">
            <p className="text-xs text-white/50">In Zubereitung</p>

            <p className="mt-3 text-3xl font-black text-[#B5F28B]">
              {preparingOrders}
            </p>
          </div>
        </div>

        {/* Bestellliste */}
        <section className="mt-10">
          {loading && (
            <p className="mb-4 text-sm text-white/50">
              Bestellungen werden geladen...
            </p>
          )}

          {error && (
            <p role="alert" className="mb-4 text-sm text-red-400">
              {error}
            </p>
          )}

          {!loading && !error && orders.length === 0 && (
            <p className="mb-4 text-sm text-white/50">
              Noch keine Bestellungen vorhanden.
            </p>
          )}

          <h2 className="mb-5 text-xl font-black">Bestellungen</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-white/10 bg-[#1C251E] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold">Bestellung #{order.id}</h3>

                  <span className="text-xs font-bold text-[#B5F28B]">
                    {order.status === "new"
                      ? "Neu"
                      : order.status === "preparing"
                        ? "In Zubereitung"
                        : order.status === "ready"
                          ? "Fertig"
                          : "Abgelehnt"}
                  </span>
                </div>

                <p className="mt-4 text-sm text-white/70">{order.customer}</p>

                <p className="mt-2 text-xs text-white/40">
                  {order.type === "pickup" ? "Abholung" : "Lieferung"}
                </p>

                {/* Kundendaten */}
                <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#B5F28B]">
                    Kundendaten
                  </p>

                  <p className="text-sm text-white/70">
                    Telefon: {order.phone}
                  </p>

                  {order.type === "delivery" && order.address && (
                    <p className="text-sm text-white/70">
                      Lieferadresse: {order.address}
                    </p>
                  )}

                  <p className="text-sm text-white/70">
                    Bestellzeit: {order.time} Uhr
                  </p>
                </div>

                {/* Bestellte Gerichte */}
                <div className="mt-5 space-y-4 border-t border-white/10 pt-4">
                  <h4 className="font-bold">Bestellte Gerichte</h4>

                  {(order.items ?? []).map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between gap-3 text-sm">
                        <span>
                          {item.quantity} × {item.name}
                        </span>

                        <span className="shrink-0 font-bold">
                          {(item.price * item.quantity)
                            .toFixed(2)
                            .replace(".", ",")}{" "}
                          €
                        </span>
                      </div>

                      {/* Individuelle Wünsche */}
                      {item.options && item.options.length > 0 && (
                        <p className="mt-2 text-xs text-[#B5F28B]">
                          {item.options.join(" · ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Preisübersicht */}
                <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                  {order.type === "delivery" && (
                    <div className="flex justify-between text-sm text-white/60">
                      <span>Lieferkosten</span>
                      <span>
                        {order.deliveryFee.toFixed(2).replace(".", ",")} €
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-bold">Gesamtbetrag</span>

                    <span className="text-xl font-black text-[#B5F28B]">
                      {order.total.toFixed(2).replace(".", ",")} €
                    </span>
                  </div>
                </div>

                {/* Statusabhängige Aktionen */}
                <div className="mt-6 flex gap-3">
                  {order.status === "new" && (
                    <>
                      <button
                        type="button"
                        disabled={savingOrderId !== null}
                        onClick={() => updateStatus(order.id, "rejected")}
                        className="min-h-12 flex-1 rounded-xl border border-white/20 font-bold"
                      >
                        {savingOrderId === order.id
                          ? "Speichert..."
                          : "Anlehnen"}
                      </button>

                      <button
                        type="button"
                        disabled={savingOrderId !== null}
                        onClick={() => updateStatus(order.id, "preparing")}
                        className="min-h-12 flex-1 rounded-xl bg-[#B5F28B] font-bold text-[#0C100D]"
                      >
                        {savingOrderId === order.id
                          ? "Speichert..."
                          : "Annehmen"}
                      </button>
                    </>
                  )}

                  {order.status === "preparing" && (
                    <button
                      type="button"
                      disabled={savingOrderId !== null}
                      onClick={() => updateStatus(order.id, "ready")}
                      className="min-h-12 w-full rounded-xl bg-[#B5F28B] font-bold text-[#0C100D]"
                    >
                      {savingOrderId === order.id
                        ? "Speichert..."
                        : "Als fertig markieren"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <p className="mt-10 text-center text-xs text-white/40">
          Demo-Bestellzentrale · Bestellungen aus Supabase
        </p>
      </div>
    </main>
  );
}
