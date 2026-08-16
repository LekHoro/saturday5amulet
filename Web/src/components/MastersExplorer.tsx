"use client";

import { useMemo, useState } from "react";
import MasterCard from "./MasterCard";
import { getDict, type Lang } from "@/lib/i18n";
import type { MasterWithMeta } from "@/lib/data";

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-smoke"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export default function MastersExplorer({
  masters,
  lang,
}: {
  masters: MasterWithMeta[];
  lang: Lang;
}) {
  const t = getDict(lang);
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return masters;
    return masters.filter((m) => m.name.toLowerCase().includes(needle));
  }, [masters, q]);

  return (
    <div>
      <div className="relative mx-auto max-w-sm">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <SearchIcon />
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.masters.searchPlaceholder}
          aria-label={t.masters.searchAria}
          className="w-full rounded-lg border border-gold/30 bg-night-soft py-2 pl-9 pr-9 text-sm text-ivory placeholder:text-smoke/80 focus:border-gold/60 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            aria-label={t.masters.clearSearch}
            className="absolute inset-y-0 right-2 flex items-center rounded-lg px-1 text-smoke transition hover:text-gold-light"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p className="mt-8 text-center text-sm text-smoke">{t.masters.notFound(q)}</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((m) => (
            <MasterCard key={m.slug} master={m} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
