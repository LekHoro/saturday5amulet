export const LINE_ID = "@saturday5amulet";

// Opens Line chat with the shop, prefilled with a message
export function lineChatUrl(message?: string): string {
  const id = encodeURIComponent(LINE_ID);
  if (message) {
    return `https://line.me/R/oaMessage/${id}/?${encodeURIComponent(message)}`;
  }
  return `https://line.me/R/ti/p/${id}`;
}

export function productInquiryUrl(title: string): string {
  return lineChatUrl(`สนใจสั่งบูชา: ${title}`);
}

// สำหรับรุ่นที่หมดแล้ว — ขอให้แจ้งเมื่อมีรุ่นใหม่/องค์ใหม่เข้า
export function productNotifyUrl(title: string): string {
  return lineChatUrl(`รุ่นนี้หมดแล้ว รบกวนแจ้งเมื่อมีเข้าใหม่: ${title}`);
}
