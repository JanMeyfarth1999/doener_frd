"use client";

import MobileNavigation from "@/components/MobileNavigation";
import MenuSection from "@/components/MenuSection";
import { useOrder } from "@/context/OrderContext";
import CartSection from "@/components/CartSection";
import CheckoutSection from "@/components/CheckoutSection";
import HeroSection from "@/components/HeroSection";

export default function Home() {
  // Speichert, welche Bestellart ausgewählt wurde.

  const { orderType, setOrderType } = useOrder();

  return (
    <>
      <main className="min-h-screen bg-[#101411] pb-36 text-white">
        {/* Kopfbereich mit Restaurantnamen */}
        <header id="startseite" className="border-b border-white/10 px-5 py-5">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9ACD87]">
              Frielendorfer
            </p>

            <h1 className="mt-1 text-xl font-bold">Pizza & Dönerhaus</h1>
          </div>
        </header>

        {/* Neuer Premium-Hero */}
        <HeroSection />

        {/* Auswahl zwischen Abholung und Lieferung */}
        <section className="mx-auto max-w-6xl px-5 pt-12">
          <h2 className="mb-5 text-2xl font-bold">
            Wie möchtest du bestellen?
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOrderType("pickup")}
              aria-pressed={orderType === "pickup"}
              className={`rounded-2xl border p-5 text-left transition ${
                orderType === "pickup"
                  ? "border-[#9ACD87] bg-[#263D2B]"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <span className="text-2xl">🛍️</span>
              <p className="mt-3 font-bold">Abholung</p>
            </button>

            <button
              type="button"
              onClick={() => setOrderType("delivery")}
              aria-pressed={orderType === "delivery"}
              className={`rounded-2xl border p-5 text-left transition ${
                orderType === "delivery"
                  ? "border-[#9ACD87] bg-[#263D2B]"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <span className="text-2xl">🚴</span>
              <p className="mt-3 font-bold">Lieferung</p>
            </button>
          </div>

          <div className="mt-4 rounded-2xl bg-white/5 p-5">
            {orderType === "pickup" ? (
              <p className="text-sm text-white/70">
                Abholung in der Hauptstraße 31, 34621 Frielendorf.
              </p>
            ) : (
              <p className="text-sm text-white/70">
                Mindestbestellwert 20 €. Liefergebühren werden später anhand der
                Entfernung berechnet.
              </p>
            )}
          </div>
        </section>

        {/* Unsere interaktive Speisekarte */}
        <div id="bestellen">
          <MenuSection />
        </div>
        {/* Warenkorb mit Mengensteuerung */}
        <CartSection />

        {/* Bestellabschluss für Abholung und Lieferung */}
        <CheckoutSection />
      </main>
      <MobileNavigation />
    </>
  );
}
