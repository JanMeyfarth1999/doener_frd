"use client";
import { useState } from "react";
import { menuItems } from "@/data/menu";
import ProductConfigurator from "@/components/ProductConfigurator";
import type { MenuItem } from "@/data/menu";

export default function MenuSection() {
  // Speichert das Produkt, dessen Konfigurator geöffnet ist.
  // null bedeutet: Kein Produkt ist ausgewählt.
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

 
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
    <>
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
              className="rounded-2xl border border-white/10 bg-[#1D2920] p-4"
            >
              <div>
                <h3 className="font-bold">{item.name}</h3>

                <p className="mt-2 text-sm text-white/50">{item.description}</p>

                {/* Preis und Größenauswahl */}
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    {/* Hinweis bei mehreren Größen */}
                    {item.sizes && item.sizes.length > 0 && (
                      <p className="mb-1 text-xs text-white/50">
                        {item.sizes.length} Größen verfügbar
                      </p>
                    )}

                    {/* Preis anzeigen */}
                    <p className="text-lg font-black text-[#9ACD87]">
                      {item.sizes && item.sizes.length > 0 ? "Ab " : ""}
                      {(item.sizes && item.sizes.length > 0
                        ? Math.min(...item.sizes.map((size) => size.price))
                        : item.price
                      )
                        .toFixed(2)
                        .replace(".", ",")}{" "}
                      €
                    </p>
                  </div>

                  {/* Button für Produktauswahl */}
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(item)}
                    aria-label={
                      item.sizes && item.sizes.length > 0
                        ? `${item.name}: Größe wählen`
                        : `${item.name} auswählen`
                    }
                    className="flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[#9ACD87] px-4 font-bold text-[#101411] transition active:scale-95"
                  >
                    {item.sizes && item.sizes.length > 0
                      ? "Größe wählen →"
                      : "+"}
                  </button>
                </div>

                {/* Schließt den Textbereich der Produktkarte */}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Produktkonfigurator als Bottom Sheet */}
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
