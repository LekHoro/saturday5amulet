import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // โควต้า image optimization ของ Vercel (Hobby) เต็ม — /_next/image ตอบ 402 ทั้งเว็บ
    // รูปที่ไม่ทัน cache เลยขึ้นกากบาท จึงเสิร์ฟรูปต้นฉบับตรง ๆ แทน
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "cache-igetweb-v2.mt108.info" },
      { protocol: "https", hostname: "cdn.igetweb.com" },
      { protocol: "https", hostname: "www.saturday5amulet.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
