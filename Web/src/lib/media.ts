import { absoluteUrl } from "./seo";

/** แยกรูป/วิดีโอจาก URL ใน storage — คอลัมน์ images เก็บปนกันได้ วิดีโอดูจากนามสกุลไฟล์ */
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;

export function isVideoUrl(url: string): boolean {
  return VIDEO_EXT.test(url);
}

/** รูปปกของสินค้า = รูปนิ่งรูปแรก (ข้ามวิดีโอ) — ใช้กับการ์ด, OG image, thumbnail หลังร้าน */
export function coverImage(images: string[] | null | undefined): string | undefined {
  return images?.find((u) => !isVideoUrl(u));
}

/** รูปที่ฝังอยู่ในเนื้อหา html (สินค้า/บทความเก่าจาก igetweb แทรกรูปไว้ในคำอธิบาย) */
function htmlImages(html: string | null | undefined): string[] {
  if (!html) return [];
  const urls: string[] = [];
  for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    const url = m[1];
    if (!isVideoUrl(url) && !urls.includes(url)) urls.push(url);
  }
  return urls;
}

/** รูปนิ่งสำหรับ JSON-LD — Google ถือว่า "image" เป็นช่องบังคับของข้อมูลผู้ขาย
 *  ของเก่าบางชิ้นไม่มีรูปในคอลัมน์ images แต่มีรูปฝังในคำอธิบาย จึงถอยไปใช้รูปนั้น
 *  ไม่มีจริง ๆ คืน undefined ให้ตัดช่องทิ้ง ดีกว่าส่ง "image":[] ที่ผิดสเปก */
export function schemaImages(
  images: string[] | null | undefined,
  html?: string | null
): string[] | undefined {
  const still = (images ?? []).filter((u) => !isVideoUrl(u));
  const list = still.length ? still : htmlImages(html);
  return list.length ? list.map(absoluteUrl) : undefined;
}
