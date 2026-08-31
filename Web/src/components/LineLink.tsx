"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { LINE_ID } from "@/lib/line";
import { getDict, type Lang } from "@/lib/i18n";

/**
 * ลิงก์ไป Line ที่ใช้ได้ทั้งสองโลก — จอสัมผัสเปิดแอปตรงตามปกติ
 * แต่บนคอมพิวเตอร์ลิงก์ line.me จะตกไปหน้าโปรโมทเปล่า ๆ เลยดัก click
 * แล้วโชว์ QR ของลิงก์เดิมให้สแกนด้วยมือถือแทน (ข้อความที่แนบยังครบ)
 */
export default function LineLink({
  href,
  lang,
  className,
  ariaLabel,
  children,
}: {
  href: string;
  lang: Lang;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const t = getDict(lang);
  const [qrSvg, setQrSvg] = useState<string | null>(null);

  async function onClick(e: MouseEvent<HTMLAnchorElement>) {
    // key event ใน GA — นับ "ตั้งใจทักไลน์" ทั้งสองทาง (เปิดแอปบนมือถือ / เปิด QR บนคอม)
    sendGAEvent("event", "line_click", { page_path: window.location.pathname });
    // จอสัมผัส (มือถือ/แท็บเล็ต) มีแอป Line — ปล่อยลิงก์ทำงานเอง
    if (window.matchMedia("(pointer: coarse)").matches) return;
    e.preventDefault();
    const QRCode = (await import("qrcode")).default;
    // พื้นขาว/โมดูลเข้มให้กล้องอ่านง่าย เหมือน QR ใน LineQrBlock
    const svg = await QRCode.toString(href, {
      type: "svg",
      margin: 0,
      color: { dark: "#101014", light: "#ffffff" },
    });
    setQrSvg(svg);
  }

  useEffect(() => {
    if (qrSvg === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setQrSvg(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [qrSvg]);

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {children}
      </a>
      {qrSvg !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.line.scanTitle}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setQrSvg(null)}
        >
          <div
            className="w-full max-w-xs rounded-2xl border border-gold/30 bg-night-soft p-6 text-center shadow-xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-heading text-lg font-bold text-ivory">{t.line.scanTitle}</h3>
            <div className="mx-auto mt-4 w-fit rounded-xl bg-white p-3">
              <div className="h-44 w-44" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            </div>
            <p className="mt-3 font-heading text-xl font-bold text-gold">{LINE_ID}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-smoke">{t.line.scanHint}</p>
            <button
              type="button"
              onClick={() => setQrSvg(null)}
              className="mt-4 rounded-full border border-gold/40 px-6 py-2 text-sm text-ivory transition hover:border-gold hover:text-gold-light"
            >
              {t.line.scanClose}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
