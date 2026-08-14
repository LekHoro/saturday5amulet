"use client";

import { useEffect } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** รออ่านจริงสักพักก่อนค่อยนับ — คนกดผิดแล้วเด้งออกทันทีไม่ควรถูกนับ */
const DELAY_MS = 5000;

/**
 * นับยอดอ่านบทความ — ยิง +1 เข้า Supabase (ฟังก์ชัน bump_article_views)
 * ต่อยอดจากตัวเลขเดิมที่ย้ายมาจาก igetweb ในคอลัมน์ views
 *
 * ตัวเลขที่โชว์บนหน้าเว็บมาจาก cache 5 นาที เลยไม่ขยับทันทีที่กดอ่าน — ตั้งใจให้เป็นแบบนั้น
 * (ไม่งั้นต้องยิง DB ทุกครั้งที่โหลดหน้า) นับครั้งเดียวต่อบทความต่อ session ของเบราว์เซอร์
 */
export default function ArticleViewPing({ id }: { id: string }) {
  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON) return;

    const key = `article-view:${id}`;
    // sessionStorage ใช้ไม่ได้ในโหมดส่วนตัวบางเบราว์เซอร์ — ถ้าพังก็ปล่อยให้นับไปตามปกติ
    const seen = () => {
      try {
        return sessionStorage.getItem(key) !== null;
      } catch {
        return false;
      }
    };
    if (seen()) return;

    const timer = window.setTimeout(() => {
      if (seen()) return; // กัน effect ซ้อนตอน dev (StrictMode)
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        /* ไม่มี sessionStorage ก็ยังยิงได้ แค่กันซ้ำไม่ได้ */
      }
      fetch(`${SUPABASE_URL}/rest/v1/rpc/bump_article_views`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ p_id: id }),
        keepalive: true,
      }).catch(() => {
        /* นับไม่ขึ้นไม่ใช่เรื่องคอขาดบาดตาย — ห้ามให้ error โผล่หน้าคนอ่าน */
      });
    }, DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [id]);

  return null;
}
