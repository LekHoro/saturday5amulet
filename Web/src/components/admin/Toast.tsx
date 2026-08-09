"use client";

import { useEffect, useRef, useState } from "react";

// toast ยืนยันผลงานสั้น ๆ — ลอยเหนือเมนูล่างของหลังร้าน หายเองใน 4 วินาที
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function show(m: string) {
    clearTimeout(timer.current);
    setMsg(m);
    timer.current = setTimeout(() => setMsg(null), 4000);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const node = msg ? (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4">
      <div
        role="status"
        className="rounded-full border border-gold/40 bg-gold px-5 py-2.5 text-sm font-bold text-night shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
      >
        {msg}
      </div>
    </div>
  ) : null;

  return { show, node };
}
