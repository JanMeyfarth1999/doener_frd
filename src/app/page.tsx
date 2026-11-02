"use client";

import OrderTypeSelector from "@/components/OrderTypeSelector";
import MobileNavigation from "@/components/MobileNavigation";
import MenuSection from "@/components/MenuSection";
import CartSection from "@/components/CartSection";
import CheckoutSection from "@/components/CheckoutSection";
import HeroSection from "@/components/HeroSection";
import PremiumHeader from "@/components/PremiumHeader";
import FloatingCart from "@/components/FloatingCart";

export default function Home() {
  // Speichert, welche Bestellart ausgewählt wurde.

  return (
    <>
      <main className="min-h-screen bg-[#101411] pb-56 text-white">
        {/* Premium-Header */}
        <PremiumHeader />

        {/* Neuer Premium-Hero */}
        <HeroSection />

        {/* Premium-Auswahl für Abholung und Lieferung */}
        <OrderTypeSelector />

        {/* Unsere interaktive Speisekarte */}
        <div id="bestellen">
          <MenuSection />
        </div>
        {/* Warenkorb mit Mengensteuerung */}
        <CartSection />

        {/* Bestellabschluss für Abholung und Lieferung */}
        <CheckoutSection />

        {/* Schwebende Warenkorb-Leiste */}
        <FloatingCart />
      </main>
      <MobileNavigation />
    </>
  );
}
