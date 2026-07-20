# วิธีตั้งค่า Supabase (ทำครั้งเดียว)

ระบบหลังร้าน `/admin` และฐานข้อมูลสินค้าใช้ Supabase (ฟรี) — ทำตามนี้ทีละข้อ

## 1. สร้างโปรเจกต์
1. ไปที่ https://supabase.com → Sign up (ใช้อีเมลหรือบัญชี GitHub ก็ได้)
2. กด **New project**
   - Name: `saturday5amulet`
   - Database password: ตั้งรหัสอะไรก็ได้ **จดเก็บไว้** (ไม่ต้องใช้บ่อย)
   - Region: **Southeast Asia (Singapore)**
3. รอสร้างเสร็จ ~2 นาที

## 2. คัดลอก 3 ค่านี้ส่งให้ Claude (หรือใส่ไฟล์เอง)
ไปที่ **Project Settings → API Keys**:
- **Project URL** (เช่น `https://xxxx.supabase.co`)
- **anon / publishable key**
- **service_role / secret key** (กด Reveal)

วิธีใส่เอง: คัดลอกไฟล์ `web/.env.local.example` เป็น `web/.env.local` แล้วเติม 3 ค่านี้

## 3. สร้างตาราง
Supabase Dashboard → **SQL Editor** → วางเนื้อหาไฟล์ `web/supabase/schema.sql` ทั้งไฟล์ → **Run**

## 4. สร้างบัญชีล็อกอินหลังร้าน (บัญชีเดียวของเจ้าของ)
Dashboard → **Authentication → Users → Add user → Create new user**
- Email: อีเมลของเจ้าของ
- Password: รหัสผ่านสำหรับเข้า /admin
- ✅ ติ๊ก **Auto Confirm User**

## 5. ย้ายข้อมูล + รูป (Claude รันให้)
```
cd web
node scripts/migrate/upload-images.mjs   # อัปโหลดรูป 1,321 ไฟล์ (~402MB ใช้เวลาสักพัก)
node scripts/migrate/seed.mjs            # ย้ายข้อมูลสินค้า/บทความ/แกลเลอรี
```

## 6. ตั้งค่าบน Vercel
Vercel → โปรเจกต์ → **Settings → Environment Variables** เพิ่ม 2 ตัว (ทุก environment):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

(ไม่ต้องใส่ service_role บน Vercel) แล้ว **Redeploy**

## เสร็จแล้วได้อะไร
- เว็บอ่านข้อมูลจาก Supabase (แก้ผ่านมือถือได้ ไม่ต้องแก้โค้ด)
- รูปทั้งหมดย้ายมาอยู่ Supabase Storage (เลิกพึ่งเซิร์ฟเวอร์ igetweb เดิม)
- เข้า `/admin` ด้วยมือถือ: ติ๊กหมดแล้ว, เพิ่ม/แก้/ลบสินค้า+อัปโหลดรูป,
  ใส่รูป/ประวัติ/วิดีโออาจารย์, ตั้งวันนับถอยหลังพิธีเสาร์ ๕

หมายเหตุ: ถ้ายังไม่ตั้งค่า Supabase เว็บก็ยังทำงานตามปกติ (ใช้ข้อมูลเดิมที่ย้ายมาจาก igetweb)
