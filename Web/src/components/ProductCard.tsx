import Image from "next/image";
import Link from "next/link";
import { ImageFallback } from "@/components/icons";
import { getDict, href, type Lang } from "@/lib/i18n";

/** เฉพาะฟิลด์ที่การ์ดใช้จริง — Product เต็มก็ส่งเข้ามาได้ (structural typing) */
export interface ProductCardData {
  id: string;
  title: string;
  priceText: string;
  soldOut: boolean;
  images: string[];
}

export default function ProductCard({ product, lang }: { product: ProductCardData; lang: Lang }) {
  const t = getDict(lang);
  const img = product.images[0];
  return (
    <Link
      href={href(lang, `/products/${product.id}`)}
      className="group flex flex-col overflow-hidden rounded-xl border border-gold/20 bg-night-soft shadow-sm transition hover:-translate-y-1 hover:border-gold/50 hover:shadow-lg hover:shadow-gold/10"
    >
      {/* ภาพแนวนอน 4:3 — รูปสินค้ามีทั้งแนวตั้ง/แนวนอน จึงใช้ object-contain กันองค์พระโดนครอป */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-night">
        {img ? (
          <Image
            src={img}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1152px) 25vw, 288px"
            className="object-contain transition duration-300 group-hover:scale-105"
          />
        ) : (
          <ImageFallback className="text-4xl" />
        )}
        {product.soldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-night/80 px-3 py-1 text-xs font-semibold text-smoke ring-1 ring-smoke/40">
            {t.products.soldOutBadge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {product.title}
        </h3>
        <div className="mt-auto pt-2">
          {product.soldOut ? (
            <span className="text-xs text-smoke sm:text-sm">{t.products.closedCard}</span>
          ) : (
            <span className="text-sm font-bold text-gold-light sm:text-base">
              {product.priceText}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
