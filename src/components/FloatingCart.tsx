"use client";

import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import CartDrawer from "@/components/CartDrawer";

export default function FloatingCart() {
  // Steuert, ob das Warenkorb-Fenster geöffnet ist.
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Werte aus unserem gemeinsamen Warenkorb.
  const { totalQuantity, totalPrice } = useCart();

  // Öffnet den Warenkorb.
  function openCart() {
    setIsCartOpen(true);
  }

  // Schließt den Warenkorb.
  function closeCart() {
    setIsCartOpen(false);
  }

  // Schließt den Warenkorb und öffnet den Checkout.

  function goToCheckout() {
    // Warenkorb schließen.
    setIsCartOpen(false);

    // Checkout als eigene Ansicht öffnen.
    window.dispatchEvent(new CustomEvent("open-checkout"));
  }

  return (
    <>
      <AnimatePresence>
        {totalQuantity > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="pointer-events-none fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-[45] px-4 md:bottom-6"
          >
            <div className="mx-auto max-w-md">
              <motion.button
                type="button"
                onClick={openCart}
                whileTap={{ scale: 0.97 }}
                className="pointer-events-auto flex min-h-[76px] w-full items-center justify-between gap-3 rounded-2xl bg-[#B5F28B] p-3 text-left text-[#0C100D] shadow-[0_12px_50px_rgba(0,0,0,0.5)]"
              >
                {/* Warenkorb-Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0C100D] text-xl text-[#B5F28B]">
                  🛍
                </div>

                {/* Anzahl der Produkte */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black">Warenkorb ansehen</p>

                  <p className="mt-1 text-xs font-medium text-[#30432E]">
                    {totalQuantity}{" "}
                    {totalQuantity === 1 ? "Gericht" : "Gerichte"}
                  </p>
                </div>

                {/* Gesamtpreis */}
                <div className="shrink-0 text-right">
                  <p className="text-lg font-black">
                    {totalPrice.toFixed(2).replace(".", ",")} €
                  </p>

                  <p className="mt-1 text-xs font-bold">Ansehen ↗</p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animierter Warenkorb */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer onClose={closeCart} onCheckout={goToCheckout} />
        )}
      </AnimatePresence>
    </>
  );
}
