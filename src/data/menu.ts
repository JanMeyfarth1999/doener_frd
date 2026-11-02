
// Beschreibt, welche Eigenschaften ein Gericht besitzt.
export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
};

// Unsere ersten Gerichte aus der Speisekarte.
export const menuItems: MenuItem[] = [
  {
    id: 84,
    name: "Döner Box",
    description: "Dönerfleisch mit Pommes und Sauce",
    price: 5.5,
    category: "Döner",
  },
  {
    id: 85,
    name: "Döner Kids",
    description: "Dönerfleisch mit Pommes und Sauce",
    price: 5.0,
    category: "Döner",
  },
  {
    id: 91,
    name: "Dürüm",
    description: "Mit Salat und Sauce",
    price: 5.5,
    category: "Dürüm",
  },
];
