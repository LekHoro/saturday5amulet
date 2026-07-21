"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

const units: { key: "d" | "h" | "m" | "s"; label: string }[] = [
  { key: "d", label: "วัน" },
  { key: "h", label: "ชั่วโมง" },
  { key: "m", label: "นาที" },
  { key: "s", label: "วินาที" },
];

export default function CeremonyCountdown({
  label,
  date,
}: {
  label: string;
  date: string;
}) {
  const target = new Date(`${date}T00:00:00+07:00`).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // deferred (not synchronous in the effect body) to satisfy react-hooks/set-state-in-effect —
    // needed to gate SSR/CSR: server always renders null, client fills in the real time after mount
    const initial = setTimeout(() => setNow(Date.now()), 0);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(t);
    };
  }, []);

  // พ้นวันงานไปแล้ว → ไม่แสดง (วันงานเองยังแสดง "วันนี้")
  // ก่อน hydrate ยังไม่รู้เวลา client — แสดงโครงพร้อม "--" กันหน้ากระตุก (CLS)
  const dayEnd = target + 86_400_000;
  if (now !== null && dayEnd <= now) return null;

  const isToday = now !== null && target <= now;
  const p = now === null ? null : parts(target - now);
  const dateLabel = new Date(target).toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  });

  return (
    <section className="bg-night px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gold/30 bg-gradient-to-b from-night-soft to-night p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-gold/80">
          {isToday ? "วันมงคล" : "นับถอยหลังวันมงคล"}
        </p>
        <h2 className="font-heading mt-2 text-2xl font-bold text-gold-light sm:text-3xl">{label}</h2>
        <p className="mt-1 text-sm text-smoke">{dateLabel}</p>
        {isToday ? (
          <p className="font-heading mt-6 text-3xl font-bold text-gold sm:text-4xl">
            ✨ วันนี้เป็นวันพิธี ✨
          </p>
        ) : (
          <div className="mt-6 flex justify-center gap-3 sm:gap-5">
            {units.map((u) => (
              <div
                key={u.key}
                className="min-w-16 rounded-xl border border-gold/20 bg-night px-3 py-3 sm:min-w-20"
              >
                <div className="font-heading text-3xl font-bold tabular-nums text-gold sm:text-4xl">
                  {p ? String(p[u.key]).padStart(2, "0") : "--"}
                </div>
                <div className="mt-1 text-xs text-smoke">{u.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
