"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export type MarqueeItem = {
  slug: string;
  name: string;
  img: string;
  editions: string;
  href: string;
};

const SPEED = 32; // px/วินาที
const RESUME_DELAY = 2500; // ms หลังปล่อยนิ้วค่อยเลื่อนต่อ

/* แถวเลื่อนวนอัตโนมัติที่ยังเป็น scroll จริง — ปัด/ลากเองได้ แตะหรือชี้เมาส์แล้วหยุดทันที */
export default function MasterMarquee({ items }: { items: MarqueeItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const pos = useRef(0);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      const half = el.scrollWidth / 2;
      if (!paused.current && half > el.clientWidth) {
        pos.current += (SPEED * dt) / 1000;
        if (pos.current >= half) pos.current -= half;
        el.scrollLeft = pos.current;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const pause = () => {
      clearTimeout(resumeTimer.current);
      paused.current = true;
    };
    const resumeSoon = (delay: number) => {
      clearTimeout(resumeTimer.current);
      resumeTimer.current = setTimeout(() => {
        paused.current = false;
      }, delay);
    };
    const onScroll = () => {
      // ผู้ใช้เลื่อนเอง → จำตำแหน่งไว้ + วนรอยต่อให้ระหว่างเลื่อนมือ
      if (paused.current) {
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
        pos.current = el.scrollLeft;
      }
    };

    const onMouseEnter = () => pause();
    const onMouseLeave = () => resumeSoon(400);
    const onTouchStart = () => pause();
    const onTouchEnd = () => resumeSoon(RESUME_DELAY);

    el.addEventListener("mouseenter", onMouseEnter);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resumeTimer.current);
      el.removeEventListener("mouseenter", onMouseEnter);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={ref} className="marquee mt-6 pb-3">
      <div className="marquee-track">
        {[false, true].map((clone) => (
          <div key={clone ? "clone" : "main"} aria-hidden={clone || undefined} className="marquee-group">
            {items.map((m) => (
              <Link
                key={m.slug}
                href={m.href}
                tabIndex={clone ? -1 : undefined}
                className="group relative aspect-[3/4] w-[13rem] shrink-0 overflow-hidden rounded-2xl border border-gold/20 bg-night-soft transition hover:-translate-y-1 hover:border-gold/60"
              >
                <Image
                  src={m.img}
                  alt={m.name}
                  fill
                  sizes="208px"
                  className="object-cover object-top transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/95 via-night/60 to-transparent px-4 pb-3 pt-10">
                  <p className="font-heading text-sm font-semibold leading-snug text-ivory">{m.name}</p>
                  <p className="mt-0.5 text-xs text-gold-light">{m.editions}</p>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
