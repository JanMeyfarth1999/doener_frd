
"use client";

import { useState } from "react";
import { motion } from "motion/react";

import { menuItems, type MenuItem } from "@/data/menu";
import ProductConfigurator from "@/components/ProductConfigurator";

export default function MenuSection() {
  // Produkt, dessen Konfigurator geöffnet ist.
  const [selectedProduct, setSelectedProduct] =
    useState<MenuItem | null>(null);

  // Aktuell ausgewählte Kategorie.
  const [category, setCategory] = useState("Alle");

  // Suchbegriff des Kunden.
  const [search, setSearch] = useState("");

  // Kategorien automatisch aus den Produktdaten erzeugen.
  const categories = [
    "Alle",
    ...new Set(menuItems.map((item) => item.category)),
  ];

  // Produkte nach Kategorie und Suchbegriff filtern.
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      category === "Alle" || item.category === category;

    const query = search.trim().toLocaleLowerCase("de");

    const matchesSearch =
      item.name.toLocaleLowerCase("de").includes(query) ||
      item.description.toLocaleLowerCase("de").includes(query);

    return matchesCategory && matchesSearch;
  });

  // Preis für die Speisekarte ermitteln.
  function getDisplayPrice(item: MenuItem) {
    if (item.sizes && item.sizes.length > 0) {
      const lowestPrice = Math.min(
        ...item.sizes.map((size) => size.price)
      );

      return `Ab ${lowestPrice.toFixed(2).replace(".", ",")} €`;
    }

    return `${item.price.toFixed(2).replace(".", ",")} €`;
  }

  return (
    <>
      <section
        id="speisekarte"
        className="scroll-mt-24 bg-[#0C100D] px-5 py-12 text-[#F5F2E9]"
      >
        <div className="mx-auto max-w-6xl">
          {/* Überschrift */}
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B5F28B]">
                02 / Entdecken
              </p>

              <h2 className="mt-3 text-3xl font-black leading-none tracking-tight sm:text-5xl">
                WAS DARF&apos;S
                <span className="block text-[#B5F28B]">
                  SEIN?
                </span>
              </h2>
            </div>

            <span className="text-xs text-white/40">
              {filteredItems.length} Gerichte
            </span>
          </div>

          {/* Suchfunktion */}
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#1C251E] px-4">
            <span aria-hidden="true" className="text-xl text-[#B5F28B]">
              ⌕
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Wonach hast du Hunger?"
              aria-label="Speisekarte durchsuchen"
              className="h-14 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
          </div>

          {/* Scrollbare Kategorien */}
          <div className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={`shrink-0 rounded-full px-5 py-3 text-xs font-bold transition-colors ${
                  category === item
                    ? "bg-[#B5F28B] text-[#0C100D]"
                    : "border border-white/10 bg-[#1C251E] text-white/70"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Produktkarten */}
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const hasSizes =
                item.sizes && item.sizes.length > 0;

              return (
                <motion.article
                  key={item.id}
                  whileTap={{ scale: 0.99 }}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#1C251E] p-5 transition-colors hover:border-[#B5F28B]/40"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-bold leading-snug">
                        {item.name}
                      </h3>

                      {hasSizes && (
                        <span className="shrink-0 rounded-full bg-[#B5F28B]/10 px-2 py-1 text-[10px] font-bold text-[#B5F28B]">
                          {item.sizes!.length} Größen
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs leading-5 text-white/45">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <span className="text-lg font-black text-[#B5F28B]">
                      {getDisplayPrice(item)}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedProduct(item)}
                      aria-label={
                        hasSizes
                          ? `${item.name}: Größe wählen`
                          : `${item.name} auswählen`
                      }
                      className="flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[#B5F28B] px-4 text-sm font-black text-[#0C100D] transition active:scale-95"
                    >
                      {hasSizes ? "Größe wählen ↗" : "+"}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {/* Keine Suchergebnisse */}
          {filteredItems.length === 0 && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-[#1C251E] p-8 text-center">
              <p className="font-bold">
                Keine Gerichte gefunden
              </p>

              <p className="mt-2 text-sm text-white/50">
                Versuche einen anderen Suchbegriff.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("Alle");
                }}
                className="mt-5 text-sm font-bold text-[#B5F28B]"
              >
                Filter zurücksetzen
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Produktkonfigurator */}
      {selectedProduct && (
        <ProductConfigurator
          key={selectedProduct.id}
          item={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
