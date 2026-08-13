// ลายน้ำ LINE OA ลงมุมขวาล่างของรูปสินค้า ทำฝั่งเบราว์เซอร์ก่อนอัปขึ้น Supabase
// (เว็บไม่มี API route ให้ประมวลผลฝั่ง server และรูปอัปตรงจาก client อยู่แล้ว)

const WATERMARK_TEXT = "LINE @sat589";

/** ย่อด้านยาวสุดไม่ให้เกินเท่านี้ — รูปมาตรฐาน 1080×1350 จะไม่โดนย่อ แต่รูปจากมือถือ 4000px จะเบาลงมาก */
const MAX_EDGE = 1600;

/** ไฟล์ที่แตะได้: รูปนิ่งเท่านั้น — วิดีโอกับ gif (เสียอนิเมชัน) ปล่อยผ่าน */
export function canWatermark(file: File): boolean {
  return file.type.startsWith("image/") && file.type !== "image/gif";
}

/**
 * คืนไฟล์ใหม่ที่ย่อขนาดแล้วและมีลายน้ำมุมขวาล่าง
 * ถ้าเบราว์เซอร์ทำไม่ได้ (decode พัง / ไม่มี canvas) จะคืนไฟล์เดิมแทน — อัปโหลดต้องไม่ล้มเพราะลายน้ำ
 */
export async function watermarkImage(file: File): Promise<File> {
  if (!canWatermark(file)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    // ขนาดตัวอักษรอิงความกว้างรูป ลายน้ำจะได้ดูเท่ากันทุกรูปไม่ว่ารูปใหญ่เล็ก
    const fontSize = Math.max(14, Math.round(w * 0.032));
    const pad = Math.round(w * 0.03);
    ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, "Helvetica Neue", sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    // เงาดำจาง ๆ ให้ตัวอักษรขาวอ่านออกแม้รูปพื้นสว่าง
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = Math.round(fontSize * 0.35);
    ctx.fillStyle = "rgba(255,255,255,0.62)";
    ctx.fillText(WATERMARK_TEXT, w - pad, h - pad);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.9)
    );
    if (!blob) return file;
    const base = file.name.replace(/\.[^.]+$/, "");
    // นามสกุลต้องตรงกับชนิดจริง เพราะ path ที่อัปขึ้น storage ตัดมาจากชื่อไฟล์
    // (เบราว์เซอร์ที่ยังเขียน webp ไม่ได้จะคืน png มาแทนเงียบ ๆ จึงอ่านจาก blob.type)
    const ext = blob.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    return new File([blob], `${base}.${ext}`, { type: blob.type });
  } catch {
    return file;
  }
}
