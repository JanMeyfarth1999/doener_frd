"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useOrder } from "@/context/OrderContext";
import { calculateDeliveryFee, DELIVERY_MINIMUM } from "@/lib/delivery";
import OrderConfirmation, {
  type DemoOrder,
} from "@/components/OrderConfirmation";

export default function CheckoutSection() {
  // Warenkorb und Bestellart abrufen.
  const { items, totalPrice, clearCart } = useCart();
  const { orderType, setOrderType } = useOrder();

  // Eingaben des Kunden speichern.
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");

  // Speichert die abgeschlossene Demo-Bestellung.
  // null bedeutet: Es gibt noch keine Bestätigung.
  const [completedOrder, setCompletedOrder] = useState<DemoOrder | null>(null);

  // Zentral gespeicherter Mindestbestellwert.
  const minimumOrder = DELIVERY_MINIMUM;

  const missingAmount = Math.max(0, minimumOrder - totalPrice);

  // Entfernung für die Demo auswählen.
  // Später wird sie automatisch aus der Adresse berechnet.
  const [demoDistanceKm, setDemoDistanceKm] = useState(2);

  const deliveryFee =
    orderType === "delivery" ? calculateDeliveryFee(demoDistanceKm) : 0;

  // Gesamtbetrag inklusive Liefergebühren.
  const finalTotal = totalPrice + (deliveryFee ?? 0);

  // Prüfen, ob die Bestellung die Voraussetzungen erfüllt.
  const canContinue =
    items.length > 0 &&
    name.trim().length > 0 &&
    phone.trim().length > 0 &&
    (orderType === "pickup" ||
      (street.trim().length > 0 &&
        postalCode.trim().length > 0 &&
        city.trim().length > 0 &&
        missingAmount === 0));

  // Erstellt eine Demo-Bestellung ohne Daten zu versenden.
  function completeDemoOrder() {
    // Nur bei vollständigen Angaben fortfahren.
    if (!canContinue) return;

    // Bei Lieferung muss die Gebühr bekannt sein.
    if (orderType === "delivery" && deliveryFee === null) {
      return;
    }

    const demoOrder: DemoOrder = {
      // Einfache Bestellnummer für unsere Demo.

      orderNumber: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,

      customerName: name.trim(),
      orderType,

      // Momentanen Warenkorb als Kopie übernehmen.
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),

      // Warenwert ohne Lieferkosten.
      subtotal: totalPrice,

      // Liefergebühr, bei Abholung immer 0 €.
      deliveryFee: deliveryFee ?? 0,

      // Gesamtbetrag inklusive Liefergebühren.
      total: finalTotal,
    };

    // Bestätigung speichern und anzeigen.
    setCompletedOrder(demoOrder);

    // Nach dem Bestellabschluss zum Checkout-Bereich springen.
    document.getElementById("checkout")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // Setzt die Demo für eine neue Bestellung zurück.
  function startNewOrder() {
    // Warenkorb leeren.
    clearCart();

    // Bestellbestätigung schließen.
    setCompletedOrder(null);

    // Kundeneingaben zurücksetzen.
    setName("");
    setPhone("");
    setStreet("");
    setPostalCode("");
    setCity("");

    // Bestellart auf Abholung zurücksetzen.
    setOrderType("pickup");

    // Zur Speisekarte springen.
    document.getElementById("speisekarte")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // Nach einer abgeschlossenen Demo-Bestellung
  // ausschließlich die Bestätigung anzeigen.

  if (completedOrder) {
    return (
      <OrderConfirmation order={completedOrder} onNewOrder={startNewOrder} />
    );
  }

  return (
    <section id="checkout" className="mx-auto max-w-6xl px-5 py-10">
      <h2 className="text-2xl font-bold">Bestellung abschließen</h2>

      {/* Bestellart */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {(["pickup", "delivery"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setOrderType(type)}
            aria-pressed={orderType === type}
            className={`rounded-2xl border p-4 font-bold transition ${
              orderType === type
                ? "border-[#9ACD87] bg-[#263D2B]"
                : "border-white/10 bg-white/5"
            }`}
          >
            {type === "pickup" ? "Abholung" : "Lieferung"}
          </button>
        ))}
      </div>

      {/* Kontaktdaten */}
      <div className="mt-8 space-y-3">
        <h3 className="font-bold">Deine Kontaktdaten</h3>

        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Vor- und Nachname"
          autoComplete="name"
          className="w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none focus:border-[#9ACD87]"
        />

        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Telefonnummer"
          autoComplete="tel"
          className="w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none focus:border-[#9ACD87]"
        />
      </div>

      {/* Lieferadresse nur bei Lieferung */}
      {orderType === "delivery" && (
        <div className="mt-8 space-y-3">
          <h3 className="font-bold">Lieferadresse</h3>

          <input
            type="text"
            value={street}
            onChange={(event) => setStreet(event.target.value)}
            placeholder="Straße und Hausnummer"
            autoComplete="street-address"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none focus:border-[#9ACD87]"
          />

          <input
            type="text"
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
            placeholder="Postleitzahl"
            autoComplete="postal-code"
            inputMode="numeric"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none focus:border-[#9ACD87]"
          />

          <input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Ort"
            autoComplete="address-level2"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none focus:border-[#9ACD87]"
          />
        </div>
      )}

      {/* Informationen zur Abholung */}
      {orderType === "pickup" && (
        <div className="mt-6 rounded-2xl bg-white/5 p-4">
          <p className="font-bold">Abholung im Restaurant</p>
          <p className="mt-2 text-sm text-white/60">
            Hauptstraße 31, 34621 Frielendorf
          </p>
        </div>
      )}

      {/* Lieferentfernung für die Demo auswählen */}
      {orderType === "delivery" && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="font-bold">Lieferentfernung</h3>

          <p className="mt-2 text-xs text-white/50">
            Demo-Auswahl: Später automatisch anhand der Adresse.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { distance: 2, label: "Bis 2 km" },
              { distance: 3, label: "Ab 3 km" },
            ].map((option) => (
              <button
                key={option.distance}
                type="button"
                onClick={() => setDemoDistanceKm(option.distance)}
                aria-pressed={demoDistanceKm === option.distance}
                className={`rounded-xl border px-2 py-3 text-sm font-semibold transition ${
                  demoDistanceKm === option.distance
                    ? "border-[#9ACD87] bg-[#263D2B] text-[#9ACD87]"
                    : "border-white/10 bg-white/5 text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bestellübersicht */}
      <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex justify-between">
          <span>Warenwert</span>
          <span className="font-bold">
            {totalPrice.toFixed(2).replace(".", ",")} €
          </span>
        </div>

        {/* Lieferkosten nur bei Lieferung */}
        {orderType === "delivery" && (
          <div className="flex justify-between">
            <span>Lieferkosten (Demo)</span>
            <span>
              {deliveryFee === null
                ? "Noch zu klären"
                : `${deliveryFee.toFixed(2).replace(".", ",")} €`}
            </span>
          </div>
        )}

        {/* Gesamtbetrag inklusive Lieferkosten */}
        <div className="flex justify-between border-t border-white/10 pt-3 font-bold">
          <span>Gesamtbetrag</span>
          <span className="text-[#9ACD87]">
            {finalTotal.toFixed(2).replace(".", ",")} €
          </span>
        </div>

        {orderType === "delivery" && (
          <>
            <p className="text-xs text-white/50">Mindestbestellwert: 20,00 €</p>

            {missingAmount > 0 && (
              <p className="text-sm text-amber-400">
                Noch {missingAmount.toFixed(2).replace(".", ",")} € bis zum
                Mindestbestellwert.
              </p>
            )}

            <p className="text-xs text-white/50">
              Liefergebühren werden später anhand der Entfernung berechnet.
            </p>
          </>
        )}
      </div>

      {/* Noch kein echter Bestellabschluss */}

      <button
        type="button"
        onClick={completeDemoOrder}
        disabled={
          !canContinue || (orderType === "delivery" && deliveryFee === null)
        }
        className="mt-6 w-full rounded-2xl bg-[#9ACD87] p-4 font-bold text-[#101411] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {canContinue
          ? "Demo-Bestellung abschließen"
          : "Angaben vervollständigen"}
      </button>

      <p className="mt-3 text-center text-xs text-white/40">
        Demo-Version: Es werden noch keine Bestellungen versendet.
      </p>
    </section>
  );
}
