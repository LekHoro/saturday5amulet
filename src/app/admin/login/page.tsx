"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

const configured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError("เข้าสู่ระบบไม่สำเร็จ — ตรวจสอบอีเมลและรหัสผ่านอีกครั้ง");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-night px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gold/25 bg-night-soft p-6 shadow-lg">
        <h1 className="font-heading text-center text-xl font-bold text-gold">
          เสาร์๕มหานิยม — หลังร้าน
        </h1>
        {!configured ? (
          <p className="mt-4 text-center text-sm leading-relaxed text-smoke">
            ยังไม่ได้ตั้งค่า Supabase (ไม่มีไฟล์ .env.local)
            <br />
            ตั้งค่าก่อนจึงจะเข้าสู่ระบบได้
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-semibold text-ivory">อีเมล</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gold/30 bg-night px-4 py-3 text-ivory outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-ivory">รหัสผ่าน</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gold/30 bg-night px-4 py-3 text-ivory outline-none focus:border-gold"
              />
            </div>
            {error && <p className="text-sm text-ember">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-gold py-3 font-bold text-night transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
