"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type Banner = {
  src: string;
  alt: string;
  href: string;
  width: number;
  height: number;
};

const AUTOPLAY_MS = 5000;

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);

  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const n = ((i % track.children.length) + track.children.length) % track.children.length;
    const slide = track.children[n] as HTMLElement;
    track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
  }, []);

  // อัปเดตจุดตามตำแหน่งจริง (รองรับปัดด้วยนิ้ว)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      setActive(Math.min(i, banners.length - 1));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [banners.length]);

  // เลื่อนอัตโนมัติ — หยุดเมื่อ hover/แตะ และเมื่อผู้ใช้ตั้งค่าลดการเคลื่อนไหว
  useEffect(() => {
    if (banners.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!pausedRef.current) {
        const track = trackRef.current;
        if (!track) return;
        const i = Math.round(track.scrollLeft / track.clientWidth);
        goTo(i + 1);
      }
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [banners.length, goTo]);

  if (banners.length === 0) return null;

  return (
    <section
      aria-label="แบนเนอร์โปรโมชัน"
      className="group/carousel relative mx-auto max-w-6xl"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onTouchStart={() => (pausedRef.current = true)}
      onTouchEnd={() => (pausedRef.current = false)}
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {banners.map((b) => (
          <Link
            key={b.src}
            href={b.href}
            className="relative aspect-[2/1] w-full shrink-0 snap-start sm:aspect-[1140/400]"
          >
            <Image
              src={b.src}
              alt={b.alt}
              fill
              sizes="100vw"
              className="object-contain"
              priority={b.src === banners[0].src}
            />
          </Link>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            aria-label="แบนเนอร์ก่อนหน้า"
            onClick={() => goTo(active - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-night/60 p-2 text-gold-light opacity-0 ring-1 ring-gold/30 transition hover:bg-night/90 focus-visible:opacity-100 group-hover/carousel:opacity-100"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="แบนเนอร์ถัดไป"
            onClick={() => goTo(active + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-night/60 p-2 text-gold-light opacity-0 ring-1 ring-gold/30 transition hover:bg-night/90 focus-visible:opacity-100 group-hover/carousel:opacity-100"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((b, i) => (
              <button
                key={b.src}
                type="button"
                aria-label={`ไปแบนเนอร์ที่ ${i + 1}`}
                aria-current={i === active}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full ring-1 ring-night/40 transition-all ${
                  i === active ? "w-6 bg-gold" : "w-2 bg-ivory/50 hover:bg-ivory/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
