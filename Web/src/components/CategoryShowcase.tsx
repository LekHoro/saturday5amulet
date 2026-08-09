import Link from "next/link";
import Image from "next/image";
import {
  KumanthongIcon,
  KumareeIcon,
  FortuneBagIcon,
  CharmHeartIcon,
  SparkleIcon,
} from "@/components/icons";
import { getDict, href, type Lang } from "@/lib/i18n";

// แถบหมวดหมู่บนหน้ารวมสินค้า (เฉพาะวิวไม่กรอง) — bento สองภาษาเลย์เอาต์:
// ฝั่งประเภท = รูปสินค้าเต็มการ์ดโทนทองตระกูลกุมารทอง, ฝั่งพุทธคุณ = แบ่งสีตามหมวด
// (ทอง=โชคลาภ ส้มอิฐ=เสน่ห์ แดงชาด=สะเดาะเคราะห์) ตามภาษาสีของหน้าแรก

export interface ShowcaseTile {
  id: string;
  name: string;
  count: number;
  image: string | null;
}

export type PowerAccent = "gold" | "ember" | "crimson";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "8647": KumanthongIcon,
  "102534": KumareeIcon,
  "91638": FortuneBagIcon,
  "41976": CharmHeartIcon,
  "102273": SparkleIcon,
};

// สีประจำหมวดพุทธคุณ — ใช้กับกรอบ ม่านไล่เฉด ไอคอน และตัวเลขจำนวน
const ACCENTS: Record<
  PowerAccent,
  { border: string; scrim: string; accentText: string }
> = {
  gold: {
    border: "border-gold/35 hover:border-gold",
    scrim: "from-brown-gold via-brown-gold/55 to-transparent",
    accentText: "text-gold-light",
  },
  ember: {
    border: "border-ember/45 hover:border-ember",
    scrim: "from-[#4d2415] via-[#4d2415]/55 to-transparent",
    accentText: "text-ember",
  },
  crimson: {
    border: "border-crimson/70 hover:border-crimson",
    scrim: "from-crimson-deep via-crimson-deep/55 to-transparent",
    accentText: "text-[#e39a9a]",
  },
};

function TileIcon({ id, className }: { id: string; className: string }) {
  const Icon = ICONS[id];
  return Icon ? (
    <span aria-hidden className={className}>
      <Icon className="h-6 w-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
    </span>
  ) : null;
}

export default function CategoryShowcase({
  hero,
  subs,
  powers,
  lang,
}: {
  hero: ShowcaseTile;
  subs: ShowcaseTile[];
  powers: (ShowcaseTile & { accent: PowerAccent })[];
  lang: Lang;
}) {
  const t = getDict(lang);
  const catHref = (id: string) => `${href(lang, "/products")}?cat=${id}`;
  // เลย์เอาต์ desktop: hero 2×2 ซ้าย, แถวบนหมวดย่อยกว้าง-แคบ-แคบ, แถวล่างพุทธคุณแคบ-แคบ-กว้าง
  const subSpans = ["sm:col-span-2", "sm:col-span-1", "sm:col-span-1"];
  const powerSpans = ["sm:col-span-1", "sm:col-span-1", "sm:col-span-2"];

  return (
    <section aria-labelledby="category-showcase">
      <h2 id="category-showcase" className="font-heading text-lg font-semibold text-gold">
        {t.products.browseByCategory}
      </h2>
      <div className="mt-4 grid auto-rows-[6.5rem] grid-cols-2 gap-3 sm:auto-rows-[8.25rem] sm:grid-flow-dense sm:grid-cols-6 sm:gap-4">
        {/* กุมารทอง — หมวดใหญ่ การ์ดรูปเด่น */}
        <Link
          href={catHref(hero.id)}
          className="group relative col-span-2 row-span-2 overflow-hidden rounded-2xl border border-gold/30 bg-night-soft transition hover:border-gold"
        >
          {hero.image && (
            <Image
              src={hero.image}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover object-[center_20%] transition duration-300 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-night/95 via-night/25 to-transparent" />
          <TileIcon id={hero.id} className="absolute left-4 top-4 text-gold-light" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="font-heading text-xl font-semibold text-gold-light">{hero.name}</p>
            <p className="mt-0.5 text-xs text-ivory/80">{t.home.items(hero.count)}</p>
          </div>
        </Link>

        {/* หมวดย่อยกุมารทอง — ตระกูลทองเดียวกับหมวดใหญ่ */}
        {subs.map((s, i) => (
          <Link
            key={s.id}
            href={catHref(s.id)}
            className={`group relative overflow-hidden rounded-2xl border border-gold/25 bg-night-soft transition hover:border-gold ${subSpans[i] ?? "sm:col-span-1"}`}
          >
            {s.image && (
              <Image
                src={s.image}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover object-[center_25%] transition duration-300 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-night/95 via-night/45 to-transparent" />
            <TileIcon id={s.id} className="absolute left-3 top-3 text-gold-light" />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="text-sm font-semibold leading-snug text-ivory">{s.name}</p>
              <p className={`mt-0.5 text-xs ${ACCENTS.gold.accentText}`}>{t.home.items(s.count)}</p>
            </div>
          </Link>
        ))}

        {/* หมวดพุทธคุณ — แบ่งสีประจำหมวด */}
        {powers.map((p, i) => {
          const a = ACCENTS[p.accent];
          return (
            <Link
              key={p.id}
              href={catHref(p.id)}
              className={`group relative overflow-hidden rounded-2xl border bg-night-soft transition ${a.border} ${powerSpans[i] ?? "sm:col-span-1"}`}
            >
              {p.image && (
                <Image
                  src={p.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              )}
              <div className={`absolute inset-0 bg-gradient-to-t ${a.scrim}`} />
              <TileIcon id={p.id} className={`absolute left-3 top-3 ${a.accentText}`} />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-sm font-semibold leading-snug text-ivory">{p.name}</p>
                <p className={`mt-0.5 text-xs ${a.accentText}`}>{t.home.items(p.count)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
