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
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // ยังไม่ hydrate หรือเลยวันไปแล้ว → ไม่แสดง
  if (now === null || target <= now) return null;

  const p = parts(target - now);
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
        <p className="text-sm font-semibold uppercase tracking-widest text-gold/80">นับถอยหลังวันมงคล</p>
        <h2 className="font-heading mt-2 text-2xl font-bold text-gold-light sm:text-3xl">{label}</h2>
        <p className="mt-1 text-sm text-smoke">{dateLabel}</p>
        <div className="mt-6 flex justify-center gap-3 sm:gap-5">
          {units.map((u) => (
            <div
              key={u.key}
              className="min-w-16 rounded-xl border border-gold/20 bg-night px-3 py-3 sm:min-w-20"
            >
              <div className="font-heading text-3xl font-bold tabular-nums text-gold sm:text-4xl">
                {String(p[u.key]).padStart(2, "0")}
              </div>
              <div className="mt-1 text-xs text-smoke">{u.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
