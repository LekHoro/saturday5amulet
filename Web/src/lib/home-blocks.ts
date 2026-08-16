// ลำดับบล็อกบนหน้าแรก — เจ้าของจัดเอง (เลื่อนขึ้นลง / ปิด-เปิด / เพิ่มแถวสินค้า)
// ที่ /admin/settings/home แล้วเก็บลง settings key "home_blocks"
// ยังไม่เคยบันทึก = ใช้ DEFAULT_HOME_BLOCKS ตามที่ออกแบบหน้าไว้

export const HOME_BLOCK_KINDS = [
  "hero",
  "trust",
  "masters",
  "categories",
  "guide",
  "kumanthong",
  "others",
  "ceremony",
  "lagnara",
  "orderSteps",
  "gallery",
  "articles",
  "katha",
  "lineCta",
  "productRow",
] as const;

export type HomeBlockKind = (typeof HOME_BLOCK_KINDS)[number];

export interface HomeBlock {
  /** id ประจำบล็อกในลิสต์ — ชนิดเดี่ยวใช้ชื่อชนิดเลย, บล็อกที่เพิ่มเองต่อท้ายด้วยเลขกันชนกัน */
  key: string;
  kind: HomeBlockKind;
  /** false = ซ่อนจากหน้าเว็บ แต่ยังอยู่ในลิสต์แอดมิน กดเปิดคืนได้ */
  on: boolean;
  /** เฉพาะ productRow — หมวดที่จะเอาสินค้ามาโชว์ */
  catId?: string;
}

/** ชนิดที่มีได้ครั้งเดียว (repeatable = เพิ่มซ้ำได้หลายบล็อก) */
export const HOME_BLOCK_INFO: Record<
  HomeBlockKind,
  { label: string; note: string; repeatable?: boolean }
> = {
  hero: {
    label: "แบนเนอร์ใหญ่บนสุด",
    note: "รูปแบนเนอร์กุมารทอง + ปุ่มชมวัตถุมงคล · ในนี้มีหัวข้อ H1 ของหน้าแรกอยู่ ไม่แนะนำให้ซ่อน (เสีย SEO)",
  },
  trust: { label: "แถบความน่าเชื่อถือ", note: "เปิดมาตั้งแต่ปี 2012 · พิธีจริง · ส่งทั่วโลก · LINE" },
  masters: { label: "แถวครูบาอาจารย์", note: "รูปอาจารย์เลื่อนแนวนอน (จัดลำดับที่หน้าอาจารย์)" },
  categories: { label: "หมวดหมู่วัตถุมงคล", note: "การ์ดกุมารทองใหญ่ + อีก 4 หมวด (ตั้งรูปได้ในหน้าตั้งค่า)" },
  guide: { label: "คู่มือเลี้ยงกุมารทอง (ไฮไลท์)", note: "บล็อกวิดีโอ 26 นาที ขนาดใหญ่ — ตัวชูโรงของเว็บ" },
  kumanthong: { label: "กุมารทอง ตัวดังประจำร้าน", note: "องค์เด่น 1 ใหญ่ + อีก 4 องค์" },
  others: { label: "เครื่องรางและวัตถุมงคลอื่น ๆ", note: "สินค้า 4 ชิ้นล่าสุดที่ไม่ใช่กุมารทอง/กุมารี" },
  ceremony: { label: "บริการพิธีจุดเทียน", note: "แถบแดงชาด + ปุ่มสอบถามทาง LINE" },
  lagnara: { label: "แถบดูดวง lagnara", note: "ลิงก์ออกไปเว็บดูดวงในเครือ" },
  orderSteps: { label: "วิธีสั่งบูชา 3 ขั้นตอน", note: "แถบสีงาช้าง ไทม์ไลน์ 1-2-3" },
  gallery: { label: "ภาพงานพิธีจริง", note: "อัลบั้มรูป 1 ใหญ่ + 4 เล็ก" },
  articles: { label: "บทความล่าสุด", note: "บทความเด่น 1 + รายการอีก 3" },
  katha: { label: "คาถาประจำวัน", note: "แถบสีครีม เปลี่ยนบทเองทุกวัน" },
  lineCta: { label: "แถบชวนแอด LINE ปิดท้าย", note: "ควรอยู่ล่างสุดเสมอ" },
  productRow: {
    label: "แถวสินค้าตามหมวด",
    note: "เลือกหมวดเอง โชว์ 4 ชิ้นที่ยังมีของ",
    repeatable: true,
  },
};

/** ชนิดที่เพิ่มเองได้ในแอดมิน (นอกจากนั้นมีอยู่แล้วในลิสต์ กดเปิด-ปิดเอา) */
export const ADDABLE_KINDS = HOME_BLOCK_KINDS.filter((k) => HOME_BLOCK_INFO[k].repeatable);

/** ลำดับตั้งต้น — คาถาลงไปอยู่ท้าย ๆ (คั่นด้วยบทความ ไม่ให้แถบสีอ่อนติดกับวิธีสั่งบูชา)
 *  และคู่มือเลี้ยงกุมารทองยกขึ้นมาเป็นบล็อกใหญ่ก่อนแถวสินค้ากุมารทอง */
const DEFAULT_ORDER: HomeBlockKind[] = [
  "hero",
  "trust",
  "masters",
  "categories",
  "guide",
  "kumanthong",
  "others",
  "ceremony",
  "lagnara",
  "orderSteps",
  "gallery",
  "articles",
  "katha",
  "lineCta",
];

export const DEFAULT_HOME_BLOCKS: HomeBlock[] = DEFAULT_ORDER.map((kind) => ({
  key: kind,
  kind,
  on: true,
}));

/** สร้าง key ให้บล็อกที่เพิ่มใหม่ — ชนกันไม่ได้แม้เลือกหมวดเดียวกันสองแถว */
export function newBlockKey(kind: HomeBlockKind): string {
  return `${kind}:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** ค่าที่อ่านมาจาก settings อาจเป็นของเก่า/ของเสีย — กรองให้เหลือเฉพาะที่ใช้ได้จริง
 *  แล้วเติมบล็อกชนิดเดี่ยวที่ยังไม่มีในลิสต์ (บล็อกใหม่ที่เพิ่งเพิ่มในโค้ด) ต่อท้ายแบบปิดไว้ */
export function normalizeHomeBlocks(raw: unknown): HomeBlock[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_HOME_BLOCKS;
  const seen = new Set<string>();
  const blocks: HomeBlock[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const { kind, key, on, catId } = item as Partial<HomeBlock>;
    if (!kind || !(HOME_BLOCK_KINDS as readonly string[]).includes(kind)) continue;
    const repeatable = HOME_BLOCK_INFO[kind].repeatable;
    if (repeatable && !catId) continue; // แถวสินค้าที่ไม่ได้เลือกหมวด = ใช้ไม่ได้
    const id = repeatable ? (typeof key === "string" && key ? key : newBlockKey(kind)) : kind;
    if (seen.has(id)) continue;
    seen.add(id);
    blocks.push({ key: id, kind, on: on !== false, ...(catId ? { catId } : {}) });
  }
  if (blocks.length === 0) return DEFAULT_HOME_BLOCKS;
  for (const kind of DEFAULT_ORDER) {
    if (!seen.has(kind)) blocks.push({ key: kind, kind, on: false });
  }
  return blocks;
}
