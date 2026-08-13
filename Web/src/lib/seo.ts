export const SITE_URL = "https://www.saturday5amulet.com";
export const SITE_NAME = "เสาร์๕มหานิยม (Saturday5Amulet)";

/** JSON-LD รับแต่ URL เต็ม — รูปบางอย่าง (เช่นรูปอาจารย์ใน public/) เป็น path ขึ้นต้นด้วย / */
export function absoluteUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${SITE_URL}${path}`;
}

/** เส้นทางหน้าให้ Google โชว์แทน URL ดิบในผลค้นหา
 *  ขั้นสุดท้าย = หน้าปัจจุบัน ไม่ต้องมี path (ตามสเปก breadcrumb ของ Google)
 *  path ที่ส่งมาต้องผ่าน href() มาแล้ว จะได้มี /en ของหน้าอังกฤษติดมาด้วย */
export function breadcrumbJsonLd(trail: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      ...(crumb.path ? { item: absoluteUrl(crumb.path) } : {}),
    })),
  };
}

/** รายการของในหน้ารวม — บอก Google ว่าหน้านี้คือลิสต์ ไม่ใช่เนื้อหาชิ้นเดียว */
export function itemListJsonLd(name: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

/** ความยาวคำโปรยที่ Google แสดงในผลค้นหา — ยาวกว่านี้โดนตัดกลางคัน */
const DESCRIPTION_MAX = 155;

// igetweb ใส่ meta description ประโยคนี้ให้ทุกหน้าเหมือนกันหมด (สินค้า 81/140, บทความ 17/36)
// ถือว่าเป็นค่าว่าง จะได้ตกไปใช้เนื้อหาจริงของหน้านั้น ไม่ให้คำโปรยในผลค้นหาซ้ำกันทั้งเว็บ
const BOILERPLATE_DESCRIPTION =
  "เสาร์๕มหานิยม แนะนำวิธีแก้ดวง เคล็ดลับเสริมดวงชะตา มูเตลูแบบไหน ปัง รวย เสริมเสน่ห์ กุมารทอง";

// หัวข้อที่ igetweb แปะไว้หน้าเนื้อหาสินค้าทุกชิ้น — กินโควตา 155 ตัวแรกเปล่า ๆ
const LEADING_LABEL = /^(รายละเอียดสินค้า|Product Description)\s*/i;

/** คำโปรยแรกที่ใช้ได้จริงตามลำดับที่ส่งมา ตัดให้พอดีผลค้นหา */
export function metaDescription(
  ...candidates: (string | null | undefined)[]
): string | undefined {
  for (const candidate of candidates) {
    const text = candidate
      ?.replace(LEADING_LABEL, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!text || text === BOILERPLATE_DESCRIPTION) continue;
    return text.length > DESCRIPTION_MAX
      ? `${text.slice(0, DESCRIPTION_MAX).trimEnd()}…`
      : text;
  }
  return undefined;
}
