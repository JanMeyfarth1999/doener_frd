"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

export default function HeroSection() {
  const reduceMotion = useReducedMotion();

  // Springt direkt zur Speisekarte.
  function scrollToMenu() {
    document.getElementById("speisekarte")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <section className="relative isolate overflow-hidden bg-[#0C100D] text-[#F5F2E9]">
      {/* Dezenter Lichtschein im Hintergrund */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-[#B5F28B]/10 blur-[110px]"
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-10 md:pb-20 md:pt-20">
        {/* Kleine Einleitung */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <span className="h-[2px] w-7 bg-[#B5F28B]" />

          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#B5F28B]">
            Frielendorf · Fresh Streetfood
          </span>
        </motion.div>

        {/* Große Hauptüberschrift */}
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1 }}
          className="mt-7 text-[clamp(2.9rem,11vw,7rem)] font-black leading-[0.9] tracking-[-0.06em] sm:tracking-[-0.075em]"
        >
          GOOD
          <br />
          FOOD.
          <br />
          <span className="text-[#B5F28B]">ZERO</span>
          <br />
          <span className="block break-words">COMPROMISE.</span>
        </motion.h1>

        {/* Beschreibung */}
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-7 max-w-md text-sm leading-7 text-white/60"
        >
          Saftiger Döner. Knusprige Pizza. Frisch zubereitet in Frielendorf.
          Dein Lieblingsessen – einfach online bestellen.
        </motion.p>

        {/* Hero-Fotografie */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.2 }}
          className="relative mt-9 aspect-[4/4.5] overflow-hidden rounded-[2rem] border border-white/10 bg-[#1D2920] sm:aspect-[5/4] md:aspect-[16/9]"
        >
          <Image
            src="/images/hero-doener.png"
            alt="Frisch zubereiteter Döner"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1100px"
            className="object-cover object-center"
          />

          {/* Cinematic Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C100D] via-transparent to-black/20" />

          {/* Bildbeschriftung */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 md:p-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B5F28B]">
                Made Fresh
              </p>

              <h2 className="mt-2 text-3xl font-black leading-none tracking-tight md:text-5xl">
                REAL
                <br />
                TASTE.
              </h2>
            </div>

            <div className="rounded-full border border-white/20 bg-black/40 px-3 py-2 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
              FRESH DAILY
            </div>
          </div>
        </motion.div>

        {/* Hauptaktion */}
        <motion.button
          type="button"
          onClick={scrollToMenu}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          initial={reduceMotion ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-5 flex min-h-16 w-full items-center justify-between rounded-2xl bg-[#B5F28B] px-6 text-base font-black text-[#0C100D] shadow-[0_12px_40px_rgba(181,242,139,0.12)] transition-colors hover:bg-[#C8FFA5] md:max-w-sm"
        >
          <span>JETZT BESTELLEN</span>

          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0C100D] text-xl text-[#B5F28B]">
            ↗
          </span>
        </motion.button>

        {/* Vorteile */}
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-[11px] font-semibold text-white/50">
          <span>✦ Frisch zubereitet</span>
          <span>✦ Abholung & Lieferung</span>
          <span>✦ Direkt beim Restaurant</span>
        </div>
      </div>
    </section>
  );
}
