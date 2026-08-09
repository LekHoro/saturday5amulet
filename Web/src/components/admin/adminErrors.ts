// แปลงข้อความ error ทางเทคนิค (ส่วนใหญ่เป็นอังกฤษจาก Supabase) เป็นไทยที่บอกทางแก้
// verb = คำกริยาของงานที่ทำอยู่ เช่น "บันทึก" / "อัปโหลด" / "ลบ"
export function thaiError(message: string, verb: string): string {
  const m = message.toLowerCase();
  if (m.includes("fetch") || m.includes("network") || m.includes("timeout")) {
    return `การเชื่อมต่อขัดข้อง — ตรวจสัญญาณอินเทอร์เน็ตแล้วกด${verb}อีกครั้ง (ข้อมูลที่พิมพ์ยังอยู่ครบ)`;
  }
  if (
    m.includes("jwt") ||
    m.includes("token") ||
    m.includes("session") ||
    m.includes("unauthorized") ||
    m.includes("not authenticated") ||
    m.includes("row-level security")
  ) {
    return "การเข้าสู่ระบบหมดเวลา — กดออกจากระบบแล้วเข้าใหม่ ข้อมูลที่พิมพ์ไว้ถูกเก็บเป็นฉบับร่างอัตโนมัติแล้ว";
  }
  if (m.includes("too large") || m.includes("exceeded") || m.includes("payload")) {
    return "ไฟล์ใหญ่เกินไป — ลองย่อรูปให้เล็กลงแล้วอัปโหลดใหม่";
  }
  return `${verb}ไม่สำเร็จ — ลองกด${verb}อีกครั้ง (ระบบแจ้งว่า: ${message})`;
}
