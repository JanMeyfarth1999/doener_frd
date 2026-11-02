
"use client";

import { useCart } from "@/context/CartContext";

export default function CartSection() {
  // Warenkorbdaten und Funktionen abrufen.
  const {
    items,
    addItem,
    decreaseItem,
    removeItem,
    totalPrice,
  } = useCart();

  return (
    <section
      id="warenkorb"
      className="mx-auto max-w-6xl px-5 py-10"
    >
      <h2 className="mb-6 text-2xl font-bold">
        Dein Warenkorb
      </h2>

      {/* Hinweis, wenn noch keine Produkte enthalten sind */}
      {items.length === 0 ? (
        <p className="rounded-2xl bg-white/5 p-6 text-sm text-white/60">
          Dein Warenkorb ist noch leer.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="mt-1 text-sm text-white/50">
                    {item.price.toFixed(2).replace(".", ",")} €
                    pro Stück
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-sm text-red-400"
                >
                  Entfernen
                </button>
              </div>

              {/* Mengensteuerung */}
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => decreaseItem(item.id)}
                    className="h-10 w-10 rounded-xl bg-white/10"
                  >
                    −
                  </button>

                  <span className="font-bold">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => addItem(item)}
                    className="h-10 w-10 rounded-xl bg-[#9ACD87] font-bold text-[#101411]"
                  >
                    +
                  </button>
                </div>

                <p className="font-bold">
                  {(item.price * item.quantity)
                    .toFixed(2)
                    .replace(".", ",")} €
                </p>
              </div>
            </article>
          ))}

          {/* Gesamtpreis */}
          <div className="flex items-center justify-between border-t border-white/10 pt-5">
            <span className="font-bold">Gesamtpreis</span>

            <span className="text-xl font-black text-[#9ACD87]">
              {totalPrice.toFixed(2).replace(".", ",")} €
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
