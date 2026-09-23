"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import type { DisplaySlide } from "@/types";

export function PresentationSlide({ title, number, slide, chord, dark, blank, blackout = false, index = 0, total = 1, baitCount = total, preview = false, scale = 1 }: { title: string; number: number; slide?: DisplaySlide; chord: boolean; dark: boolean; blank: boolean; blackout?: boolean; index?: number; total?: number; baitCount?: number; preview?: boolean; scale?: number }) {
  const area = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLParagraphElement>(null);
  const [size, setSize] = useState(32);
  useLayoutEffect(() => {
    const container = area.current;
    const paragraph = text.current;
    if (!container || !paragraph) return;
    let disposed = false;
    const fit = () => {
      if (disposed) return;
      let low = 8;
      let high = Math.min(preview ? 42 : 80, container.clientWidth / 12);
      while (high - low > 0.5) {
        const middle = (low + high) / 2;
        paragraph.style.fontSize = `${middle}px`;
        if (paragraph.scrollHeight <= container.clientHeight && paragraph.scrollWidth <= container.clientWidth) low = middle;
        else high = middle;
      }
      paragraph.style.fontSize = `${low * scale}px`;
      setSize(low);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    document.fonts.ready.then(fit);
    return () => { disposed = true; observer.disconnect(); };
  }, [slide?.text, chord, preview, scale]);

  return (
    <section className={`relative h-full w-full overflow-hidden ${blackout ? "bg-black text-black" : dark ? "bg-[#0c1322] text-[#f6f8ff]" : "bg-white text-[#17364a]"}`} aria-label="Tayangan slide">
      <header className={`absolute inset-x-[4.5%] top-6 z-3 right-[calc(13%+28px)] h-10.5 ${blank || blackout ? "invisible" : ""}`}>
        <strong className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-heading text-[clamp(13px,1.5vw,18px)] font-extrabold uppercase leading-snug underline decoration-brand decoration-2 underline-offset-4">{number > 0 ? `${number} ` : ""}{title}</strong>
      </header>
      <span className={`absolute left-[4.5%] top-19.5 z-3 ${preview ? "text-[clamp(16px,2vw,28px)]" : "text-[clamp(28px,3.5vw,52px)]"} font-semibold leading-none max-mobile:left-[7%] max-mobile:top-17.5 ${blank || blackout ? "invisible" : ""}`}>
        {slide?.reff ? "Reff" : slide ? `${slide.bait}/${Math.max(1, baitCount)}` : ""}
      </span>
      <div ref={area} className={`absolute bottom-23 left-[4.5%] right-[calc(13%+5%)] top-39 flex items-start justify-start overflow-hidden text-left max-mobile:inset-x-[7%] max-mobile:bottom-23.5 max-mobile:top-30.5 ${blank || blackout ? "invisible" : ""}`}>
        <p ref={text} style={{ fontSize: size * scale }} className={`m-0 max-w-full origin-top-left wrap-break-word leading-[1.48] max-mobile:leading-[1.35] ${chord ? "whitespace-pre font-mono" : "whitespace-pre-wrap font-heading font-semibold"}`}>{slide?.text || ""}</p>
      </div>
      <aside className={`absolute inset-y-0 right-0 z-2 w-[13%] overflow-hidden bg-[#25334d] bg-[url('/hymnal-hero.png')] bg-cover bg-position-[72%_center] max-mobile:hidden ${blackout ? "hidden" : ""}`} aria-hidden="true">
        <span className={`absolute inset-0 ${dark ? "bg-[#182641]/70" : "bg-brand/55"}`} />
        <Image className="absolute bottom-[4%] right-[14%] h-auto w-[72%] object-contain brightness-0 invert" src="/advent-logo.png" width={2000} height={1799} alt="" />
      </aside>
      <span className={`absolute bottom-0 left-0 right-[13%] z-3 h-1 bg-brand transition-[width] ${blank || blackout ? "invisible" : ""}`} style={{ width: `${Math.min(100, ((index + 1) / Math.max(1, total)) * 87)}%` }} aria-hidden="true" />
    </section>
  );
}
