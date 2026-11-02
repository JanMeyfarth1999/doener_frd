"use client";

import { useState } from "react";
import { menuItems } from "@/data/menu";

import { useCart } from "@/context/CartContext";

export default function MenuSection() {
  const { addItem } = useCart();
  // Aktuell ausgewählte Kategorie.
  const [category, setCategory] = useState("Alle");

  // Alle verfügbaren Kategorien ermitteln.
  const categories = [
    "Alle",
    ...new Set(menuItems.map((item) => item.category)),
  ];

  // Nur Gerichte der gewählten Kategorie anzeigen.
  const filteredItems = menuItems.filter(
    (item) => category === "Alle" || item.category === category,
  );

  return (
    <section id="speisekarte" className="mx-auto max-w-6xl px-5 py-10">
      <h2 className="text-2xl font-bold">Unsere Speisekarte</h2>

      {/* Kategorien */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-3">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-full px-5 py-3 text-sm font-semibold transition ${
              category === item
                ? "bg-[#9ACD87] text-[#101411]"
                : "bg-white/10 text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Produktkarten */}
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {filteredItems.map((item) => (
          <article
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div>
              <h3 className="font-bold">{item.name}</h3>

              <p className="mt-2 text-sm text-white/50">{item.description}</p>

              <p className="mt-3 font-bold text-[#9ACD87]">
                {item.price.toFixed(2).replace(".", ",")} €
              </p>
            </div>

            <button
              type="button"
              onClick={() => addItem(item)}
              aria-label={`${item.name} zum Warenkorb hinzufügen`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#9ACD87] text-2xl font-bold text-[#101411]"
            >
              +
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
