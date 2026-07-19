import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/data";

export default function ProductCard({ product }: { product: Product }) {
  const img = product.images[0];
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gold/20 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-cream">
        {img ? (
          <Image
            src={img}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🙏</div>
        )}
        {product.soldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
            หมดแล้ว
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{product.title}</h3>
        <div className="mt-auto pt-2">
          {product.soldOut ? (
            <span className="text-sm text-gray-500">ปิดรายการบูชาแล้ว</span>
          ) : (
            <span className="text-base font-bold text-maroon">{product.priceText}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
