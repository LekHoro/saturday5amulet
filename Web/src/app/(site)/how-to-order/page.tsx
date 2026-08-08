import type { Metadata } from "next";
import Link from "next/link";
import { lineChatUrl, LINE_ID } from "@/lib/line";
import { LineInquiryButton } from "@/components/LineButton";

// หน้านี้คือด่านความเชื่อใจก่อนเข้าแชท — การปิดการขายเกิดใน Line
// จึงไม่โชว์เลขบัญชี/ตารางราคาตายตัว แต่บอกให้ชัดว่า "ทักแล้วเจออะไร" ทุกขั้นตอน

export const metadata: Metadata = {
  title: "วิธีสั่งบูชาและชำระเงิน",
  description:
    "ขั้นตอนการสั่งบูชาวัตถุมงคลกับเสาร์๕มหานิยม — ทัก Line สอบถามก่อนได้ไม่มีข้อผูกมัด ยืนยันยอดและชำระเงินในแชท จัดส่งด่วนทั่วประเทศและต่างประเทศ พร้อมวิธีบูชาและคาถากำกับทุกรุ่น",
  alternates: { canonical: "/how-to-order" },
};

const steps = [
  {
    title: "เลือกวัตถุมงคลที่สนใจ",
    text: "ดูรูปภาพ ราคาบูชา พุทธคุณ และข้อมูลพิธีปลุกเสกของแต่ละรุ่นได้จากหน้าเว็บ ถ้ายังไม่แน่ใจว่ารุ่นไหนเหมาะ ทักมาเล่าสิ่งที่ตั้งใจได้เลย ทางร้านช่วยแนะนำให้",
  },
  {
    title: "ทัก Line คุยกับทางร้านโดยตรง",
    text: `กดปุ่ม "สั่งบูชาผ่าน Line" ในหน้าสินค้า ระบบจะแนบชื่อรุ่นให้อัตโนมัติ หรือแอดไลน์ ${LINE_ID} แล้วแจ้งรุ่นที่ต้องการ สอบถามได้ทุกเรื่องก่อนตัดสินใจ ไม่มีข้อผูกมัด`,
  },
  {
    title: "ยืนยันการบูชาและชำระเงินในแชท",
    text: "เมื่อพร้อมบูชา ทางร้านจะแจ้งยอดรวมพร้อมบัญชีสำหรับโอนเป็นลายลักษณ์อักษรในแชท โอนแล้วส่งสลิปยืนยันในแชทเดียวกัน ประวัติการคุยเก็บไว้เป็นหลักฐานได้ตลอด",
  },
  {
    title: "แพ็คอย่างดี ส่งด่วนถึงบ้าน",
    text: "จัดส่งด่วนทั่วประเทศ แจ้งเลขพัสดุให้ติดตามในแชททันทีที่จัดส่ง ทุกองค์แนบวิธีบูชาและคาถากำกับ",
  },
];

// คำถามตั้งต้น — กดแล้วเปิด Line พร้อมข้อความนี้เลย ลดกำแพง "ไม่รู้จะพิมพ์อะไรก่อน"
const starterQuestions = [
  "ช่วยแนะนำรุ่นที่เหมาะกับโชคลาภ ค้าขาย",
  "อยากทราบวิธีบูชาและของที่ต้องเตรียม",
  "รุ่นที่สนใจมีองค์พร้อมส่งไหม",
  "ส่งต่างประเทศได้ไหม ค่าส่งประมาณเท่าไหร่",
];

const faqs = [
  {
    q: "ทักไปถามเฉย ๆ ก่อนได้ไหม ยังไม่แน่ใจว่าจะบูชา",
    a: "ได้เสมอ การทักแชทไม่มีข้อผูกมัด สอบถามรายละเอียด เปรียบเทียบรุ่น หรือให้ช่วยแนะนำก่อนได้ ตัดสินใจเมื่อพร้อมเท่านั้น",
  },
  {
    q: "ชำระเงินอย่างไร ปลอดภัยแค่ไหน",
    a: "ทางร้านแจ้งยอดรวมพร้อมบัญชีสำหรับโอนเป็นลายลักษณ์อักษรในแชท Line เท่านั้น โอนแล้วส่งสลิปยืนยันในแชทเดียวกัน ทุกขั้นตอนมีประวัติแชทเก็บไว้เป็นหลักฐาน หากมีข้อความแอบอ้างจากช่องทางอื่นให้ทักยืนยันกับไลน์ทางการของร้านก่อนโอนทุกครั้ง",
  },
  {
    q: "มั่นใจได้อย่างไรว่าเป็นของแท้",
    a: "ทุกองค์มาจากวัดและสำนักโดยตรง ผ่านพิธีปลุกเสก พุทธาภิเษก และไหว้ครูจากงานจริง แต่ละรุ่นมีข้อมูลพิธีและที่มากำกับในหน้าสินค้า ดูภาพบรรยากาศงานพิธีจริงได้ที่หน้าภาพงานพิธี",
    link: { href: "/gallery", label: "ดูภาพงานพิธีจริง →" },
  },
  {
    q: "บูชาไปแล้ว ไม่รู้วิธีเลี้ยง วิธีไหว้ ทำอย่างไร",
    a: "ทุกองค์แนบวิธีบูชาและคาถากำกับไปพร้อมพัสดุ และมีบทความวิธีบูชาอ่านได้บนเว็บ หากติดขัดตรงไหนทักแชทมาถามได้ตลอดแม้บูชาไปแล้ว",
    link: { href: "/articles", label: "อ่านบทความวิธีบูชา →" },
  },
  {
    q: "รุ่นที่หมดแล้ว ยังพอหาได้ไหม",
    a: "รุ่นที่หมดแล้วจะขึ้นสถานะไว้ในหน้าเว็บเพื่อเก็บเป็นประวัติรุ่น กดปุ่มแจ้งเตือนในหน้ารุ่นนั้นหรือทักแชทฝากชื่อรุ่นไว้ เมื่อมีเข้าใหม่ทางร้านจะแจ้งทาง Line ทันที",
  },
  {
    q: "อยู่ต่างประเทศ สั่งได้ไหม",
    a: "ได้ ทางร้านจัดส่งต่างประเทศผ่าน DHL / EMS แจ้งประเทศปลายทางในแชทเพื่อเช็คค่าส่งก่อนตัดสินใจได้เลย (We ship worldwide)",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

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

const assurances = [
  {
    icon: <ChatIcon />,
    title: "แชทเดียวจบทุกขั้นตอน",
    text: "ตั้งแต่สอบถาม ยืนยันยอด ส่งสลิป จนถึงเลขพัสดุ อยู่ในแชทเดียวกันทั้งหมด มีประวัติเป็นหลักฐานตลอด",
  },
  {
    icon: <ShieldIcon />,
    title: "ของแท้จากวัดและสำนัก",
    text: "ทุกองค์ผ่านพิธีปลุกเสก พุทธาภิเษก และไหว้ครูจากงานจริง มีข้อมูลพิธีกำกับทุกรุ่น",
  },
  {
    icon: <TruckIcon />,
    title: "ติดตามพัสดุได้",
    text: "จัดส่งด่วนทั่วประเทศ และต่างประเทศผ่าน DHL / EMS แจ้งเลขติดตามในแชททันทีที่ส่ง",
  },
];

export default function HowToOrderPage() {
  return (
    // pb เผื่อปุ่ม Line ลอยมุมจอ ไม่ให้ทับ CTA ท้ายหน้า
    <div className="mx-auto max-w-3xl px-4 py-8 pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <h1 className="font-heading text-2xl font-bold text-gold sm:text-3xl">
        วิธีสั่งบูชาและชำระเงิน
      </h1>
      <p className="mt-3 leading-relaxed text-ivory/90">
        การบูชาทุกองค์เริ่มและจบในแชท Line — ทักมาสอบถามก่อนได้โดยไม่มีข้อผูกมัด
        ทางร้านเปิดทุกวัน ตอบแชทเร็ว
      </p>

      {/* ขั้นตอน — เส้นทองเชื่อมเป็นไทม์ไลน์เดียว ให้เห็นว่าเส้นทางสั้นและจบที่บ้าน */}
      <ol className="relative mt-8 space-y-7 border-l border-gold/30 pl-8">
        {steps.map((s, i) => (
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
          ไม่รู้จะเริ่มถามอะไร? แตะคำถามด้านล่างได้เลย
        </h2>
        <p className="mt-1 text-sm text-smoke">
          ระบบจะเปิดแชท Line พร้อมพิมพ์คำถามให้ แค่กดส่ง
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {starterQuestions.map((q) => (
            <li key={q}>
              <a
                href={lineChatUrl(q)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full border border-gold/40 px-4 py-2 text-sm text-ivory transition hover:border-gold hover:bg-gold/10 hover:text-gold-light"
              >
                “{q}”
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* เหตุผลที่วางใจ */}
      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {assurances.map((a) => (
          <div key={a.title} className="rounded-2xl border border-gold/20 bg-night-soft p-5">
            <div className="text-gold">{a.icon}</div>
            <h2 className="mt-3 font-heading font-semibold text-ivory">{a.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-smoke">{a.text}</p>
          </div>
        ))}
      </section>

      {/*
        TODO(เจ้าของร้าน): มีของจริงเมื่อไหร่ เพิ่มได้อีก 2 อย่างที่ช่วยปิดการขายมาก
        1. รูป QR Code เพิ่มเพื่อน Line ของร้าน — วางแทนที่/คู่กับปุ่มในการ์ดท้ายหน้า
        2. แกลเลอรีรูปพัสดุที่แพ็คจริง 3-4 รูป (ก่อนส่ง/สลิปขนส่ง) — แทรกเป็น section ก่อน FAQ
      */}

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="font-heading text-xl font-bold text-gold">คำถามที่พบบ่อย</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-gold/25 bg-night-soft">
          {faqs.map((f, i) => (
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
                    href={f.link.href}
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
        <h2 className="font-heading text-xl font-bold text-gold-light">
          พร้อมเมื่อไหร่ ทักมาได้เลย
        </h2>
        <p className="mt-2 text-sm text-smoke">
          Line: <span className="font-semibold text-ivory">{LINE_ID}</span> · เปิดทุกวัน ตอบแชทเร็ว
        </p>
        <div className="mt-5 flex justify-center">
          <LineInquiryButton url={lineChatUrl("สนใจสั่งบูชาวัตถุมงคล")} label="เริ่มแชทกับทางร้าน" />
        </div>
      </section>
    </div>
  );
}
