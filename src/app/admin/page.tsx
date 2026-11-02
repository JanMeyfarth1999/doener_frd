"use client";

import { useState } from "react";

import {
  initialOrders,
  type AdminOrder,
  type OrderStatus,
} from "@/data/demoOrders";

export default function AdminPage() {
  // Bestellungen werden aktuell nur lokal gespeichert.
  const [orders, setOrders] = useState(initialOrders);

  // Ändert den Status einer Bestellung.
  function updateStatus(id: string, status: OrderStatus) {
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, status } : order)),
    );
  }

  const newOrders = orders.filter((order) => order.status === "new").length;

  const preparingOrders = orders.filter(
    (order) => order.status === "preparing",
  ).length;

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
                        onClick={() => updateStatus(order.id, "rejected")}
                        className="min-h-12 flex-1 rounded-xl border border-white/20 font-bold"
                      >
                        Ablehnen
                      </button>

                      <button
                        type="button"
                        onClick={() => updateStatus(order.id, "preparing")}
                        className="min-h-12 flex-1 rounded-xl bg-[#B5F28B] font-bold text-[#0C100D]"
                      >
                        Annehmen
                      </button>
                    </>
                  )}

                  {order.status === "preparing" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(order.id, "ready")}
                      className="min-h-12 w-full rounded-xl bg-[#B5F28B] font-bold text-[#0C100D]"
                    >
                      Als fertig markieren
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <p className="mt-10 text-center text-xs text-white/40">
          Demo-Dashboard mit simulierten Bestellungen. Es werden keine echten
          Bestellungen empfangen.
        </p>
      </div>
    </main>
  );
}
