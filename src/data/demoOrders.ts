
// Mögliche Bestellstatus.
export type OrderStatus =
  | "new"
  | "preparing"
  | "ready"
  | "rejected";

// Ein Gericht innerhalb einer Bestellung.
export type AdminOrderItem = {
  name: string;
  quantity: number;
  price: number;
  options?: string[];
};

// Vollständige Bestellung für das Admin-Dashboard.
export type AdminOrder = {
  id: string;
  customer: string;
  phone: string;
  type: "pickup" | "delivery";
  address?: string;
  time: string;
  items: AdminOrderItem[];
  deliveryFee: number;
  total: number;
  status: OrderStatus;
};

// Fiktive Bestellungen für unsere Demo.
export const initialOrders: AdminOrder[] = [
  {
    id: "1042",
    customer: "Max Mustermann",
    phone: "0151 12345678",
    type: "delivery",
    address: "Musterstraße 12, 34621 Frielendorf",
    time: "18:45",
    items: [
      {
        name: "Döner Box groß",
        quantity: 2,
        price: 6.5,
        options: ["Knoblauchsoße", "Ohne Zwiebeln"],
      },
      {
        name: "Pizza Margherita mittel",
        quantity: 1,
        price: 6.5,
      },
    ],
    deliveryFee: 2.5,
    total: 22,
    status: "new",
  },
  {
    id: "1043",
    customer: "Lisa Müller",
    phone: "0151 98765432",
    type: "pickup",
    time: "18:55",
    items: [
      {
        name: "Dürüm",
        quantity: 2,
        price: 5.5,
      },
      {
        name: "Döner Box klein",
        quantity: 1,
        price: 5.5,
      },
    ],
    deliveryFee: 0,
    total: 16.5,
    status: "new",
  },
  {
    id: "1044",
    customer: "Tom Weber",
    phone: "0151 55512345",
    type: "delivery",
    address: "Beispielweg 8, 34621 Frielendorf",
    time: "19:05",
    items: [
      {
        name: "Pizza Döner mittel",
        quantity: 2,
        price: 9,
      },
      {
        name: "Döner Box groß",
        quantity: 2,
        price: 6.5,
      },
    ],
    deliveryFee: 2.5,
    total: 33.5,
    status: "preparing",
  },
];

