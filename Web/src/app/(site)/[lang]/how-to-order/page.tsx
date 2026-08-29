import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { lineChatUrl, LINE_ID } from "@/lib/line";
import { LineInquiryButton } from "@/components/LineButton";
import LineLink from "@/components/LineLink";
import { getDict, isLang, href, type Lang } from "@/lib/i18n";

// หน้านี้คือด่านความเชื่อใจก่อนเข้าแชท — การปิดการขายเกิดใน Line
// จึงไม่โชว์เลขบัญชี/ตารางราคาตายตัว แต่บอกให้ชัดว่า "ทักแล้วเจออะไร" ทุกขั้นตอน
// ข้อความทั้งหน้าอยู่ใน dict (order.*) ทั้งไทยและอังกฤษ

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  return {
    title: t.order.metaTitle,
    description: t.order.metaDescription,
    alternates: {
      canonical: href(lang, "/how-to-order"),
      languages: { th: "/how-to-order", en: "/en/how-to-order" },
    },
  };
}

function ChatIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12Z" />
      <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.4 3 8.4 7 10 4-1.6 7-5.6 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.8 1.8 3.2-3.6" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

const assuranceIcons = [<ChatIcon key="chat" />, <ShieldIcon key="shield" />, <TruckIcon key="truck" />];

export default async function HowToOrderPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "th";
  const t = getDict(lang);
  const l = (path: string) => href(lang, path);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.order.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    // หน้านี้ไม่มีปุ่ม Line ลอย (FloatingLineButton ซ่อนตัวเองบน /how-to-order) — CTA ท้ายหน้าไม่ถูกทับ
    <div className="mx-auto max-w-3xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <h1 className="font-heading text-2xl font-bold text-gold sm:text-3xl">{t.order.title}</h1>
      <p className="mt-3 leading-relaxed text-ivory/90">{t.order.lead}</p>

      {/* ขั้นตอน — เส้นทองเชื่อมเป็นไทม์ไลน์เดียว ให้เห็นว่าเส้นทางสั้นและจบที่บ้าน */}
      <ol className="relative mt-8 space-y-7 border-l border-gold/30 pl-8">
        {t.order.steps.map((s, i) => (
          <li key={s.title} className="relative">
            <div className="absolute -left-[45px] flex h-8 w-8 items-center justify-center rounded-full bg-gold font-heading text-sm font-bold text-night ring-4 ring-night">
              {i + 1}
            </div>
            <h2 className="font-heading font-semibold text-gold">{s.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-smoke">{s.text}</p>
          </li>
        ))}
      </ol>

      {/* คำถามตั้งต้น — แตะแล้วเปิด Line พร้อมข้อความ */}
      <section className="mt-10 rounded-2xl border border-gold/25 bg-night-soft p-5 sm:p-6">
        <h2 className="font-heading text-lg font-semibold text-gold-light">
          {t.order.starterHeading}
        </h2>
        <p className="mt-1 text-sm text-smoke">{t.order.starterHint}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {t.order.starterQuestions.map((q) => (
            <li key={q}>
              <LineLink
                href={lineChatUrl(q)}
                lang={lang}
                className="inline-block rounded-full border border-gold/40 px-4 py-2 text-sm text-ivory transition hover:border-gold hover:bg-gold/10 hover:text-gold-light"
              >
                “{q}”
              </LineLink>
            </li>
          ))}
        </ul>
      </section>

      {/* เหตุผลที่วางใจ */}
      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {t.order.assurances.map((a, i) => (
          <div key={a.title} className="rounded-2xl border border-gold/20 bg-night-soft p-5">
            <div className="text-gold">{assuranceIcons[i]}</div>
            <h2 className="mt-3 font-heading font-semibold text-ivory">{a.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-smoke">{a.text}</p>
          </div>
        ))}
      </section>

      {/*
        TODO(เจ้าของร้าน): มีของจริงเมื่อไหร่ เพิ่มได้อีก 1 อย่างที่ช่วยปิดการขายมาก
        แกลเลอรีรูปพัสดุที่แพ็คจริง 3-4 รูป (ก่อนส่ง/สลิปขนส่ง) — แทรกเป็น section ก่อน FAQ
      */}

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="font-heading text-xl font-bold text-gold">{t.order.faqHeading}</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-gold/25 bg-night-soft">
          {t.order.faqs.map((f, i) => (
            <details key={f.q} className={`group ${i > 0 ? "border-t border-gold/15" : ""}`}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold text-ivory transition hover:text-gold-light [&::-webkit-details-marker]:hidden">
                {f.q}
                <svg
                  className="h-4 w-4 shrink-0 text-gold transition-transform group-open:rotate-180"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="px-5 pb-4">
                <p className="text-sm leading-relaxed text-smoke">{f.a}</p>
                {f.link && (
                  <Link
                    href={l(f.link.href)}
                    className="mt-2 inline-block text-sm font-semibold text-gold-light hover:text-gold"
                  >
                    {f.link.label}
                  </Link>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA ปิดท้าย */}
      <section className="mt-10 rounded-2xl border border-gold/30 bg-night-soft p-6 text-center sm:p-8">
        <h2 className="font-heading text-xl font-bold text-gold-light">{t.order.ctaHeading}</h2>
        <p className="mt-2 text-sm text-smoke">
          Line: <span className="font-semibold text-ivory">{LINE_ID}</span> · {t.footer.openDaily}
        </p>
        {/* QR คู่กับปุ่ม — จอสัมผัสกดปุ่มเข้าแอปตรง ๆ ส่วนคนดูบนคอมสแกนด้วยมือถือได้เลย
            ไม่ต้องกดก่อน (QR ใบทางการ ชี้ไปบัญชีเดียวกับปุ่ม) */}
        <div className="mt-6 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-7">
          <a
            href={lineChatUrl()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.line.qrAria(LINE_ID)}
            className="shrink-0 rounded-xl bg-white p-2.5 shadow-md shadow-black/30 transition hover:scale-[1.03]"
          >
            <Image src="/line-qr.png" alt="" width={540} height={540} className="h-28 w-28" />
          </a>
          <LineInquiryButton url={lineChatUrl(t.order.startChatMessage)} lang={lang} label={t.order.ctaStart} />
        </div>
      </section>
    </div>
  );
}
