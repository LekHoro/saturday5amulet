// POST /api/chat — ผู้ช่วยเสาร์ห้าบนเว็บ (เฟส 1)
// รับข้อความ + ประวัติจาก ChatWidget → runChat → JSON {text, cards, handoff}
// บันทึกลง Supabase (chat_turns) แบบ fail-soft: ตารางยังไม่มี/ล่ม ก็ไม่กระทบคำตอบ
import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { isLang, stripLang, type Lang } from "@/lib/i18n";
import { chatConfigured, fallbackHandoff, runChat } from "@/lib/chat/engine";
import type { ChatHistoryItem, ChatRequest, ChatResponse } from "@/lib/chat/types";

// เครื่องมือ 3–4 รอบ + ดัชนี 10k token — ให้เวลาพอบน Vercel
export const maxDuration = 60;

const MAX_MESSAGE = 600;
const MAX_HISTORY = 12;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 30;

// rate limit ต่อ IP แบบในหน่วยความจำ — ต่อ instance (พอสำหรับกันยิงรัว ไม่ใช่กำแพงจริง)
const buckets = new Map<string, { count: number; reset: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.reset < now) {
    buckets.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    }
    return false;
  }
  b.count += 1;
  return b.count > RATE_MAX;
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function parseBody(raw: unknown): ChatRequest | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const message = typeof b.message === "string" ? b.message.trim() : "";
  if (!message) return null;
  const lang: Lang = typeof b.lang === "string" && isLang(b.lang) ? b.lang : "th";
  const history: ChatHistoryItem[] = Array.isArray(b.history)
    ? b.history
        .filter(
          (h): h is ChatHistoryItem =>
            !!h && typeof h === "object" && (h.role === "user" || h.role === "assistant") && typeof h.text === "string"
        )
        .slice(-MAX_HISTORY)
        .map((h) => ({ role: h.role, text: h.text.slice(0, 1500) }))
    : [];
  const path = typeof b.path === "string" ? stripLang(b.path).slice(0, 300) : "/";
  const productId = typeof b.productId === "string" && /^\d{1,12}$/.test(b.productId) ? b.productId : null;
  const sessionId = typeof b.sessionId === "string" ? b.sessionId.slice(0, 64) : "";
  return { message: message.slice(0, MAX_MESSAGE), history, lang, path, productId, sessionId };
}

async function logTurn(
  body: ChatRequest,
  result: ChatResponse & { usage?: unknown; model?: string }
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon || !body.sessionId) return;
  try {
    const sb = createClient(url, anon, { auth: { persistSession: false } });
    const { error } = await sb.rpc("log_chat_turn", {
      p_session: body.sessionId,
      p_channel: "web",
      p_lang: body.lang,
      p_page: body.path,
      p_question: body.message,
      p_answer: result.text,
      p_cards: result.cards.map((c) => ({ kind: c.kind, id: c.id, title: c.title })),
      p_handoff: result.handoff ? { reason: result.handoff.reason, topic: result.handoff.topic, summary: result.handoff.summary } : null,
      p_usage: result.usage ? { ...(result.usage as object), model: result.model } : null,
    });
    if (error) console.error("[chat] log failed:", error.message);
  } catch (err) {
    console.error("[chat] log failed:", err);
  }
}

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const body = parseBody(raw);
  if (!body) return NextResponse.json({ error: "bad request" }, { status: 400 });

  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  // ยังไม่ตั้ง ANTHROPIC_API_KEY (dev/preview) — ตอบให้ widget ยังใช้งานได้ โดยส่งต่อ LINE ทันที
  if (!chatConfigured()) {
    const handoff = fallbackHandoff(body, body.lang);
    const res: ChatResponse = {
      text:
        body.lang === "en"
          ? "The assistant isn't available right now. Please send your question to the admin on LINE."
          : "ตอนนี้ผู้ช่วยยังไม่พร้อมให้บริการค่ะ ส่งคำถามให้แอดมินทาง LINE ได้เลยค่ะ",
      cards: [],
      handoff,
    };
    return NextResponse.json(res);
  }

  try {
    const result = await runChat(body);
    const res: ChatResponse = { text: result.text, cards: result.cards, handoff: result.handoff };
    await logTurn(body, result);
    return NextResponse.json(res);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      console.error("[chat] anthropic rate limited");
    } else if (err instanceof Anthropic.APIError) {
      console.error(`[chat] anthropic error ${err.status}:`, err.message);
    } else {
      console.error("[chat] failed:", err);
    }
    const handoff = fallbackHandoff(body, body.lang);
    const res: ChatResponse = {
      text:
        body.lang === "en"
          ? "Sorry, something went wrong on my side. You can send this to the admin on LINE instead."
          : "ขออภัยค่ะ ระบบขัดข้องชั่วคราว ส่งคำถามให้แอดมินทาง LINE แทนได้เลยค่ะ",
      cards: [],
      handoff,
    };
    return NextResponse.json(res, { status: 200 });
  }
}
