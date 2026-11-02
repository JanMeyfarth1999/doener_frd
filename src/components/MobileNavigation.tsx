
"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function MobileNavigation() {
  const [active, setActive] = useState("start");

  // Gesamtanzahl der Produkte aus dem Warenkorb.
  const { totalQuantity } = useCart();

  // Springt zum ausgewählten Bereich.
  function navigateTo(id: string) {
    setActive(id);

    const targetId =
      id === "start"
        ? "startseite"
        : id === "menu"
          ? "speisekarte"
          : "warenkorb";

    document.getElementById(targetId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const navigationItems = [
    { id: "start", label: "Start", icon: "⌂" },
    { id: "menu", label: "Speisekarte", icon: "☰" },
    { id: "cart", label: "Warenkorb", icon: "🛍" },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#151A16] px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 md:hidden"
    >
      <div className="mx-auto flex max-w-md justify-around">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigateTo(item.id)}
            aria-current={active === item.id ? "location" : undefined}
            className={`relative flex min-h-12 min-w-20 flex-col items-center justify-center gap-1 text-xs transition ${
              active === item.id
                ? "text-[#9ACD87]"
                : "text-white/50"
            }`}
          >
            <span className="text-2xl">{item.icon}</span>

            <span>{item.label}</span>

            {/* Anzahl der Produkte anzeigen */}
            {item.id === "cart" && totalQuantity > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#9ACD87] px-1 text-[10px] font-bold text-[#101411]">
                {totalQuantity}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
