export const LINE_ID = "@sat589";

// ลิงก์เพิ่มเพื่อนทางการจาก LINE OA Manager — ใช้แทน line.me/R/ti/p เพราะผูกกับบัญชีตรง ๆ
export const ADD_FRIEND_URL = "https://lin.ee/w3Je6l2";

// Opens Line chat with the shop, prefilled with a message
export function lineChatUrl(message?: string): string {
  if (message) {
    const id = encodeURIComponent(LINE_ID);
    return `https://line.me/R/oaMessage/${id}/?${encodeURIComponent(message)}`;
  }
  return ADD_FRIEND_URL;
}

export function productInquiryUrl(title: string): string {
  return lineChatUrl(`สนใจสั่งบูชา: ${title}`);
}

// สำหรับรุ่นที่หมดแล้ว — ขอให้แจ้งเมื่อมีรุ่นใหม่/องค์ใหม่เข้า
export function productNotifyUrl(title: string): string {
  return lineChatUrl(`รุ่นนี้หมดแล้ว รบกวนแจ้งเมื่อมีเข้าใหม่: ${title}`);
}
