import type { Metadata } from "next";
import MasterCard from "@/components/MasterCard";
import SectionHeading from "@/components/SectionHeading";
import { getData, YOUTUBE_CHANNEL } from "@/lib/db";

export const metadata: Metadata = {
  title: "ครูบาอาจารย์ / สำนัก",
  description:
    "รวมครูบาอาจารย์และสำนักผู้ปลุกเสกวัตถุมงคล เครื่องราง กุมารทอง — อาจารย์สุบิน นะหน้าทอง, พระอาจารย์อำนาจ มหาวีโร, หลวงปู่แย้ม วัดสามง่าม และอีกหลายท่าน",
};

export default async function MastersPage() {
  const { masters } = await getData();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-gold sm:text-3xl">
          ครูบาอาจารย์ / สำนัก
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-smoke">
          ทุกองค์คัดสายตรงจากครูบาอาจารย์และสำนักผู้จัดสร้าง ผ่านพิธีปลุกเสกจริง
          เลือกชมวัตถุมงคลตามอาจารย์ที่ท่านศรัทธาได้เลย
        </p>
        <a
          href={YOUTUBE_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gold/40 px-5 py-2.5 text-sm font-semibold text-gold-light transition hover:border-gold hover:bg-gold/10"
        >
          ▶ ดูวิดีโอพิธีจากช่อง YouTube ของร้าน
        </a>
      </div>

      <div className="mt-10">
        <SectionHeading center>เลือกตามอาจารย์</SectionHeading>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {masters.map((m) => (
            <MasterCard key={m.slug} master={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
