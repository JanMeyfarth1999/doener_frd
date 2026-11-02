
"use client";

import { motion } from "motion/react";
import { useCart } from "@/context/CartContext";

type CartDrawerProps = {
  onClose: () => void;
  onCheckout: () => void;
};

export default function CartDrawer({
  onClose,
  onCheckout,
}: CartDrawerProps) {
  const {
    items,
    addItem,
    decreaseItem,
    removeItem,
    totalPrice,
  } = useCart();

  // Einheitliche Darstellung der Preise.
  function formatPrice(price: number) {
    return price.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center">
      {/* Dunkler Hintergrund */}
      <motion.button
        type="button"
        aria-label="Warenkorb schließen"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Beweglicher Warenkorb */}
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 300,
        }}
        className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#101411] text-white shadow-2xl md:rounded-[2rem]"
      >
        {/* Kopfbereich */}
        <div className="shrink-0 border-b border-white/10 px-5 pb-5 pt-4">
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/20 md:hidden" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B5F28B]">
                Deine Bestellung
              </p>

              <h2
                id="cart-title"
                className="mt-2 text-2xl font-black"
              >
                Warenkorb
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Warenkorb schließen"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollbarer Produktbereich */}
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
          {items.length === 0 ? (
            <p className="rounded-2xl bg-white/5 p-6 text-center text-white/50">
              Dein Warenkorb ist noch leer.
            </p>
          ) : (
            items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-[#1C251E] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-xs text-white/40">
                      {formatPrice(item.price)} pro Stück
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-400"
                  >
                    Entfernen
                  </button>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  {/* Menge verändern */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => decreaseItem(item.id)}
                      aria-label={`${item.name} reduzieren`}
                      className="h-10 w-10 rounded-xl bg-white/10 text-xl"
                    >
                      −
                    </button>

                    <span className="font-bold">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => addItem(item)}
                      aria-label={`${item.name} erhöhen`}
                      className="h-10 w-10 rounded-xl bg-[#B5F28B] text-xl font-bold text-[#0C100D]"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-bold text-[#B5F28B]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Feststehender Abschlussbereich */}
        <div className="shrink-0 border-t border-white/10 bg-[#101411] px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-5">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-white/60">
              Zwischensumme
            </span>

            <span className="text-2xl font-black text-[#B5F28B]">
              {formatPrice(totalPrice)}
            </span>
          </div>

          <button
            type="button"
            onClick={onCheckout}
            disabled={items.length === 0}
            className="flex min-h-14 w-full items-center justify-between rounded-2xl bg-[#B5F28B] px-5 font-black text-[#0C100D] transition active:scale-95 disabled:opacity-40"
          >
            <span>Weiter zur Bestellung</span>
            <span>→</span>
          </button>

          <p className="mt-3 text-center text-[11px] text-white/40">
            Lieferkosten werden im Checkout berücksichtigt.
          </p>
        </div>
      </motion.section>
    </div>
  );
}
