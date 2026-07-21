import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/data";

export default function ProductCard({ product }: { product: Product }) {
  const img = product.images[0];
  return (
    <Link
      href={`/products/${product.id}`}
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
          <div className="flex h-full items-center justify-center text-4xl">🙏</div>
        )}
        {product.soldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-night/80 px-3 py-1 text-xs font-semibold text-smoke ring-1 ring-smoke/40">
            หมดแล้ว
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {product.title}
        </h3>
        <div className="mt-auto pt-2">
          {product.soldOut ? (
            <span className="text-xs text-smoke sm:text-sm">ปิดรายการบูชาแล้ว</span>
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
