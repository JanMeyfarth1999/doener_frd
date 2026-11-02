"use client";

// Daten, die eine Demo-Bestellung enthält.
export type DemoOrder = {
  orderNumber: string;
  customerName: string;
  orderType: "pickup" | "delivery";
  items: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;

  deliveryFee: number;
  subtotal: number;
};

// Die Komponente erhält eine abgeschlossene Demo-Bestellung.

export default function OrderConfirmation({
  order,
  onNewOrder,
}: {
  order: DemoOrder;
  onNewOrder: () => void;
}) {
  return (
    <section
      id="bestellbestaetigung"
      className="fixed inset-0 z-[100] overflow-y-auto bg-[#101411] px-5 py-12 text-white"
    >
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#263D2B] text-4xl text-[#9ACD87]">
            ✓
          </div>

          <h2 className="mt-6 text-3xl font-black">Bestellung bestätigt!</h2>

          <p className="mt-3 text-sm text-white/60">
            Danke, {order.customerName}! Deine Demo-Bestellung wurde simuliert.
          </p>

          <p className="mt-4 text-xs font-bold text-[#9ACD87]">
            DEMO – KEINE ECHTE BESTELLUNG
          </p>
        </div>

        {/* Bestellübersicht */}
        <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex justify-between">
            <span className="text-white/60">Bestellnummer</span>
            <span className="font-bold">{order.orderNumber}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-white/60">Bestellart</span>
            <span className="font-bold">
              {order.orderType === "pickup" ? "Abholung" : "Lieferung"}
            </span>
          </div>

          <div className="border-t border-white/10 pt-4">
            <h3 className="mb-4 font-bold">Deine Gerichte</h3>

            {order.items.map((item) => (
              <div
                key={item.id}
                className="mb-3 flex justify-between gap-3 text-sm"
              >
                <span>
                  {item.quantity} × {item.name}
                </span>

                <span>
                  {(item.price * item.quantity).toFixed(2).replace(".", ",")} €
                </span>
              </div>
            ))}
          </div>

          {/* Preisübersicht */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            {/* Warenwert */}
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Warenwert</span>
              <span>{order.subtotal.toFixed(2).replace(".", ",")} €</span>
            </div>

            {/* Lieferkosten nur bei Lieferung anzeigen */}
            {order.orderType === "delivery" && (
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Lieferkosten</span>
                <span>{order.deliveryFee.toFixed(2).replace(".", ",")} €</span>
              </div>
            )}

            {/* Endgültiger Gesamtbetrag */}
            <div className="flex justify-between border-t border-white/10 pt-4">
              <span className="font-bold">Gesamtbetrag</span>

              <span className="text-xl font-black text-[#9ACD87]">
                {order.total.toFixed(2).replace(".", ",")} €
              </span>
            </div>
          </div>
        </div>

        <p className="mt-6 rounded-xl bg-white/5 p-4 text-center text-xs text-white/50">
          Dies ist eine Demo-Version. Es wurde keine Bestellung an das
          Restaurant gesendet.
        </p>

        {/* Neue Bestellung starten */}
        <button
          type="button"
          onClick={onNewOrder}
          className="mt-6 w-full rounded-2xl bg-[#9ACD87] px-6 py-4 font-bold text-[#101411] transition active:scale-95"
        >
          Bestellübersicht schließen
        </button>
      </div>
    </section>
  );
}
