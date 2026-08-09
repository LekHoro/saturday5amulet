"use client";

export type FormLang = "th" | "en";

// สลับภาษาที่กำลังกรอกในฟอร์มหลังร้าน — ไทยคือต้นฉบับ (ต้องมี), อังกฤษเป็นคำแปลเสริม
export default function LangTabs({
  lang,
  onChange,
  hasEn,
}: {
  lang: FormLang;
  onChange: (l: FormLang) => void;
  /** กรอกคำแปลอังกฤษไว้แล้วหรือยัง — โชว์สถานะบนแท็บ */
  hasEn: boolean;
}) {
  const tabs: { key: FormLang; label: string; note: string }[] = [
    { key: "th", label: "ไทย", note: "ต้นฉบับ" },
    { key: "en", label: "English", note: hasEn ? "แปลแล้ว" : "ยังไม่ได้แปล" },
  ];

  return (
    <div className="flex gap-2 rounded-2xl border border-gold/25 bg-night-soft p-1.5">
      {tabs.map((t) => {
        const on = lang === t.key;
        return (
          <button
            key={t.key}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(t.key)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm transition ${
              on ? "bg-gold text-night" : "text-ivory hover:bg-gold/15"
            }`}
          >
            <span className="font-bold">{t.label}</span>
            <span className={`ml-2 text-xs ${on ? "text-night/70" : "text-smoke"}`}>{t.note}</span>
          </button>
        );
      })}
    </div>
  );
}
