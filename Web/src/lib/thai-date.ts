// แปลงวันที่ไทยจากระบบเดิม ("26 กุมภาพันธ์ 2024 17:33") เป็น timestamp ไว้เรียง "ใหม่ล่าสุด"
const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export function parseThaiTimestamp(text: string | null): number {
  if (!text) return 0;
  const m = text.match(/(\d{1,2})\s+(\S+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!m) return 0;
  const month = THAI_MONTHS.indexOf(m[2]);
  if (month < 0) return 0;
  // ข้อมูลเก่าปนทั้ง ค.ศ. และ พ.ศ.
  let year = Number(m[3]);
  if (year > 2400) year -= 543;
  return Date.UTC(year, month, Number(m[1]), Number(m[4] ?? 0), Number(m[5] ?? 0));
}
