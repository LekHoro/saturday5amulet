"use client";

import { useEffect, useState } from "react";

export interface Draft<T> {
  savedAt: number;
  data: T;
}

// เกราะกันงานหายของฟอร์มหลังร้าน:
// - เก็บสิ่งที่พิมพ์ลง localStorage อัตโนมัติ (หน่วง 600ms) ระหว่างที่ยังไม่ได้กดบันทึก
// - เปิดฟอร์มแล้วเจอร่างค้าง → คืน `pending` ให้ฟอร์มแสดงปุ่มกู้คืน
// - เตือนก่อนปิด/รีเฟรชแท็บถ้ามีงานยังไม่บันทึก
export function useDraft<T>(key: string, snapshot: T) {
  const storageKey = `admin-draft:${key}`;
  const json = JSON.stringify(snapshot);
  // สภาพล่าสุดที่ถือว่า "บันทึกแล้ว" — ต่างจากนี้เมื่อไหร่คือมีงานค้าง
  const [baseline, setBaseline] = useState(json);
  const dirty = json !== baseline;
  const [pending, setPending] = useState<Draft<T> | null>(null);

  // อ่านร่างค้างครั้งเดียวตอนเปิดฟอร์ม (หน่วงหนึ่งจังหวะ เลี่ยง setState กลางคัน hydration)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Draft<T>;
        if (JSON.stringify(parsed.data) !== baseline) setPending(parsed);
        else localStorage.removeItem(storageKey); // ร่างเหมือนข้อมูลจริงแล้ว — ไม่ต้องถาม
      } catch {
        // ร่างเสียหาย — ข้ามไปเฉย ๆ
      }
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // เก็บร่างอัตโนมัติเมื่อผู้ใช้แก้อะไรก็ตาม
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ savedAt: Date.now(), data: snapshot }));
      } catch {
        // localStorage เต็ม/ปิดอยู่ — เกราะหาย แต่ฟอร์มต้องใช้ต่อได้
      }
      setPending(null); // พิมพ์ต่อเองแล้ว = ร่างใหม่ทับร่างเก่า ไม่ต้องถามเรื่องกู้คืนอีก
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [json, dirty, storageKey]);

  // เตือนก่อนปิดแท็บ/รีเฟรชถ้ายังไม่ได้บันทึก
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /** เรียกหลังบันทึกสำเร็จ (หรือรีเซ็ตฟอร์ม) — ส่ง snapshot ใหม่ถ้าสถานะกำลังจะเปลี่ยนพร้อมกัน */
  function markSaved(next?: T) {
    setBaseline(next !== undefined ? JSON.stringify(next) : json);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    setPending(null);
  }

  /** ทิ้งร่างค้างถาวร */
  function dismissDraft() {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    setPending(null);
  }

  /** ปิดแบนเนอร์หลังกู้คืนแล้ว (ร่างยังอยู่ใน storage จนกว่าจะบันทึก) */
  function clearPending() {
    setPending(null);
  }

  return { dirty, pending, markSaved, dismissDraft, clearPending };
}

/** เวลาแบบไทยสั้น ๆ สำหรับแบนเนอร์ร่าง เช่น "9 ส.ค. 16:02" */
export function draftTime(savedAt: number): string {
  return new Date(savedAt).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
