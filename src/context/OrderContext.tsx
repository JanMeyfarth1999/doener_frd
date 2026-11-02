
"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

// Welche Bestellarten sind möglich?
export type OrderType = "pickup" | "delivery";

// Welche Daten stellt unser Context bereit?
type OrderContextType = {
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
};

// Gemeinsamer Speicher für die Bestellart.
const OrderContext = createContext<OrderContextType | null>(null);

export function OrderProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Standardmäßig ist Abholung ausgewählt.
  const [orderType, setOrderType] = useState<OrderType>("pickup");

  return (
    <OrderContext.Provider value={{ orderType, setOrderType }}>
      {children}
    </OrderContext.Provider>
  );
}

// Zugriff auf die Bestellart in anderen Komponenten.
export function useOrder() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error(
      "useOrder muss innerhalb des OrderProvider verwendet werden."
    );
  }

  return context;
}
