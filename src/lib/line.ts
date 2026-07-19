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
