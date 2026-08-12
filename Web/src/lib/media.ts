/** แยกรูป/วิดีโอจาก URL ใน storage — คอลัมน์ images เก็บปนกันได้ วิดีโอดูจากนามสกุลไฟล์ */
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;

export function isVideoUrl(url: string): boolean {
  return VIDEO_EXT.test(url);
}

/** รูปปกของสินค้า = รูปนิ่งรูปแรก (ข้ามวิดีโอ) — ใช้กับการ์ด, OG image, thumbnail หลังร้าน */
export function coverImage(images: string[] | null | undefined): string | undefined {
  return images?.find((u) => !isVideoUrl(u));
}
