import Image from "next/image";
import Link from "next/link";
import { ImageFallback } from "@/components/icons";
import type { MasterWithMeta } from "@/lib/data";
import { getDict, href, type Lang } from "@/lib/i18n";

export default function MasterCard({ master, lang }: { master: MasterWithMeta; lang: Lang }) {
  const t = getDict(lang);
  return (
    <Link
      href={href(lang, `/masters/${master.slug}`)}
      className="group flex flex-col items-center rounded-2xl border border-gold/25 bg-night-soft p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-gold hover:shadow-md"
    >
      <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-gold/60 bg-night ring-2 ring-gold/10 transition group-hover:border-gold">
        {master.cover ? (
          <Image
            src={master.cover}
            alt={master.name}
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <ImageFallback className="text-3xl" />
        )}
      </div>
      <h3 className="font-heading mt-4 font-semibold leading-snug text-gold-light group-hover:text-gold">
        {master.name}
      </h3>
      <p className="mt-1 text-xs text-smoke">
        {t.masters.editions(master.count)}
        {master.available > 0 && (
          <span className="text-gold/80"> · {t.masters.available(master.available)}</span>
        )}
      </p>
    </Link>
  );
}
