import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prompt, Anuphan } from "next/font/google";
import { FloatingLineButton } from "@/components/LineButton";
import HeaderSearch from "@/components/HeaderSearch";
import LangSwitcher from "@/components/LangSwitcher";
import SiteNav, { MobileNav, type NavItem } from "@/components/SiteNav";
import { LINE_ID, lineChatUrl } from "@/lib/line";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { getSiteData } from "@/lib/db";
import { categoryGroups, categoryCount } from "@/lib/data";
import { LANGS, isLang, getDict, href, type Lang } from "@/lib/i18n";
import "../../globals.css";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-prompt",
});

const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-anuphan",
});

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.title, template: t.meta.template },
    description: t.meta.description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: href(lang, "/"),
      languages: { th: "/", en: "/en", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      locale: t.ogLocale,
      url: href(lang, "/"),
      siteName: SITE_NAME,
      title: t.meta.title,
      description: t.meta.description,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
      images: ["/og-image.jpg"],
    },
  };
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.jpg`,
  sameAs: [lineChatUrl()],
};

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);
  const l = (path: string) => href(lang as Lang, path);

  const data = await getSiteData(lang);

  const navItems = [
    { href: l("/"), label: t.nav.home },
    { href: l("/products"), label: t.nav.products },
    { href: l("/masters"), label: t.nav.masters },
    { href: l("/gallery"), label: t.nav.gallery },
    { href: l("/articles"), label: t.nav.articles },
    { href: l("/how-to-order"), label: t.nav.howToOrder },
  ];

  const navWithDropdowns: NavItem[] = navItems.map((item) => {
    if (item.href === l("/products")) {
      return {
        ...item,
        groups: categoryGroups.map((group) => ({
          label: t.categoryGroups[group.slug] ?? group.label,
          items: group.ids
            .filter((id) => data.categoryNames[id] && categoryCount(data, id) > 0)
            .map((id) => ({
              href: l(`/products?cat=${id}`),
              label: data.categoryNames[id],
            })),
        })),
      };
    }
    if (item.href === l("/masters")) {
      return {
        ...item,
        groups: [
          {
            label: "",
            items: data.masters.map((m) => ({
              href: l(`/masters/${m.slug}`),
              label: m.name,
            })),
          },
        ],
      };
    }
    return item;
  });

  return (
    <html lang={t.htmlLang}>
      <body className={`${prompt.variable} ${anuphan.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <header className="sticky top-0 z-40 border-b border-gold/25 bg-night/90 text-ivory shadow-md backdrop-blur">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
          <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href={l("/")} className="flex shrink-0 items-baseline gap-2">
              <span className="font-heading whitespace-nowrap text-xl font-bold text-gold-light sm:text-2xl">
                เสาร์๕มหานิยม
              </span>
              <span className="hidden text-xs tracking-widest text-smoke sm:inline">SATURDAY5AMULET</span>
            </Link>
            <div className="flex min-w-0 items-center gap-1">
              <SiteNav items={navWithDropdowns} lang={lang} />
              <HeaderSearch lang={lang} />
              <LangSwitcher lang={lang} />
              <MobileNav items={navWithDropdowns} lang={lang} />
            </div>
          </div>
        </header>

        {/* pb กันปุ่ม Line ลอยทับเนื้อหาท้ายหน้าบนมือถือ — จอ lg ขึ้นไปมีพื้นที่พอ */}
        <main className="min-h-screen pb-20 lg:pb-0">{children}</main>

        <footer className="mt-16 border-t border-gold/20 bg-night-soft px-4 py-10 text-ivory/80">
          <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
            <div>
              <div className="font-heading text-lg font-bold text-gold-light">เสาร์๕มหานิยม</div>
              <p className="mt-2 text-sm leading-relaxed">{t.footer.about}</p>
            </div>
            <div>
              <div className="font-heading font-semibold text-ivory">{t.footer.menu}</div>
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
              <div className="font-heading font-semibold text-ivory">{t.footer.contact}</div>
              <p className="mt-2 text-sm">
                Line: {LINE_ID}
                <br />
                {t.footer.openDaily}
              </p>
            </div>
          </div>
          <div className="mx-auto mt-8 max-w-6xl border-t border-ivory/10 pt-4 text-center text-xs text-ivory/50">
            © {new Date().getFullYear()} Saturday5Amulet.com
          </div>
        </footer>

        <FloatingLineButton lang={lang} />
      </body>
    </html>
  );
}
