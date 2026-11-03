"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useOrder } from "@/context/OrderContext";

import { DELIVERY_MINIMUM } from "@/lib/delivery";

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

  // Ergebnis der automatischen Lieferadressprüfung.
  const [deliveryCheck, setDeliveryCheck] = useState<{
    valid: boolean;
    message: string;
    distanceKm: number | null;
    deliveryFee: number | null;
  } | null>(null);

  // Zeigt an, ob die Adresse gerade überprüft wird.
  const [checkingDelivery, setCheckingDelivery] = useState(false);

  // Verhindert, dass alte Prüfergebnisse nach einer
  // Änderung der Adresse weiter als gültig gelten.
  const [checkedAddress, setCheckedAddress] = useState("");

  // Speichert die abgeschlossene Demo-Bestellung.
  // null bedeutet: Es gibt noch keine Bestätigung.
  const [completedOrder, setCompletedOrder] = useState<DemoOrder | null>(null);

  // Verhindert doppelte Bestellungen während des Speicherns.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verhindert mehrere gleichzeitige Bestellanfragen.
  const submittingRef = useRef(false);
  
  // Speichert die eindeutige Kennung der aktuellen Bestellung.
  const orderIdempotencyKeyRef = useRef<string | null>(null);

  // Zeigt Fehler beim Abschicken an.
  const [submitError, setSubmitError] = useState("");

  // Zentral gespeicherter Mindestbestellwert.
  const minimumOrder = DELIVERY_MINIMUM;

  const missingAmount = Math.max(0, minimumOrder - totalPrice);

  // Steuert die Vollbildansicht des Checkouts.
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Reagiert auf den Checkout-Button im Warenkorb.
  useEffect(() => {
    function openCheckout() {
      setIsCheckoutOpen(true);
    }

    window.addEventListener("open-checkout", openCheckout);

    return () => {
      window.removeEventListener("open-checkout", openCheckout);
    };
  }, []);

  // Das Prüfergebnis gilt nur für die unveränderte Adresse.
  const currentAddressKey = JSON.stringify([
    street.trim(),
    postalCode.trim(),
    city.trim(),
  ]);

  const currentDeliveryCheck =
    checkedAddress === currentAddressKey ? deliveryCheck : null;

  // Lieferkosten ausschließlich aus der geprüften Adresse übernehmen.
  const deliveryFee =
    orderType === "pickup"
      ? 0
      : currentDeliveryCheck?.valid
        ? currentDeliveryCheck.deliveryFee
        : null;

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
        missingAmount === 0 &&
        currentDeliveryCheck?.valid === true &&
        currentDeliveryCheck.deliveryFee !== null));

  // Prüft eine Lieferadresse über unsere Server-API.
  async function checkDeliveryAddress() {
    if (checkingDelivery) return;

    setCheckingDelivery(true);
    setDeliveryCheck(null);
    setCheckedAddress("");

    const addressKey = JSON.stringify([
      street.trim(),
      postalCode.trim(),
      city.trim(),
    ]);

    try {
      const response = await fetch("/api/delivery-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          street: street.trim(),
          postalCode: postalCode.trim(),
          city: city.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Die Adressprüfung ist momentan nicht verfügbar.");
      }

      const result = await response.json();

      // Nur das Ergebnis der angefragten Adresse speichern.
      setDeliveryCheck(result);
      setCheckedAddress(addressKey);
    } catch {
      setDeliveryCheck({
        valid: false,
        message: "Die Adresse konnte nicht überprüft werden.",
        distanceKm: null,
        deliveryFee: null,
      });
      setCheckedAddress(addressKey);
    } finally {
      setCheckingDelivery(false);
    }
  }

  // Übermittelt Abhol- und Lieferbestellungen an den Server.
  async function completeDemoOrder() {
    if (!canContinue || submittingRef.current) return;

    // Lieferadresse muss vorher erfolgreich geprüft worden sein.
    if (
      orderType === "delivery" &&
      (!currentDeliveryCheck?.valid ||
        currentDeliveryCheck.deliveryFee === null)
    ) {
      setSubmitError("Bitte zuerst die Lieferadresse überprüfen.");
      return;
    }

    // Bestellanfrage sofort sperren.
    submittingRef.current = true;

    // Neue Kennung nur erzeugen, wenn noch keine vorhanden ist.
    if (!orderIdempotencyKeyRef.current) {
      orderIdempotencyKeyRef.current = crypto.randomUUID();
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idempotencyKey: orderIdempotencyKeyRef.current,
          orderType,
          name: name.trim(),
          phone: phone.trim(),

          // Lieferadresse nur bei Lieferung übermitteln.
          ...(orderType === "delivery"
            ? {
                street: street.trim(),
                postalCode: postalCode.trim(),
                city: city.trim(),
              }
            : {}),

          // Preise werden nicht vom Browser übernommen.
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Bestellung konnte nicht gespeichert werden.",
        );
      }

      // Die Bestätigung nutzt ausschließlich die Serverpreise.
      const completed: DemoOrder = {
        orderNumber: result.orderId,
        customerName: name.trim(),
        orderType,

        items: result.items,
        subtotal: result.subtotal,
        deliveryFee: result.deliveryFee,
        total: result.total,
      };

      // Erst nach erfolgreichem Speichern bestätigen.
      setCompletedOrder(completed);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Bestellung konnte nicht abgeschickt werden.",
      );
    } finally {
      // Sperre nach Abschluss der Anfrage wieder freigeben.
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  // Setzt die Demo für eine neue Bestellung zurück.
  function startNewOrder() {
    // Eine neue Bestellung erhält später eine neue Kennung.
    orderIdempotencyKeyRef.current = null;
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
    <section
      id="checkout"
      aria-label="Bestellung abschließen"
      className={`${
        isCheckoutOpen
          ? "fixed inset-0 z-[90] overflow-y-auto overscroll-contain bg-[#0C100D] px-5 pb-32 pt-6 text-[#F5F2E9]"
          : "hidden"
      }`}
    >
      {/* Premium Checkout Header */}
      <div className="mx-auto max-w-2xl">
        {/* Navigation und Demo-Kennzeichnung */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(false)}
            className="flex min-h-11 items-center gap-3 text-sm font-bold text-white/80"
          >
            <span className="text-xl text-[#B5F28B]">←</span>
            Zurück
          </button>

          <span className="rounded-full border border-[#B5F28B]/20 bg-[#B5F28B]/10 px-3 py-2 text-[10px] font-bold tracking-widest text-[#B5F28B]">
            DEMO MODE
          </span>
        </div>

        {/* Große Überschrift */}
        <div className="mt-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B5F28B]">
            03 / Checkout
          </p>

          <h1 className="mt-4 text-[clamp(2.8rem,11vw,5rem)] font-black leading-[0.95] tracking-[-0.065em]">
            FAST
            <span className="block text-[#B5F28B]">GESCHAFFT.</span>
          </h1>

          <p className="mt-5 max-w-md text-sm leading-7 text-white/50">
            Nur noch deine Angaben und dein Lieblingsessen kann zur Abholung
            oder Lieferung vorbereitet werden.
          </p>
        </div>

        {/* Fortschrittsanzeige – dekorativ für unsere Demo */}
        <div aria-hidden="true" className="mt-8 grid grid-cols-3 gap-2">
          <div className="h-1 rounded-full bg-[#B5F28B]" />
          <div className="h-1 rounded-full bg-[#B5F28B]" />
          <div className="h-1 rounded-full bg-white/10" />
        </div>
      </div>

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

      {/* Premium-Kontaktdaten */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#263D2B] text-xl text-[#B5F28B]">
            ♙
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B5F28B]">
              Deine Angaben
            </p>
            <h3 className="mt-1 text-lg font-black">Kontaktdaten</h3>
          </div>
        </div>

        <div className="space-y-5 rounded-2xl border border-white/10 bg-[#1C251E] p-5">
          <div>
            <label
              htmlFor="customer-name"
              className="mb-2 block text-xs font-semibold text-white/60"
            >
              Vollständiger Name
            </label>

            <input
              id="customer-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Max Mustermann"
              autoComplete="name"
              className="h-14 w-full rounded-xl border border-white/10 bg-[#0C100D] px-4 text-sm text-white outline-none transition focus:border-[#B5F28B]"
            />
          </div>

          <div>
            <label
              htmlFor="customer-phone"
              className="mb-2 block text-xs font-semibold text-white/60"
            >
              Telefonnummer
            </label>

            <input
              id="customer-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="0151 12345678"
              autoComplete="tel"
              className="h-14 w-full rounded-xl border border-white/10 bg-[#0C100D] px-4 text-sm text-white outline-none transition focus:border-[#B5F28B]"
            />
          </div>
        </div>

        <p className="mt-3 flex items-center gap-2 text-xs text-white/40">
          <span className="text-[#B5F28B]">✦</span>
          Testbetrieb: Deine Angaben werden zur Bearbeitung der Testbestellung
          gespeichert.
        </p>
      </div>

      {/* Premium-Lieferadresse */}
      {orderType === "delivery" && (
        <div className="mt-8">
          {/* Überschrift */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#263D2B] text-xl text-[#B5F28B]">
              ⌖
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B5F28B]">
                Wohin dürfen wir liefern?
              </p>
              <h3 className="mt-1 text-lg font-black">Lieferadresse</h3>
            </div>
          </div>

          {/* Adressfelder */}
          <div className="space-y-5 rounded-2xl border border-white/10 bg-[#1C251E] p-5">
            <div>
              <label
                htmlFor="delivery-street"
                className="mb-2 block text-xs font-semibold text-white/60"
              >
                Straße und Hausnummer
              </label>

              <input
                id="delivery-street"
                type="text"
                value={street}
                onChange={(event) => setStreet(event.target.value)}
                placeholder="Musterstraße 12"
                autoComplete="street-address"
                className="h-14 w-full rounded-xl border border-white/10 bg-[#0C100D] px-4 text-sm text-white outline-none transition focus:border-[#B5F28B]"
              />
            </div>

            {/* Postleitzahl und Ort nebeneinander */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="delivery-postal"
                  className="mb-2 block text-xs font-semibold text-white/60"
                >
                  Postleitzahl
                </label>

                <input
                  id="delivery-postal"
                  type="text"
                  inputMode="numeric"
                  value={postalCode}
                  onChange={(event) => setPostalCode(event.target.value)}
                  placeholder="34621"
                  autoComplete="postal-code"
                  className="h-14 w-full min-w-0 rounded-xl border border-white/10 bg-[#0C100D] px-3 text-sm text-white outline-none transition focus:border-[#B5F28B]"
                />
              </div>

              <div>
                <label
                  htmlFor="delivery-city"
                  className="mb-2 block text-xs font-semibold text-white/60"
                >
                  Ort
                </label>

                <input
                  id="delivery-city"
                  type="text"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Frielendorf"
                  autoComplete="address-level2"
                  className="h-14 w-full min-w-0 rounded-xl border border-white/10 bg-[#0C100D] px-3 text-sm text-white outline-none transition focus:border-[#B5F28B]"
                />
              </div>
            </div>
          </div>

          {/* Automatische Lieferadressprüfung */}
          <div className="mt-5">
            <button
              type="button"
              onClick={() => void checkDeliveryAddress()}
              disabled={
                checkingDelivery ||
                !street.trim() ||
                !postalCode.trim() ||
                !city.trim()
              }
              className="w-full rounded-xl border border-[#B5F28B]/40 bg-[#263D2B] px-5 py-4 font-bold text-[#B5F28B] transition hover:bg-[#314B36] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {checkingDelivery
                ? "Adresse wird überprüft..."
                : "Lieferadresse überprüfen"}
            </button>

            {currentDeliveryCheck && (
              <div
                role="status"
                className={`mt-4 rounded-xl border p-4 text-sm ${
                  currentDeliveryCheck.valid
                    ? "border-[#B5F28B]/30 bg-[#B5F28B]/10 text-[#B5F28B]"
                    : "border-red-400/30 bg-red-400/10 text-red-300"
                }`}
              >
                <p className="font-bold">{currentDeliveryCheck.message}</p>

                {currentDeliveryCheck.valid && (
                  <div className="mt-3 space-y-2">
                    <p>
                      Entfernung: {currentDeliveryCheck.distanceKm?.toFixed(2)}{" "}
                      km
                    </p>
                    <p>
                      Lieferkosten:{" "}
                      {currentDeliveryCheck.deliveryFee?.toFixed(2)} €
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Erklärung für die Demo */}
          <p className="mt-3 text-xs leading-5 text-white/40">
            <span className="mr-2 text-[#B5F28B]">✦</span>
            Die Lieferkosten werden automatisch anhand deiner geprüften
            Lieferadresse berechnet.
          </p>
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

      {/* Premium-Bestellübersicht */}
      <div className="mt-8">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B5F28B]">
            Fast geschafft
          </p>
          <h3 className="mt-2 text-xl font-black">Deine Bestellübersicht</h3>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#1C251E] p-5">
          {/* Warenwert */}
          <div className="flex justify-between gap-3 text-sm">
            <span className="text-white/60">Warenwert</span>
            <span className="font-semibold">
              {totalPrice.toFixed(2).replace(".", ",")} €
            </span>
          </div>

          {/* Liefergebühren */}
          {orderType === "delivery" && (
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-white/60">Lieferkosten</span>
              <span className="font-semibold">
                {deliveryFee === null
                  ? "Nicht verfügbar"
                  : `${deliveryFee.toFixed(2).replace(".", ",")} €`}
              </span>
            </div>
          )}

          {/* Mindestbestellwert */}
          {orderType === "delivery" && missingAmount > 0 && (
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs leading-5 text-amber-300">
              Noch {missingAmount.toFixed(2).replace(".", ",")} € bis zum
              Mindestbestellwert von 20,00 €.
            </div>
          )}

          {/* Gesamtbetrag */}
          <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-5">
            <span className="font-bold">Gesamtbetrag</span>

            <span className="text-2xl font-black text-[#B5F28B]">
              {finalTotal.toFixed(2).replace(".", ",")} €
            </span>
          </div>
        </div>
      </div>

      {/* Bestellung an den Server übermitteln */}
      <button
        type="button"
        onClick={() => void completeDemoOrder()}
        disabled={!canContinue || isSubmitting}
        className="mt-6 flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl bg-[#B5F28B] px-5 text-left font-black text-[#0C100D] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span>
          {isSubmitting
            ? "BESTELLUNG WIRD GESPEICHERT..."
            : canContinue
              ? "TESTBESTELLUNG ABSCHICKEN"
              : "ANGABEN VERVOLLSTÄNDIGEN"}
        </span>

        <span className="text-2xl" aria-hidden="true">
          →
        </span>
      </button>

      {submitError && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {submitError}
        </p>
      )}

      <p className="mt-3 text-center text-xs text-white/40">
        Testbetrieb: Abholbestellungen werden in der Demo-Datenbank gespeichert.
        Bitte keine echten Kundenbestellungen aufgeben.
      </p>
    </section>
  );
}
