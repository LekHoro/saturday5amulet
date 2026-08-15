// คู่มือเลี้ยงกุมารทอง ฉบับวิดีโอ — คลิปยาว 26 นาทีตัดจากไลฟ์ EP.01 ปี 2021
// ไทม์สแตมป์ชุดเดียวกับบทในหน้าคลิปบนยูทูป ถ้าแก้ฝั่งโน้นต้องแก้ฝั่งนี้ด้วย

export const KMT_GUIDE_VIDEO_ID = "vnNwGSFA5AE";
export const KMT_GUIDE_WATCH_URL = `https://www.youtube.com/watch?v=${KMT_GUIDE_VIDEO_ID}`;
export const KMT_GUIDE_UPLOAD_DATE = "2026-08-14";
/** ความยาวคลิปเป็นวินาที (26:42) */
export const KMT_GUIDE_DURATION_S = 1602;
export const KMT_GUIDE_DURATION_ISO = "PT26M42S";
export const KMT_GUIDE_POSTER = "/banners/kumanthong-guide-poster.jpg";
/** ปก 16:9 ตัวเดียวกับหน้าปกบนยูทูป — ใช้กับการ์ดชวนเข้าหน้าและรูปตอนแชร์ */
export const KMT_GUIDE_COVER = "/banners/kumanthong-guide-cover.jpg";

export type GuideChapter = {
  /** วินาทีที่บทเริ่ม ตรงกับไทม์สแตมป์บนยูทูป */
  start: number;
  name: string;
  nameEn: string;
};

export const KMT_GUIDE_CHAPTERS: GuideChapter[] = [
  { start: 0, name: "เทคนิคเลือกกุมารทอง เลือกที่ถูกชะตา", nameEn: "How to pick a Kumanthong that clicks with you" },
  { start: 58, name: "ทิศที่ห้ามตั้งบูชา กุมารทอง", nameEn: "Directions the altar must not face" },
  { start: 102, name: "องค์ครู กับ องค์ธรรมดา ต่างกันยังไง", nameEn: "Ong Kru vs regular statue — the difference" },
  { start: 177, name: "4 ขยัน เลี้ยงกุมารทองให้เก่ง", nameEn: "The “4 diligences” that raise a capable Kumanthong" },
  { start: 247, name: "บนกุมารทอง ยังไงให้ได้ผล", nameEn: "How to make a vow that actually works" },
  { start: 425, name: "ลืมแก้บน จะเกิดอะไรขึ้น", nameEn: "What happens if you forget to repay a vow" },
  { start: 505, name: "อย่าสปอยล์ลูก ให้ของอย่างเดียวไม่ใช้งาน", nameEn: "Don’t spoil them — gifts alone won’t do" },
  { start: 555, name: "ขยันบ่น ทำไมต้องบ่นกับลูก", nameEn: "Why you should keep talking to your Kumanthong" },
  { start: 690, name: "ขยันบอก · ขยันขอ ต่างกันยังไง", nameEn: "Telling vs asking — what’s the difference" },
  { start: 845, name: "บนขอ 3 ตัว ได้ 2 ตัว ต้องแก้บนไหม", nameEn: "Vowed for three, got two — repay the vow?" },
  { start: 928, name: "ของที่ถวายลูกแล้ว เรากินต่อได้ไหม", nameEn: "Can we eat food already offered to them?" },
  { start: 964, name: "เรียกลูกมากินข้าวด้วย เปิดทางให้เข้าตัว", nameEn: "Inviting them to share your meal — why it’s risky" },
  { start: 1029, name: "รับองค์มาแล้วเวียนหัว อาเจียน เพราะอะไร", nameEn: "Dizzy or nauseous after receiving a statue — why" },
  { start: 1189, name: "ไม่สะดวกจุดธูป ทำยังไงได้บ้าง", nameEn: "Can’t burn incense at home — what to do" },
  { start: 1256, name: "อยากให้ลูกแรงขึ้น เพิ่มพลังยังไง", nameEn: "How to boost your Kumanthong’s power" },
  { start: 1426, name: "กุมารสายพราย น่ากลัวไหม กำกับยังไง", nameEn: "Phrai-line Kumanthong — how to keep them in check" },
];

/** วินาที → "m:ss" สำหรับป้ายเวลาในสารบัญ */
export function formatChapterTime(s: number): string {
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  return `${m}:${ss}`;
}
