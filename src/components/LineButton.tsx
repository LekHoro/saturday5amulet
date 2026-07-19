import { lineChatUrl } from "@/lib/line";

function LineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C6.48 2 2 5.64 2 10.13c0 4.03 3.58 7.4 8.42 8.04.33.07.77.22.89.5.1.26.07.66.03.92l-.14.86c-.04.26-.2 1.02.89.56 1.1-.47 5.92-3.49 8.08-5.97C21.66 13.4 22 11.83 22 10.13 22 5.64 17.52 2 12 2zM7.9 12.8H5.87a.53.53 0 0 1-.53-.53V8.2a.53.53 0 0 1 1.06 0v3.54H7.9a.53.53 0 0 1 0 1.06zm1.9-.53a.53.53 0 0 1-1.06 0V8.2a.53.53 0 0 1 1.06 0v4.07zm4.9 0a.53.53 0 0 1-.36.5.54.54 0 0 1-.6-.17l-2.08-2.83v2.5a.53.53 0 0 1-1.06 0V8.2a.53.53 0 0 1 .96-.32l2.08 2.84V8.2a.53.53 0 0 1 1.06 0v4.07zm3.32-2.57a.53.53 0 0 1 0 1.06h-1.5v.98h1.5a.53.53 0 0 1 0 1.06h-2.03a.53.53 0 0 1-.53-.53V8.2c0-.29.24-.53.53-.53h2.03a.53.53 0 0 1 0 1.06h-1.5v.97h1.5z" />
    </svg>
  );
}

export function FloatingLineButton() {
  return (
    <a
      href={lineChatUrl("สวัสดีครับ/ค่ะ สนใจสอบถามวัตถุมงคล")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-line-green px-5 py-3 text-white shadow-lg shadow-black/30 transition hover:scale-105"
      aria-label="ทัก Line สอบถาม"
    >
      <LineIcon className="h-6 w-6" />
      <span className="font-semibold">สอบถาม / สั่งบูชา</span>
    </a>
  );
}

export function LineInquiryButton({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-line-green px-6 py-4 text-lg font-bold text-white shadow-md transition hover:brightness-110 sm:w-auto"
    >
      <LineIcon className="h-6 w-6" />
      {label}
    </a>
  );
}
