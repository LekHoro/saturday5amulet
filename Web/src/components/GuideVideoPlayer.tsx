"use client";

import { useRef, useState } from "react";
import Image from "next/image";

type Chapter = { start: number; label: string; time: string };

// วิดีโอแนวตั้ง 9:16 (คนละเคสกับ aspect-video ของหน้าอาจารย์) — ไม่โหลด iframe จนกว่าจะกด
// เพื่อไม่ให้สคริปต์ยูทูปถ่วงหน้าตอนเปิดครั้งแรก และใช้ youtube-nocookie ตอนเล่นจริง
export default function GuideVideoPlayer({
  videoId,
  poster,
  posterAlt,
  playLabel,
  chaptersHeading,
  chaptersHint,
  chapters,
}: {
  videoId: string;
  poster: string;
  posterAlt: string;
  playLabel: string;
  chaptersHeading: string;
  chaptersHint: string;
  chapters: Chapter[];
}) {
  // null = ยังไม่กดเล่น · ตัวเลข = วินาทีเริ่มของช่วงที่เลือกล่าสุด
  const [startAt, setStartAt] = useState<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const jumpTo = (s: number) => {
    setStartAt(s);
    // มือถือ: สารบัญอยู่ใต้วิดีโอ กดแล้วเลื่อนกลับขึ้นไปให้เห็นจอ
    frameRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-8">
      <div ref={frameRef} className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-2xl border border-gold/30 bg-night shadow-lg shadow-black/40">
          {startAt === null ? (
            <button
              type="button"
              onClick={() => jumpTo(0)}
              className="group absolute inset-0 block h-full w-full text-left"
              aria-label={playLabel}
            >
              <Image
                src={poster}
                alt={posterAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 360px"
                priority
                className="object-cover"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-night/30 transition group-hover:from-night/50" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/60 bg-night/75 text-gold-light shadow-lg backdrop-blur-sm transition group-hover:scale-110 group-hover:bg-crimson/90 group-hover:text-ivory">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7" aria-hidden>
                    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                  </svg>
                </span>
              </span>
              <span className="absolute inset-x-0 bottom-0 p-4 text-center text-xs font-semibold text-ivory/90">
                {playLabel}
              </span>
            </button>
          ) : (
            <iframe
              // เปลี่ยน key เพื่อรีโหลด iframe ตอนกดข้ามบท — ยอมให้เริ่มเล่นใหม่ ณ จุดนั้น
              key={startAt}
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0${startAt > 0 ? `&start=${startAt}` : ""}`}
              aria-label={posterAlt}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>

      <section aria-label={chaptersHeading}>
        <h2 className="font-heading text-lg font-bold text-gold sm:text-xl">{chaptersHeading}</h2>
        <p className="mt-1 text-sm text-smoke">{chaptersHint}</p>
        <ol className="mt-4 divide-y divide-gold/10 overflow-hidden rounded-2xl border border-gold/20 bg-night-soft/50">
          {chapters.map((c, i) => {
            const active = startAt === c.start;
            return (
              <li key={c.start}>
                <button
                  type="button"
                  onClick={() => jumpTo(c.start)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-baseline gap-3 px-4 py-3 text-left transition ${
                    active ? "bg-gold/10" : "hover:bg-gold/5"
                  }`}
                >
                  <span className="w-6 shrink-0 text-right font-heading text-sm font-bold tabular-nums text-gold/45">
                    {i + 1}
                  </span>
                  <span
                    className={`min-w-0 flex-1 text-sm font-semibold leading-snug ${
                      active ? "text-gold-light" : "text-ivory/90"
                    }`}
                  >
                    {c.label}
                  </span>
                  <span className="shrink-0 rounded-full border border-gold/25 px-2 py-0.5 text-[11px] tabular-nums text-gold-light/80">
                    {c.time}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
