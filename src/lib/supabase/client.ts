"use client";
import { createBrowserClient } from "@supabase/ssr";

/** Supabase client ฝั่ง browser — ใช้ล็อกอิน/อัปโหลดรูปในหน้า admin */
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
