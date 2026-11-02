
"use client";

import { motion } from "motion/react";
import { useOrder } from "@/context/OrderContext";

export default function OrderTypeSelector() {
  const { orderType, setOrderType } = useOrder();

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="rounded-[2rem] border border-white/10 bg-[#171F19] p-5 shadow-2xl md:p-8">
        {/* Überschrift */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#B5F28B]">
            01 / DEINE BESTELLUNG
          </span>

          <span className="text-[9px] text-white/40">
            ONLINE ORDERING
          </span>
        </div>

        <h2 className="mt-5 text-2xl font-black tracking-tight text-[#F5F2E9]">
          WIE MÖCHTEST DU ESSEN?
        </h2>

        {/* Bestellart auswählen */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            {
              type: "pickup" as const,
              icon: "↗",
              title: "Abholung",
              description: "Direkt im Laden",
            },
            {
              type: "delivery" as const,
              icon: "➜",
              title: "Lieferung",
              description: "Zu dir nach Hause",
            },
          ].map((option) => (
            <motion.button
              key={option.type}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setOrderType(option.type)}
              aria-pressed={orderType === option.type}
              className={`flex min-h-36 flex-col items-start justify-between rounded-2xl border p-4 text-left transition-colors ${
                orderType === option.type
                  ? "border-[#B5F28B] bg-[#233B28]"
                  : "border-white/10 bg-[#1B221D]"
              }`}
            >
              <span
                className={`text-2xl ${
                  orderType === option.type
                    ? "text-[#B5F28B]"
                    : "text-white/40"
                }`}
              >
                {option.icon}
              </span>

              <div>
                <p className="font-bold text-white">
                  {option.title}
                </p>

                <p className="mt-1 text-xs text-white/40">
                  {option.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Hinweis zur ausgewählten Bestellart */}
        <div className="mt-4 rounded-2xl bg-[#0C100D]/60 p-4">
          {orderType === "pickup" ? (
            <>
              <p className="text-sm font-bold text-white">
                Abholung im Restaurant
              </p>
              <p className="mt-2 text-xs text-white/50">
                Hauptstraße 31, 34621 Frielendorf
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-white">
                Wir liefern zu dir!
              </p>
              <p className="mt-2 text-xs leading-5 text-white/50">
                Mindestbestellwert 20,00 €.
                Reguläre Lieferzeiten 17:00–21:30 Uhr.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
