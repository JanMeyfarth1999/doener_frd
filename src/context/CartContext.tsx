"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import type { MenuItem } from "@/data/menu";

// Ein Produkt im Warenkorb besitzt zusätzlich eine Menge.
type CartItem = MenuItem & {
  quantity: number;
};

// Legt fest, welche Funktionen der Warenkorb anbietet.

type CartContextType = {
  items: CartItem[];

  // Fügt ein Produkt hinzu.
  addItem: (item: MenuItem) => void;

  // Verringert die Menge um eins.
  decreaseItem: (id: number) => void;

  // Entfernt ein Produkt vollständig.
  removeItem: (id: number) => void;

  // Gesamtpreis aller Produkte.
  totalPrice: number;

  // Gesamtanzahl der Gerichte.
  totalQuantity: number;

  // Leert den gesamten Warenkorb.
  clearCart: () => void;
};

// Gemeinsamer Speicher für unseren Warenkorb.
const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Fügt ein Gericht hinzu oder erhöht seine Menge.
  function addItem(item: MenuItem) {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) => cartItem.id === item.id,
      );

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }

      return [...currentItems, { ...item, quantity: 1 }];
    });
  }

  // Verringert die Menge eines Produkts um eins.
  function decreaseItem(id: number) {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  // Entfernt ein Produkt vollständig.
  function removeItem(id: number) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  // Entfernt alle Produkte aus dem Warenkorb.
  function clearCart() {
    setItems([]);
  }

  // Berechnet die Gesamtsumme.
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Berechnet die Anzahl aller Gerichte.
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        decreaseItem,
        removeItem,
        clearCart,
        totalPrice,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Ermöglicht anderen Komponenten den Zugriff.
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart muss innerhalb des CartProvider verwendet werden.",
    );
  }

  return context;
}
