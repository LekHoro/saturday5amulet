import QRCode from "qrcode";
import { LINE_ID, lineChatUrl } from "@/lib/line";
import { YOUTUBE_CHANNEL } from "@/lib/data";

/* ไอคอนโซเชียลเส้น 2px โทนเดียวกับชุดใน icons.tsx */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
      <path d="m10.5 9.5 4.5 2.5-4.5 2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14.5 4h-2A3.5 3.5 0 0 0 9 7.5V10H6.5v3H9v7h3v-7h2.5l.5-3H12V7.8c0-.5.4-.8.9-.8h1.6z" />
    </svg>
  );
}

const SOCIALS = [
  { label: "Instagram", handle: "saturday5amulet", href: "https://www.instagram.com/saturday5amulet", Icon: InstagramIcon },
  { label: "YouTube", handle: "saturday5amulet", href: YOUTUBE_CHANNEL, Icon: YoutubeIcon },
  { label: "Facebook", handle: "saturday5amulet.thailand", href: "https://www.facebook.com/saturday5amulet.thailand", Icon: FacebookIcon },
];

/**
 * บล็อกเพิ่มเพื่อน Line + ช่องทางร้าน — แทนแบนเนอร์ Add-Friend JPEG ยุค igetweb
 * QR สร้างเป็น SVG ตอน build ชี้ไปหน้าเพิ่มเพื่อนของร้านโดยตรง
 */
export default async function LineQrBlock() {
  const addFriendUrl = lineChatUrl();
  // ต้องคงพื้นขาว/โมดูลเข้มไว้ให้กล้องอ่านได้ — ห้ามย้อมเป็นโทนทอง
  const qrSvg = await QRCode.toString(addFriendUrl, {
    type: "svg",
    margin: 0,
    color: { dark: "#101014", light: "#ffffff" },
  });

  return (
    <div className="rounded-2xl border border-gold/25 bg-night-soft/60 p-5 sm:p-6">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <a
          href={addFriendUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`สแกนหรือกดเพื่อเพิ่มเพื่อน Line ${LINE_ID}`}
          className="shrink-0 rounded-xl bg-white p-3 shadow-md shadow-black/30 transition hover:scale-[1.03]"
        >
          <div className="h-28 w-28" dangerouslySetInnerHTML={{ __html: qrSvg }} />
        </a>

        <div className="min-w-0">
          <h2 className="font-heading text-lg font-bold text-ivory">
            เพิ่มเพื่อน Line ร้าน
          </h2>
          <p className="mt-0.5 font-heading text-2xl font-bold text-gold">{LINE_ID}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-smoke">
            สแกน QR หรือกดปุ่มเพิ่มเพื่อน — สอบถาม เช็คสถานะจัดส่ง
            หรือรับข่าวรุ่นใหม่ก่อนใครได้ทางแชทเดียว
          </p>
          <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2">
            {SOCIALS.map(({ label, handle, href, Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-smoke transition hover:text-gold-light"
              >
                <Icon className="h-4 w-4 shrink-0 text-gold" />
                <span className="sr-only">{label} </span>
                {handle}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
