
"use client";

import { motion } from "motion/react";

export default function PremiumHeader() {
  function scrollToMenu() {
    document.getElementById("speisekarte")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <header
      id="startseite"
      className="sticky top-0 z-40 border-b border-white/10 bg-[#0C100D]/90 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">

        {/* Restaurant-Branding */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#B5F28B] text-2xl text-[#0C100D]">
            ✦
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black tracking-tight text-[#F5F2E9]">
              FRIELENDORFER.
            </p>

            <p className="text-[10px] font-medium tracking-[0.12em] text-white/50">
              PIZZA & DÖNERHAUS
            </p>
          </div>
        </div>

        {/* Direkt zur Speisekarte */}
        <motion.button
          type="button"
          onClick={scrollToMenu}
          whileTap={{ scale: 0.94 }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#B5F28B] text-xl font-bold text-[#0C100D] md:w-auto md:gap-2 md:px-5"
          aria-label="Jetzt bestellen"
        >
          ↗
          <span className="hidden text-sm md:inline">
            Jetzt bestellen
          </span>
        </motion.button>
      </div>
    </header>
  );
}
