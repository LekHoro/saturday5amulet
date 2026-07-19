import type { Metadata } from "next";
import pagesRaw from "@/data/pages.json" with { type: "json" };
import { cleanHtml } from "@/lib/data";
import { lineChatUrl, LINE_ID } from "@/lib/line";
import { LineInquiryButton } from "@/components/LineButton";

export const metadata: Metadata = {
  title: "วิธีสั่งบูชาและชำระเงิน",
  description:
    "ขั้นตอนการสั่งบูชาวัตถุมงคลกับเสาร์๕มหานิยม ทัก Line สอบถาม ชำระเงิน และรอรับองค์ที่บ้าน พร้อมเงื่อนไขการรับประกันวัตถุมงคลแท้ คืนเงิน 100%",
};

const steps = [
  {
    title: "เลือกวัตถุมงคลที่สนใจ",
    text: "ดูรายละเอียด รูปภาพ ราคา และพุทธคุณของแต่ละรุ่นได้จากหน้าเว็บ ทุกองค์มีข้อมูลพิธีปลุกเสกและที่มากำกับ",
  },
  {
    title: "ทัก Line สอบถาม / ยืนยันการบูชา",
    text: `กดปุ่ม "สั่งบูชาผ่าน Line" ในหน้าสินค้า ระบบจะแนบชื่อรุ่นให้อัตโนมัติ หรือแอดไลน์ ${LINE_ID} แล้วแจ้งรุ่นที่ต้องการ`,
  },
  {
    title: "ชำระเงิน",
    text: "โอนชำระตามยอดที่แจ้งทางแชท พร้อมส่งสลิปยืนยัน",
  },
  {
    title: "จัดส่งถึงบ้าน",
    text: "จัดส่งด่วนทั่วประเทศ พร้อมวิธีบูชา คาถากำกับ และใบรับประกันของทางร้าน",
  },
];

export default function HowToOrderPage() {
  const guarantee = (pagesRaw as { title: string; contentHtml: string | null }[])[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-gold">วิธีสั่งบูชาและชำระเงิน</h1>

      <ol className="mt-6 space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4 rounded-xl border border-gold/25 bg-night-soft p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold font-bold text-night">
              {i + 1}
            </div>
            <div>
              <div className="font-heading font-semibold text-gold">{s.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-smoke">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex justify-center">
        <LineInquiryButton url={lineChatUrl("สนใจสั่งบูชาวัตถุมงคล")} label="ทัก Line เลย" />
      </div>

      {guarantee?.contentHtml && (
        <section className="mt-10 rounded-2xl border border-gold/25 bg-night-soft p-6">
          <h2 className="font-heading border-b border-gold/20 pb-2 text-lg font-bold text-gold">
            {guarantee.title}
          </h2>
          <div
            className="legacy-content mt-4 text-[15px]"
            dangerouslySetInnerHTML={{ __html: cleanHtml(guarantee.contentHtml) }}
          />
        </section>
      )}
    </div>
  );
}
