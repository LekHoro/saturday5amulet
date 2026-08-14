// ย่อรูปที่อยู่ใน storage แล้วให้เล็กลง — ทำฝั่งเบราว์เซอร์เหมือนตอนอัป (ดู watermark.ts)
// ใช้กับรูปเก่าจาก igetweb ที่ยัดมาแบบเต็มความละเอียด ทำให้หน้าเว็บโหลดช้า
// เขียนทับ path เดิมเสมอ ลิงก์รูปทุกที่ในเว็บจึงไม่เปลี่ยน

/** ด้านยาวสุดหลังย่อ — เท่ากับรูปที่อัปใหม่ (watermark.ts) จะได้มาตรฐานเดียวกันทั้งเว็บ */
export const MAX_EDGE = 1600;

/** คุณภาพ JPEG — 0.82 ตายังแยกไม่ออกจากต้นฉบับบนจอ แต่ไฟล์เล็กลงมาก */
const JPEG_QUALITY = 0.82;

export type ShrinkResult =
  | { done: true; blob: Blob; mime: string; width: number; height: number }
  | { done: false; reason: "unsupported" | "decode-failed" | "no-gain" };

/** มีพิกเซลโปร่งใสอยู่จริงไหม — png ที่ทึบทั้งใบแปลงเป็น jpg ได้ ไม่งั้นพื้นใสจะกลายเป็นดำ */
function hasTransparency(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  try {
    const { data } = ctx.getImageData(0, 0, w, h);
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true;
    }
    return false;
  } catch {
    // อ่านพิกเซลไม่ได้ (canvas โดน taint) — ถือว่ามีพื้นใสไว้ก่อน จะได้ไม่ทำรูปพัง
    return true;
  }
}

/**
 * ย่อรูปให้เล็กลง คืน blob พร้อมชนิดไฟล์ที่ควรบันทึก
 *
 * jpg → jpg เสมอ · png ทึบ → เนื้อไฟล์เป็น jpg (แคนวาสเข้ารหัส png ได้แย่กว่าต้นฉบับ
 * ย่อแล้วมักใหญ่กว่าเดิม) แต่ path เดิมที่ลงท้าย .png ไม่เปลี่ยน — เบราว์เซอร์ดูชนิดจริง
 * จาก Content-Type ที่ storage ส่งมา ไม่ได้ดูนามสกุล ลิงก์ในเว็บจึงไม่ต้องแก้สักที่
 */
export async function shrinkImage(source: Blob, mime: string): Promise<ShrinkResult> {
  if (mime !== "image/jpeg" && mime !== "image/png") return { done: false, reason: "unsupported" };

  let bitmap: ImageBitmap;
  try {
    // รูปจากมือถือเก็บทิศหมุนไว้ใน EXIF ไม่ได้หมุนพิกเซลจริง เบราว์เซอร์หมุนให้ตอนแสดงผล
    // ถ้าไม่สั่ง from-image แคนวาสจะได้พิกเซลดิบ = รูปตะแคงหลังย่อ (EXIF หายไปกับการเข้ารหัสใหม่)
    bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  } catch {
    return { done: false, reason: "decode-failed" };
  }
  if (!bitmap.width || !bitmap.height) {
    bitmap.close();
    return { done: false, reason: "decode-failed" };
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    bitmap.close();
    return { done: false, reason: "decode-failed" };
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const keepPng = mime === "image/png" && hasTransparency(ctx, w, h);
  const outMime = keepPng ? "image/png" : "image/jpeg";

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outMime, outMime === "image/jpeg" ? JPEG_QUALITY : undefined)
  );
  // เบราว์เซอร์เขียนชนิดที่ขอไม่ได้จะเงียบ ๆ คืนชนิดอื่นมาแทน — ปล่อยผ่าน ดีกว่าบันทึกผิดชนิด
  if (!blob || blob.type !== outMime) return { done: false, reason: "no-gain" };
  // รูปที่บีบมาดีอยู่แล้วอาจใหญ่ขึ้นหลังเข้ารหัสใหม่ อย่าไปทับให้แย่กว่าเดิม
  if (blob.size >= source.size) return { done: false, reason: "no-gain" };

  return { done: true, blob, mime: outMime, width: w, height: h };
}
