"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await createSupabaseBrowser().auth.signOut();
        router.replace("/admin/login");
        router.refresh();
      }}
      className="rounded-lg border border-gold/30 px-3 py-1.5 text-sm text-smoke transition hover:border-gold hover:text-gold-light"
    >
      ออกจากระบบ
    </button>
  );
}
