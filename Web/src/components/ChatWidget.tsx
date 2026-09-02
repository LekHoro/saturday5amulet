"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import LineLink from "./LineLink";
import { lineChatUrl } from "@/lib/line";
import { getDict, stripLang, type Lang } from "@/lib/i18n";
import type { ChatCard, ChatHandoff, ChatHistoryItem, ChatResponse } from "@/lib/chat/types";

/**
 * ผู้ช่วยเสาร์ห้า — ปุ่มลอยมุมขวาล่าง + แผงแชท (เฟส 1: บอทบนเว็บ, ส่งต่อ LINE ด้วยข้อความสรุป)
 * แทนที่ FloatingLineButton เดิม: ปุ่มลอยเหลือปุ่มเดียว ส่วน LINE ย้ายไปอยู่หัวแชทและในการ์ดสินค้า
 * หน้าสินค้าไม่มีปุ่มลอย (มี buy-bar อยู่แล้ว) — เปิดแชทผ่าน ChatOpenButton ที่ยิง event แทน
 */

const STORAGE_KEY = "s5chat:v1";
const OPEN_EVENT = "s5chat:open";
const MAX_STORED = 40;

interface Msg {
  id: string;
  role: "user" | "assistant";
  text: string;
  cards?: ChatCard[];
  handoff?: ChatHandoff | null;
  error?: boolean;
}

function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function loadState(): { sessionId: string; messages: Msg[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && typeof s.sessionId === "string" && Array.isArray(s.messages)) {
        return { sessionId: s.sessionId, messages: s.messages.slice(-MAX_STORED) };
      }
    }
  } catch {
    // localStorage ปิดอยู่/ข้อมูลพัง — เริ่มใหม่
  }
  return { sessionId: newId() + newId(), messages: [] };
}

/** เปิดแผงแชทจากที่อื่น (เช่นปุ่ม "ถามผู้ช่วยเกี่ยวกับรุ่นนี้" ในหน้าสินค้า) */
export function openChat() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12Z" />
      <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
    </svg>
  );
}

function LineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.48 2 2 5.64 2 10.13c0 4.03 3.58 7.4 8.42 8.04.33.07.77.22.89.5.1.26.07.66.03.92l-.14.86c-.04.26-.2 1.02.89.56 1.1-.47 5.92-3.49 8.08-5.97C21.66 13.4 22 11.83 22 10.13 22 5.64 17.52 2 12 2z" />
    </svg>
  );
}

/** ปุ่มเปิดแชทสำหรับหน้าสินค้า — text ใน buy box (จอใหญ่), icon ใน buy-bar (มือถือ) */
export function ChatOpenButton({ lang, variant }: { lang: Lang; variant: "text" | "icon" }) {
  const t = getDict(lang);
  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={openChat}
        aria-label={t.chat.askAboutShort}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/40 text-gold-light transition hover:border-gold hover:bg-gold/10"
      >
        <ChatIcon className="h-5 w-5" />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={openChat}
      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-light transition hover:text-gold hover:underline"
    >
      <ChatIcon className="h-4 w-4" />
      {t.chat.askAbout}
    </button>
  );
}

function CardView({ card, lang }: { card: ChatCard; lang: Lang }) {
  const t = getDict(lang);
  const primary =
    card.kind === "product"
      ? t.chat.viewProduct
      : card.kind === "article"
        ? t.chat.readArticle
        : card.kind === "master"
          ? t.chat.viewMaster
          : t.chat.openPage;
  const primaryClass =
    "inline-flex items-center rounded-lg bg-gold px-3 py-1.5 font-heading text-xs font-semibold text-night transition hover:brightness-110";
  return (
    <div className="max-w-[92%] overflow-hidden rounded-2xl border border-gold/30 bg-night-soft">
      <div className="flex gap-3 p-3">
        {card.image && (
          <div className="relative h-[70px] w-14 shrink-0 overflow-hidden rounded-lg bg-night">
            <Image src={card.image} alt="" fill sizes="56px" className="object-cover" />
          </div>
        )}
        <div className="min-w-0">
          {card.status && (
            <span
              className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${
                card.status === "soldout" ? "bg-ember/20 text-ember" : "bg-gold/20 text-gold-light"
              }`}
            >
              {card.status === "soldout" ? t.chat.soldOut : t.chat.available}
            </span>
          )}
          <div className="font-heading text-sm font-semibold leading-snug text-ivory">{card.title}</div>
          {card.subtitle && <div className="mt-0.5 text-xs text-gold-light">{card.subtitle}</div>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 px-3 pb-3">
        {card.external ? (
          <a href={card.href} target="_blank" rel="noopener noreferrer" className={primaryClass}>
            {primary}
          </a>
        ) : (
          <Link href={card.href} className={primaryClass}>
            {primary}
          </Link>
        )}
        {card.lineUrl && (
          <LineLink
            href={card.lineUrl}
            lang={lang}
            className="inline-flex items-center gap-1.5 rounded-lg bg-line-green px-3 py-1.5 font-heading text-xs font-semibold text-white transition hover:brightness-110"
          >
            <LineIcon className="h-3.5 w-3.5" />
            {card.lineAction === "notify" ? t.chat.notifyLine : t.chat.orderLine}
          </LineLink>
        )}
      </div>
    </div>
  );
}

function HandoffView({ handoff, lang }: { handoff: ChatHandoff; lang: Lang }) {
  const t = getDict(lang);
  return (
    <div className="w-full rounded-2xl border border-line-green/40 bg-gradient-to-b from-line-green/10 to-transparent p-3">
      <div className="flex items-center gap-1.5 font-heading text-sm font-semibold text-[#7fe0a6]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="8" r="4" />
        </svg>
        {t.chat.handoffTitle}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-ivory/80">{t.chat.handoffHint}</p>
      <div className="mt-2 whitespace-pre-line rounded-lg border-l-2 border-gold bg-black/30 px-2.5 py-2 text-[11.5px] leading-relaxed text-smoke">
        {handoff.topic}
        {"\n"}
        {handoff.summary}
      </div>
      {!handoff.adminOnDuty && <p className="mt-1.5 text-[11px] text-smoke">{t.chat.adminHours}</p>}
      <LineLink
        href={handoff.lineUrl}
        lang={lang}
        className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-line-green px-3.5 py-2 font-heading text-xs font-bold text-white transition hover:brightness-110"
      >
        <LineIcon className="h-4 w-4" />
        {t.chat.handoffButton}
      </LineLink>
    </div>
  );
}

export default function ChatWidget({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const pathname = usePathname();
  const path = stripLang(pathname);
  const productId = path.match(/^\/products\/(\d+)/)?.[1] ?? null;
  // หน้า "วิธีสั่งบูชา" มี CTA ของ LINE เต็มหน้า, หน้าสินค้ามี buy-bar ติดขอบล่าง — ไม่ต้องมีปุ่มลอย
  const hideFab = path === "/how-to-order" || productId !== null;

  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [pending, setPending] = useState(false);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, messages: messages.slice(-MAX_STORED) }));
    } catch {
      // เต็ม/ปิดอยู่ — ไม่เป็นไร
    }
  }, [loaded, sessionId, messages]);

  // ปุ่มลอยหดเหลือไอคอนบนมือถือเมื่อเริ่มเลื่อน (เหมือนปุ่ม LINE เดิม) — ไม่บังราคาการ์ด
  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // โหลดแชทเดิมจากเครื่องตอนกดเปิดครั้งแรก (ไม่โหลดตอน render/effect — กัน hydration mismatch)
  const doOpen = useCallback(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      const s = loadState();
      setSessionId(s.sessionId);
      setMessages(s.messages);
      setLoaded(true);
    }
    setOpen(true);
    sendGAEvent("event", "chat_open", { page_path: window.location.pathname });
  }, []);

  useEffect(() => {
    const handler = () => doOpen();
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, [doOpen]);

  // เปิดแผง: โฟกัสช่องพิมพ์, ล็อกสกรอลล์หน้าบนมือถือ (แผงเต็มจอ), Esc ปิด
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 250);
    const mobile = window.matchMedia("(max-width: 639px)").matches;
    const prevOverflow = document.body.style.overflow;
    if (mobile) document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, messages, pending]);

  const close = () => {
    setOpen(false);
    fabRef.current?.focus();
  };

  const restart = () => {
    setMessages([]);
    setSessionId(newId() + newId());
  };

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || pending) return;
      const history: ChatHistoryItem[] = messages
        .filter((m) => !m.error)
        .slice(-10)
        .map((m) => ({ role: m.role, text: m.text }));
      setMessages((prev) => [...prev, { id: newId(), role: "user", text: trimmed }]);
      setInput("");
      setPending(true);
      sendGAEvent("event", "chat_message", { page_path: window.location.pathname });
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history, lang, path, productId, sessionId }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ChatResponse;
        setMessages((prev) => [
          ...prev,
          { id: newId(), role: "assistant", text: data.text, cards: data.cards ?? [], handoff: data.handoff ?? null },
        ]);
        if (data.handoff) {
          sendGAEvent("event", "chat_handoff", { reason: data.handoff.reason, page_path: window.location.pathname });
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "assistant",
            text: t.chat.error,
            error: true,
            handoff: {
              reason: "other",
              topic: t.chat.talkToAdmin,
              summary: trimmed,
              lineUrl: lineChatUrl(`${t.chat.adminGreeting}\n${trimmed}`),
              adminOnDuty: true,
            },
          },
        ]);
      } finally {
        setPending(false);
      }
    },
    [messages, pending, lang, path, productId, sessionId, t]
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.text;
  const adminUrl = lineChatUrl(lastUser ? `${t.chat.adminGreeting}\n${lastUser.slice(0, 200)}` : t.chat.adminGreeting);
  const chips = messages.length === 0 ? (productId ? t.chat.productChips : t.chat.chips) : [];

  return (
    <>
      {!hideFab && !open && (
        <button
          ref={fabRef}
          type="button"
          onClick={doOpen}
          aria-label={t.chat.fabAria}
          className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-50 flex items-center rounded-full bg-gold font-heading font-semibold text-night shadow-lg shadow-black/40 ring-4 ring-gold/20 transition-all hover:scale-105 ${
            collapsed ? "gap-0 p-3.5 sm:gap-2 sm:px-5 sm:py-3" : "gap-2 px-5 py-3"
          }`}
        >
          <ChatIcon className="h-6 w-6" />
          <span className={`whitespace-nowrap ${collapsed ? "hidden sm:inline" : ""}`}>{t.chat.fabLabel}</span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.chat.title}
          className="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] flex-col rounded-t-3xl border border-gold/25 bg-night shadow-2xl shadow-black/60 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[600px] sm:max-h-[85vh] sm:w-[380px] sm:rounded-3xl"
        >
          {/* หัวแชท — ชื่อ, บอกชัดว่าเป็นบอท, ปุ่มไป LINE ตรง, เริ่มใหม่, ปิด */}
          <div className="flex items-center gap-2.5 rounded-t-3xl border-b border-gold/20 bg-night-soft px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold font-heading text-sm font-bold text-night">
              ๕
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-heading text-sm font-semibold text-ivory">{t.chat.title}</div>
              <div className="flex items-center gap-1.5 truncate text-[11px] text-smoke">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                {t.chat.subtitle}
              </div>
            </div>
            <LineLink
              href={adminUrl}
              lang={lang}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-line-green px-2.5 py-1.5 text-[11.5px] font-semibold text-white transition hover:brightness-110"
            >
              <LineIcon className="h-3.5 w-3.5" />
              {t.chat.talkToAdmin}
            </LineLink>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={restart}
                aria-label={t.chat.restart}
                title={t.chat.restart}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gold/30 text-ivory transition hover:border-gold hover:text-gold-light"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                  <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={close}
              aria-label={t.chat.close}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gold/30 text-ivory transition hover:border-gold hover:text-gold-light"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          {/* ข้อความ */}
          <div ref={listRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 py-3" aria-live="polite">
            <div className="max-w-[86%] self-start rounded-2xl rounded-bl-md border border-gold/20 bg-brown-gold px-3 py-2 text-[13.5px] leading-relaxed text-ivory">
              {t.chat.greeting}
            </div>
            {messages.map((m) =>
              m.role === "user" ? (
                <div
                  key={m.id}
                  className="max-w-[86%] self-end whitespace-pre-line rounded-2xl rounded-br-md bg-crimson px-3 py-2 text-[13.5px] leading-relaxed text-white"
                >
                  {m.text}
                </div>
              ) : (
                <div key={m.id} className="flex flex-col gap-2">
                  <div className="max-w-[86%] self-start whitespace-pre-line rounded-2xl rounded-bl-md border border-gold/20 bg-brown-gold px-3 py-2 text-[13.5px] leading-relaxed text-ivory">
                    {m.text}
                  </div>
                  {m.cards?.map((c) => (
                    <CardView key={`${c.kind}:${c.id}`} card={c} lang={lang} />
                  ))}
                  {m.handoff && <HandoffView handoff={m.handoff} lang={lang} />}
                </div>
              )
            )}
            {pending && (
              <div className="flex items-center gap-1 self-start rounded-2xl rounded-bl-md border border-gold/20 bg-brown-gold px-3.5 py-2.5" aria-label={t.chat.typing}>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-light" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-light [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-light [animation-delay:300ms]" />
              </div>
            )}
          </div>

          {/* ชิปคำถามตั้งต้น — โชว์เฉพาะตอนยังไม่ได้คุย */}
          {chips.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto px-3 pb-1.5 [scrollbar-width:none]">
              {chips.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => void send(c)}
                  disabled={pending}
                  className="shrink-0 rounded-full border border-gold/40 px-3 py-1.5 text-xs text-ivory transition hover:border-gold hover:text-gold-light disabled:opacity-50"
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-gold/15 px-3 pt-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chat.placeholder}
              maxLength={600}
              autoComplete="off"
              className="min-w-0 flex-1 rounded-xl border border-gold/25 bg-night-soft px-3 py-2.5 text-[13.5px] text-ivory placeholder:text-smoke focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label={t.chat.send}
              className="flex w-11 shrink-0 items-center justify-center rounded-xl bg-gold text-night transition hover:brightness-110 disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
          <p className="px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1.5 text-center text-[10.5px] text-smoke">
            {t.chat.disclaimer}
          </p>
        </div>
      )}
    </>
  );
}
