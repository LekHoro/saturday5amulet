import type { Metadata } from "next";
import { lineChatUrl, LINE_ID } from "@/lib/line";
import { LineInquiryButton } from "@/components/LineButton";

export const metadata: Metadata = {
  title: "วิธีสั่งบูชาและชำระเงิน",
  description:
    "ขั้นตอนการสั่งบูชาวัตถุมงคลกับเสาร์๕มหานิยม ทัก Line สอบถาม ชำระเงิน และรอรับองค์ที่บ้าน พร้อมวิธีบูชาและคาถากำกับทุกรุ่น",
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
    text: "จัดส่งด่วนทั่วประเทศ พร้อมวิธีบูชาและคาถากำกับ",
  },
];

export default function HowToOrderPage() {
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
    </div>
  );
}
