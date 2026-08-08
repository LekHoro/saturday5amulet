import Link from "next/link";
import { FloatingLineButton } from "@/components/LineButton";
import HeaderSearch from "@/components/HeaderSearch";
import SiteNav, { MobileNav, type NavItem } from "@/components/SiteNav";
import { LINE_ID, lineChatUrl } from "@/lib/line";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { getData } from "@/lib/db";
import { categoryGroups, categoryCount } from "@/lib/data";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.jpg`,
  sameAs: [lineChatUrl()],
};

const navItems = [
  { href: "/", label: "หน้าแรก" },
  { href: "/products", label: "วัตถุมงคลและเครื่องราง" },
  { href: "/masters", label: "ครูบาอาจารย์" },
  { href: "/gallery", label: "ภาพงานพิธี" },
  { href: "/articles", label: "บทความ" },
  { href: "/how-to-order", label: "วิธีสั่งบูชา" },
];

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const data = await getData();

  const navWithDropdowns: NavItem[] = navItems.map((item) => {
    if (item.href === "/products") {
      return {
        ...item,
        groups: categoryGroups.map((group) => ({
          label: group.label,
          items: group.ids
            .filter((id) => data.categoryNames[id] && categoryCount(data, id) > 0)
            .map((id) => ({
              href: `/products?cat=${id}`,
              label: data.categoryNames[id],
            })),
        })),
      };
    }
    if (item.href === "/masters") {
      return {
        ...item,
        groups: [
          {
            label: "",
            items: data.masters.map((m) => ({
              href: `/masters/${m.slug}`,
              label: m.name,
            })),
          },
        ],
      };
    }
    return item;
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <header className="sticky top-0 z-40 border-b border-gold/25 bg-night/90 text-ivory shadow-md backdrop-blur">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
        <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex shrink-0 items-baseline gap-2">
            <span className="font-heading whitespace-nowrap text-xl font-bold text-gold-light sm:text-2xl">
              เสาร์๕มหานิยม
            </span>
            <span className="hidden text-xs tracking-widest text-smoke sm:inline">SATURDAY5AMULET</span>
          </Link>
          <div className="flex min-w-0 items-center gap-1">
            <SiteNav items={navWithDropdowns} />
            <HeaderSearch />
            <MobileNav items={navWithDropdowns} />
          </div>
        </div>
      </header>

      {/* pb กันปุ่ม Line ลอยทับเนื้อหาท้ายหน้าบนมือถือ — จอ lg ขึ้นไปมีพื้นที่พอ */}
      <main className="min-h-screen pb-20 lg:pb-0">{children}</main>

      <footer className="mt-16 border-t border-gold/20 bg-night-soft px-4 py-10 text-ivory/80">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
          <div>
            <div className="font-heading text-lg font-bold text-gold-light">เสาร์๕มหานิยม</div>
            <p className="mt-2 text-sm leading-relaxed">
              วัตถุมงคล เครื่องราง กุมารทอง ของแท้จากวัดและสำนักโดยตรง
              โดยแม่หมอสายมู อาจารย์เล็กเสาร์ห้า
            </p>
          </div>
          <div>
            <div className="font-heading font-semibold text-ivory">เมนู</div>
            <ul className="mt-2 space-y-1 text-sm">
              {navItems.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="hover:text-gold-light">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-heading font-semibold text-ivory">ติดต่อ</div>
            <p className="mt-2 text-sm">
              Line: {LINE_ID}
              <br />
              เปิดทุกวัน ตอบแชทเร็ว
            </p>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t border-ivory/10 pt-4 text-center text-xs text-ivory/50">
          © {new Date().getFullYear()} Saturday5Amulet.com
        </div>
      </footer>

      <FloatingLineButton />
    </>
  );
}
