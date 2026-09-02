// ชนิดข้อมูลที่แชทบอทส่งระหว่าง /api/chat กับ ChatWidget — ไฟล์นี้ต้อง import ได้จากฝั่ง client
// (ห้าม import supabase/anthropic/db ที่นี่)

export type ChatRole = "user" | "assistant";

export interface ChatHistoryItem {
  role: ChatRole;
  text: string;
}

export interface ChatRequest {
  message: string;
  history: ChatHistoryItem[];
  lang: "th" | "en";
  /** path ไม่มี locale เช่น /products/546154-กุมารทอง */
  path: string;
  productId?: string | null;
  sessionId: string;
}

export type ChatCardKind = "product" | "article" | "master" | "page";

export interface ChatCard {
  kind: ChatCardKind;
  id: string;
  title: string;
  /** ราคา / หมวด / คำโปรยสั้น */
  subtitle?: string | null;
  status?: "available" | "soldout" | null;
  image?: string | null;
  /** ลิงก์ในเว็บ (มี /en แล้วถ้าเป็นอังกฤษ) หรือลิงก์ภายนอก (lagnara) */
  href: string;
  external?: boolean;
  /** ปุ่ม LINE ประกอบการ์ดสินค้า — สั่งบูชา / แจ้งเมื่อมีเข้าใหม่ */
  lineUrl?: string | null;
  lineAction?: "order" | "notify" | null;
}

export type HandoffReason =
  | "payment"
  | "reservation"
  | "pricing"
  | "shipping_issue"
  | "complaint"
  | "sensitive"
  | "unknown"
  | "user_request"
  | "other";

export interface ChatHandoff {
  reason: HandoffReason;
  topic: string;
  /** สรุปภาษาไทยที่บอทเขียนให้แอดมิน (แสดงให้ลูกค้าเห็นด้วย) */
  summary: string;
  /** ลิงก์เปิด LINE พร้อมข้อความสรุป */
  lineUrl: string;
  /** แอดมินอยู่ในเวลาทำการ (10:00–22:00 เวลาไทย) ตอนที่ส่งต่อหรือไม่ */
  adminOnDuty: boolean;
}

export interface ChatResponse {
  text: string;
  cards: ChatCard[];
  handoff: ChatHandoff | null;
}
