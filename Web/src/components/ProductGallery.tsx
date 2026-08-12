"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { getDict, type Lang } from "@/lib/i18n";
import { isVideoUrl } from "@/lib/media";

/** แกลเลอรีหน้าสินค้า: กด thumbnail สลับรูปใหญ่, กดรูปใหญ่เปิด lightbox ขยายเต็มจอ,
 *  รองรับวิดีโอปนกับรูปใน array เดียวกัน (ดูจากนามสกุลไฟล์) */
export default function ProductGallery({
  items,
  title,
  lang,
}: {
  items: string[];
  title: string;
  lang: Lang;
}) {
  const t = getDict(lang);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const current = items[Math.min(active, items.length - 1)];
  const currentIsVideo = isVideoUrl(current ?? "");

  const step = useCallback(
    (dir: -1 | 1) => {
      setActive((i) => (i + dir + items.length) % items.length);
      setZoomed(false);
    },
    [items.length]
  );

  // lightbox: ปิดด้วย Esc, เลื่อนด้วยลูกศร, ล็อก scroll ของหน้าไว้ข้างหลัง
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, step]);

  if (items.length === 0) return null;

  const navBtnCls =
    "absolute top-1/2 -translate-y-1/2 rounded-full bg-night/60 p-2.5 text-gold-light ring-1 ring-gold/30 transition hover:bg-night/90";

  return (
    <div>
      {/* รูปใหญ่ */}
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-b from-night-soft to-night shadow-lg shadow-black/30">
        {currentIsVideo ? (
          <video
            key={current}
            src={current}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
            aria-label={t.product.videoAlt(title, active + 1)}
          />
        ) : (
          <button
            type="button"
            aria-label={t.product.zoomAria}
            onClick={() => setLightbox(true)}
            className="group/zoom block h-full w-full cursor-zoom-in"
          >
            <Image
              src={current}
              alt={t.product.imageAlt(title, active + 1)}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1152px) 50vw, 576px"
              className="object-contain"
              priority={active === 0}
            />
            {/* ไอคอนแว่นขยาย บอกว่ากดขยายได้ */}
            <span className="absolute bottom-3 right-3 rounded-full bg-night/70 p-2 text-gold-light ring-1 ring-gold/30 opacity-70 transition group-hover/zoom:opacity-100">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" strokeLinecap="round" />
              </svg>
            </span>
          </button>
        )}
      </div>

      {/* thumbnails — กดสลับรูปใหญ่ */}
      {items.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {items.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              aria-label={t.product.goToMedia(i + 1)}
              aria-current={i === active}
              onClick={() => {
                setActive(i);
                setZoomed(false);
              }}
              className={`relative aspect-square overflow-hidden rounded-lg border bg-night-soft transition ${
                i === active
                  ? "border-gold ring-1 ring-gold"
                  : "border-gold/20 hover:border-gold/60"
              }`}
            >
              {isVideoUrl(url) ? (
                <>
                  {/* #t=0.001 บังคับให้เบราว์เซอร์ดึงเฟรมแรกมาแสดงเป็นภาพนิ่ง */}
                  <video
                    src={`${url}#t=0.001`}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-contain"
                    aria-hidden
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="rounded-full bg-night/70 p-1.5 text-gold-light ring-1 ring-gold/40">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                        <path d="M8 5.5v13l11-6.5-11-6.5z" />
                      </svg>
                    </span>
                  </span>
                </>
              ) : (
                // object-contain กันองค์พระ/กุมารโดนครอปหัวท้าย เหมือนเหตุผลใน ProductCard
                <Image
                  src={url}
                  alt={t.product.imageAlt(title, i + 1)}
                  fill
                  sizes="120px"
                  className="object-contain"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* lightbox ขยายเต็มจอ — เปิดจากรูปนิ่ง แต่กดลูกศรต่อไปเจอวิดีโอก็เล่นในนี้ได้เลย */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.product.zoomAria}
          className="fixed inset-0 z-50 bg-night/95 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <div
            className={`h-full w-full ${zoomed ? "overflow-auto" : "flex items-center justify-center overflow-hidden"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {currentIsVideo ? (
              <video
                key={current}
                src={current}
                controls
                playsInline
                preload="metadata"
                className="max-h-full max-w-full"
                aria-label={t.product.videoAlt(title, active + 1)}
              />
            ) : (
              /* กดรูปเพื่อสลับซูมเข้า/ออก */
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={current}
                alt={t.product.imageAlt(title, active + 1)}
                onClick={() => setZoomed((z) => !z)}
                className={
                  zoomed
                    ? "w-[180%] max-w-none cursor-zoom-out sm:w-[130%]"
                    : "max-h-full max-w-full cursor-zoom-in object-contain"
                }
              />
            )}
          </div>

          <button
            type="button"
            aria-label={t.product.closeZoom}
            onClick={() => setLightbox(false)}
            className="absolute right-3 top-3 rounded-full bg-night/70 p-2.5 text-ivory ring-1 ring-gold/30 transition hover:bg-night"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>

          {items.length > 1 && (
            <>
              <button
                type="button"
                aria-label={t.product.prevMedia}
                onClick={() => step(-1)}
                className={`${navBtnCls} left-2`}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                aria-label={t.product.nextMedia}
                onClick={() => step(1)}
                className={`${navBtnCls} right-2`}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-night/70 px-3 py-1 text-xs text-ivory ring-1 ring-gold/30">
                {active + 1} / {items.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
