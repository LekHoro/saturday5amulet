// ชุดไอคอนลายเส้นของเว็บ — น้ำหนักเส้นเดียวกันทั้งชุด (stroke 1.8 ปลายมน) สีตาม currentColor
// ใช้แทนอีโมจิทุกจุด ให้เข้าโทน "หอพระในโรงแรมหรู" (ดำอมม่วง + ทอง)
import type { ReactNode } from "react";

function Icon({ children, className = "h-6 w-6" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** กุมารทอง — เด็กไว้จุกเดียวกลางหัว */
export function KumanthongIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="4.2" r="1.7" />
      <circle cx="12" cy="10.6" r="4.3" />
      <path d="M5 20.5c.8-3.6 3.4-5.5 7-5.5s6.2 1.9 7 5.5" />
    </Icon>
  );
}

/** น้องกุมารี — เด็กหญิงไว้จุกคู่ */
export function KumareeIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <circle cx="7.6" cy="4.8" r="1.6" />
      <circle cx="16.4" cy="4.8" r="1.6" />
      <circle cx="12" cy="10.6" r="4.3" />
      <path d="M5 20.5c.8-3.6 3.4-5.5 7-5.5s6.2 1.9 7 5.5" />
    </Icon>
  );
}

/** โชคลาภ — ถุงทรัพย์ */
export function FortuneBagIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M9.8 7.2 8.4 4h7.2l-1.4 3.2" />
      <path d="M9.8 7.2h4.4c2.6 2.1 3.9 4.4 3.9 6.7a6.1 6.1 0 0 1-12.2 0c0-2.3 1.3-4.6 3.9-6.7Z" />
      <path d="M12 11.2v5M10.2 12.9h3.6" />
    </Icon>
  );
}

/** มหาเสน่ห์ — หัวใจ + ประกาย */
export function CharmHeartIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M12 19.5 6.3 13.9a4.2 4.2 0 0 1 5.7-6.1 4.2 4.2 0 0 1 5.7 6.1L12 19.5Z" />
      <path d="M19.5 3v3M18 4.5h3" />
    </Icon>
  );
}

/** เสริมดวง สะเดาะเคราะห์ — ประกายดาว */
export function SparkleIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M11 3.5c.7 3.5 2.7 5.5 6.2 6.2-3.5.7-5.5 2.7-6.2 6.2-.7-3.5-2.7-5.5-6.2-6.2 3.5-.7 5.5-2.7 6.2-6.2Z" />
      <path d="M18.5 15.5v4M16.5 17.5h4" />
    </Icon>
  );
}

/** ค้นหา/เลือกชม */
export function SearchIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  );
}

/** แชทสอบถาม */
export function ChatIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12Z" />
      <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
    </Icon>
  );
}

/** จัดส่งพัสดุ */
export function PackageIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M12 3 4.5 7v10L12 21l7.5-4V7L12 3Z" />
      <path d="m4.5 7 7.5 4 7.5-4M12 11v10" />
    </Icon>
  );
}

/** fallback รูปที่หายไป — โมโนแกรม "๕" จาง ๆ แทนกล่องว่าง (ใช้ตัวอักษรจริง ไม่ใช่อีโมจิ) */
export function ImageFallback({ className = "text-3xl" }: { className?: string }) {
  return (
    <div aria-hidden className="flex h-full w-full items-center justify-center">
      <span className={`font-heading font-bold text-gold/25 ${className}`}>๕</span>
    </div>
  );
}
