import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// บอต SEO ที่ดูดรูปสินค้าหนัก ๆ (หลายสิบ MB/วัน) แต่ไม่พาคนเข้าเว็บเลย
// Googlebot/bingbot ไม่บล็อก — มีผลกับอันดับค้นหาและรูปสินค้าใน Google Images
const BLOCKED_BOTS = ["AhrefsBot", "SemrushBot", "MJ12bot", "DotBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...BLOCKED_BOTS.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
