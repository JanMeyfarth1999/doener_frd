import { CartProvider } from "@/context/CartContext";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { OrderProvider } from "@/context/OrderContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Informationen für Browser und Suchmaschinen.
export const metadata: Metadata = {
  title: "Frielendorfer Pizza & Dönerhaus",
  description:
    "Pizza, Döner und türkische Spezialitäten in Frielendorf. Online bestellen zur Abholung oder Lieferung.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Gemeinsamer Warenkorb für die gesamte Website */}

        <OrderProvider>
          <CartProvider>{children}</CartProvider>
        </OrderProvider>
      </body>
    </html>
  );
}
