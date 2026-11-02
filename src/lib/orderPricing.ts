
import "server-only";

import { menuItems } from "@/data/menu";

// Daten, die der Browser an unseren Server senden darf.
type RequestedItem = {
  id: number;
  quantity: number;
};

// Geprüftes Gericht mit dem echten Speisekartenpreis.
type PricedItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

export function calculateOrderPrices(input: unknown) {
  // Der Warenkorb muss ein Array mit 1 bis 50 Positionen sein.
  if (
    !Array.isArray(input) ||
    input.length === 0 ||
    input.length > 50
  ) {
    throw new Error("Ungültiger Warenkorb.");
  }

  const items: PricedItem[] = [];

  for (const entry of input) {
    if (!entry || typeof entry !== "object") {
      throw new Error("Ungültiges Gericht.");
    }

    const { id, quantity } = entry as RequestedItem;

    // Nur gültige Produkt-IDs und Mengen erlauben.
    if (
      !Number.isSafeInteger(id) ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > 30
    ) {
      throw new Error("Ungültige Produkt-ID oder Menge.");
    }

    // Größenvarianten verwenden im Warenkorb die ID:
    // Produkt-ID * 1000 + Größenindex + 1
    const hasSizeId = id >= 1000;

    const productId = hasSizeId
      ? Math.floor(id / 1000)
      : id;

    const sizeIndex = hasSizeId
      ? (id % 1000) - 1
      : -1;

    // Produkt aus unserer echten Speisekarte suchen.
    const product = menuItems.find(
      (item) => item.id === productId,
    );

    if (!product) {
      throw new Error("Produkt nicht gefunden.");
    }

    let price = product.price;
    let name = product.name;

    if (product.sizes && product.sizes.length > 0) {
      // Bei Produkten mit Größenauswahl muss
      // eine gültige Größenvariante angegeben werden.
      const size = product.sizes[sizeIndex];

      if (!hasSizeId || !size) {
        throw new Error("Ungültige Produktgröße.");
      }

      price = size.price;
      name = `${product.name} – ${size.label}`;
    } else if (hasSizeId) {
      throw new Error("Dieses Produkt hat keine Größenauswahl.");
    }

    items.push({
      id,
      name,
      quantity,
      price,
    });
  }

  // In Cent rechnen, um Rundungsfehler zu vermeiden.
  const subtotalCents = items.reduce(
    (sum, item) =>
      sum + Math.round(item.price * 100) * item.quantity,
    0,
  );

  return {
    items,
    subtotal: subtotalCents / 100,
  };
}
