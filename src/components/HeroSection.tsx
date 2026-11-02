"use client";
import Image from "next/image";

export default function HeroSection() {
  function scrollToMenu() {
    document.getElementById("speisekarte")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="relative isolate overflow-hidden bg-[#101411]">
      {/* Dezenter grüner Lichtschein */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-12 h-80 w-80 rounded-full bg-[#9ACD87]/10 blur-[100px]"
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-12 md:py-24">
        {/* Kleine Markenüberschrift */}
        <div className="flex items-center gap-3">
          <span className="h-[2px] w-8 bg-[#9ACD87]" />

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9ACD87]">
            Frielendorfer Original
          </p>
        </div>

        {/* Hauptüberschrift */}
        <h1 className="mt-7 max-w-3xl text-[clamp(3.1rem,11vw,6.5rem)] font-black leading-[0.95] tracking-[-0.06em]">
          FRESH.
          <br />
          HOT.
          <br />
          <span className="text-[#9ACD87]">LEGENDARY.</span>
        </h1>

        {/* Beschreibung */}
        <p className="mt-7 max-w-sm text-sm leading-7 text-white/60 md:text-base">
          Frischer Döner, knusprige Pizza und echter Geschmack. Direkt aus
          Frielendorf – zu dir nach Hause oder zur Abholung.
        </p>

        {/* Bestellbutton */}
        <button
          type="button"
          onClick={scrollToMenu}
          className="mt-8 flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#9ACD87] px-8 font-bold text-[#101411] transition hover:bg-[#B5E3A4] active:scale-95"
        >
          Jetzt bestellen
          <span aria-hidden="true">↗</span>
        </button>

        {/* Platzhalter für unser Food-Hero-Bild */}

        {/* Cinematic Food Hero */}
        <div className="relative mt-10 aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-[#1D2920] sm:aspect-[5/4] md:aspect-[16/9]">
          {/* Großes Dönerbild */}
          <Image
            src="/images/hero-doener.png"
            alt="Frisch zubereiteter Döner"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1100px"
            className="object-cover object-center"
          />

          {/* Dunkler Verlauf für cineastische Wirkung */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#101411] via-[#101411]/15 to-transparent" />

          {/* Dezenter grüner Lichtschein */}
          <div className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-[#9ACD87]/20 blur-[90px]" />

          {/* Text auf dem Bild */}
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9ACD87]">
              Made Fresh.
            </p>

            <h3 className="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">
              EVERY BITE
              <span className="block">MATTERS.</span>
            </h3>

            <div className="mt-5 h-1 w-12 rounded-full bg-[#9ACD87]" />
          </div>
        </div>

        {/* Qualitätsmerkmale */}
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-white/50">
          <span>✦ Frisch zubereitet</span>
          <span>✦ Italienische & türkische Küche</span>
          <span>✦ Abholung & Lieferung</span>
        </div>
      </div>
    </section>
  );
}
