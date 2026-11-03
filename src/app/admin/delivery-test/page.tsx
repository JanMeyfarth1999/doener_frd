import { checkDeliveryArea } from "@/lib/deliveryArea";
import { validateDeliveryAddress } from "@/lib/validateDeliveryAddress";
import { connection } from "next/server";
import { Suspense } from "react";

async function DeliveryTestContent() {
  // Adressprüfung erst bei einer tatsächlichen Anfrage ausführen.
  await connection();
  // Test 1: Gleiche Position wie das Restaurant.
  const nearby = checkDeliveryArea(50.975458, 9.3240881);

  // Test 2: Eine deutlich weiter entfernte Position.
  const farAway = checkDeliveryArea(51.1, 9.5);

  // Testet die echte Restaurantadresse über die Adresssuche.
  const addressTest = await validateDeliveryAddress(
    "Hauptstraße 31",
    "34621",
    "Frielendorf",
  );

  return (
    <main className="min-h-screen bg-[#0C100D] p-8 text-white">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold">Liefergebiet testen</h1>

        <p className="mt-3 text-white/50">Maximaler Lieferradius: 5 km</p>

        <div className="mt-8 space-y-4">
          {[
            { name: "Test 1 – Restaurant", result: nearby },
            { name: "Test 2 – Außerhalb", result: farAway },
          ].map(({ name, result }) => (
            <div key={name} className="rounded-2xl bg-[#1C251E] p-5">
              <h2 className="text-lg font-bold">{name}</h2>

              <p className="mt-3">
                Entfernung: {result.distanceKm.toFixed(2)} km
              </p>

              <p className="mt-2">
                Liefergebiet:{" "}
                <span className="text-[#B5F28B]">
                  {result.withinRadius ? "Ja" : "Nein"}
                </span>
              </p>

              <p className="mt-2">
                Lieferkosten:{" "}
                {result.deliveryFee === null
                  ? "Keine Lieferung"
                  : `${result.deliveryFee.toFixed(2)} €`}
              </p>
            </div>
          ))}

          {/* Test mit einer echten Straßenadresse */}
          <div className="rounded-2xl bg-[#1C251E] p-5">
            <h2 className="text-lg font-bold">Test 3 – Echte Lieferadresse</h2>

            <p className="mt-3 text-sm text-white/60">
              Hauptstraße 31, 34621 Frielendorf
            </p>

            <p className="mt-4">Ergebnis: {addressTest.message}</p>

            <p className="mt-2">
              Entfernung:{" "}
              {addressTest.distanceKm === null
                ? "Nicht ermittelt"
                : `${addressTest.distanceKm.toFixed(2)} km`}
            </p>

            <p className="mt-2">
              Lieferkosten:{" "}
              {addressTest.deliveryFee === null
                ? "Nicht verfügbar"
                : `${addressTest.deliveryFee.toFixed(2)} €`}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DeliveryTestPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0C100D] p-8 text-white">
          <p className="text-[#B5F28B]">Liefergebiet wird überprüft...</p>
        </main>
      }
    >
      <DeliveryTestContent />
    </Suspense>
  );
}
