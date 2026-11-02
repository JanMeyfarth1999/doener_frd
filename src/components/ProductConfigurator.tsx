
"use client";

import { useState } from "react";
import type { MenuItem } from "@/data/menu";
import { useCart } from "@/context/CartContext";

type Props = {
  item: MenuItem;
  onClose: () => void;
};

export default function ProductConfigurator({
  item,
  onClose,
}: Props) {
  // Aktuell ausgewählte Größe.
  const [selectedSize, setSelectedSize] = useState(0);

  // Zugriff auf unseren bestehenden Warenkorb.
  const { addItem } = useCart();

  // Verfügbare Größen des Produkts.
  const sizes = item.sizes ?? [];

  // Preis anhand der gewählten Größe.
  const selectedPrice =
    sizes.length > 0
      ? sizes[selectedSize].price
      : item.price;

  // Gericht in den Warenkorb legen.
  function handleAddToCart() {
    const selectedItem: MenuItem =
      sizes.length > 0
        ? {
            ...item,
            // Eindeutige ID für jede Größenvariante.
            id: item.id * 1000 + selectedSize + 1,
            name: `${item.name} – ${sizes[selectedSize].label}`,
            price: selectedPrice,
          }
        : item;

    addItem(selectedItem);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/75 md:items-center">

      {/* Hintergrund zum Schließen */}
      <button
        type="button"
        aria-label="Konfigurator schließen"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      {/* Produktfenster */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-title"
        className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#151B16] text-white shadow-2xl md:rounded-[2rem]"
      >
        {/* Griff und Schließen-Button */}
        <div className="flex items-center justify-between px-6 pt-5">
          <div className="h-1 w-10 rounded-full bg-white/20" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl"
          >
            ×
          </button>
        </div>

        {/* Scrollbarer Inhalt */}
        <div className="overflow-y-auto px-6 pb-6">
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#9ACD87]">
            Gericht konfigurieren
          </p>

          <h2
            id="product-title"
            className="mt-3 text-2xl font-black"
          >
            {item.name}
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/50">
            {item.description}
          </p>

          {/* Größenauswahl */}
          {sizes.length > 0 && (
            <div className="mt-8">
              <h3 className="font-bold">
                Größe auswählen
              </h3>

              <div className="mt-4 space-y-3">
                {sizes.map((size, index) => (
                  <button
                    key={size.label}
                    type="button"
                    onClick={() => setSelectedSize(index)}
                    aria-pressed={selectedSize === index}
                    className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                      selectedSize === index
                        ? "border-[#9ACD87] bg-[#263D2B]"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          selectedSize === index
                            ? "border-[#9ACD87]"
                            : "border-white/30"
                        }`}
                      >
                        {selectedSize === index && (
                          <span className="h-2.5 w-2.5 rounded-full bg-[#9ACD87]" />
                        )}
                      </span>

                      <span className="font-medium">
                        {size.label}
                      </span>
                    </span>

                    <span className="font-bold">
                      {size.price.toFixed(2).replace(".", ",")} €
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fester Bestellbutton */}
        <div className="border-t border-white/10 bg-[#151B16] px-6 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-4">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex min-h-14 w-full items-center justify-between rounded-2xl bg-[#9ACD87] px-5 font-bold text-[#101411] transition active:scale-[0.98]"
          >
            <span>Zum Warenkorb hinzufügen</span>

            <span>
              {selectedPrice.toFixed(2).replace(".", ",")} €
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
