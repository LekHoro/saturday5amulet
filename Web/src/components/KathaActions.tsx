"use client";

import { useState } from "react";
import { getDict, type Lang } from "@/lib/i18n";

/**
 * ปุ่มคัดลอก/แชร์ของหน้าคาถา — แยกเป็น client component ก้อนเล็ก ๆ
 * เพื่อให้ตัวบทและคลังคาถายัง render ฝั่งเซิร์ฟเวอร์ทั้งหมด (ดีต่อ SEO และเปิดไว)
 */
export default function KathaActions({
  lang,
  name,
  /** ข้อความเต็มที่จะคัดลอก — ประกอบมาจากฝั่งเซิร์ฟเวอร์แล้ว */
  copyText,
}: {
  lang: Lang;
  name: string;
  copyText: string;
}) {
  const t = getDict(lang);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  // เบราว์เซอร์ปฏิเสธ writeText ได้หลายกรณี (แท็บไม่ได้โฟกัส, Safari บางรุ่น)
  // ถ้าเขียนไม่สำเร็จก็ไม่ต้องขึ้นว่า "คัดลอกแล้ว" หลอกผู้ใช้ และต้องไม่ทิ้ง error ค้างไว้
  async function writeClipboard(value: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return false;
    }
  }

  async function copy() {
    if (!(await writeClipboard(copyText))) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text: t.katha.shareText(name), url });
      } catch {
        // ผู้ใช้ปิดแผงแชร์เอง — ไม่ต้องทำอะไรต่อ
      }
      return;
    }
    if (!(await writeClipboard(url))) return;
    setShared(true);
    window.setTimeout(() => setShared(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="rounded-full border border-gold-deep/40 px-5 py-2.5 text-sm text-ink transition hover:border-gold-deep hover:bg-gold-deep/10"
      >
        {copied ? t.katha.copied : t.katha.copy}
      </button>
      <button
        type="button"
        onClick={share}
        className="rounded-full border border-gold-deep/40 px-5 py-2.5 text-sm text-ink transition hover:border-gold-deep hover:bg-gold-deep/10"
      >
        {shared ? t.katha.shareCopied : t.katha.share}
      </button>
    </>
  );
}
