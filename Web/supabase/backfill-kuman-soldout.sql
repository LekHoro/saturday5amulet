-- เติมหมวด "กุมารทอง หมดแล้ว" (102229) ให้กุมารทองที่หมดแล้วซึ่งยังไม่อยู่หมวดนี้
-- วิธีใช้: Supabase Dashboard → SQL Editor → รันทีละบล็อก (ดูผลก่อน แล้วค่อยอัปเดต)
-- ของใหม่หลังจากนี้ไม่ต้องรันอีก — /admin ใส่หมวดนี้ให้อัตโนมัติเมื่อกด "หมดแล้ว"
--
-- รันไปแล้วเมื่อ 2026-08-09: แก้ 1 แถว (id 546154) → หมวดนี้มี 60 ชิ้น, ไม่มีตกหล่นเหลือ
-- เก็บไฟล์ไว้เป็นเครื่องมือตรวจซ้ำ — รันกี่ครั้งก็ได้ ข้ามชิ้นที่มีหมวดอยู่แล้ว

-- 1) ดูก่อนว่ามีชิ้นไหนบ้างที่จะโดนแก้
select id, title, sold_out,
       (select string_agg(c->>'name', ', ') from jsonb_array_elements(categories) c) as หมวดปัจจุบัน
from products
where sold_out
  and not categories @> '[{"id":"102229"}]'::jsonb
  and (categories @> '[{"id":"8647"}]'::jsonb      -- กุมารทอง
    or categories @> '[{"id":"121326"}]'::jsonb    -- กุมารทอง ขนาดบูชา
    or categories @> '[{"id":"121327"}]'::jsonb    -- กุมารทอง ขนาดพกพา
    or categories @> '[{"id":"102534"}]'::jsonb)   -- น้องกุมารี
order by title;

-- 2) พอใจกับรายการข้างบนแล้วค่อยรันบล็อกนี้ (append หมวดเดียว ไม่แตะหมวดเดิม)
update products
set categories = categories || '[{"id":"102229","name":"กุมารทอง หมดแล้ว"}]'::jsonb,
    updated_at = now()
where sold_out
  and not categories @> '[{"id":"102229"}]'::jsonb
  and (categories @> '[{"id":"8647"}]'::jsonb
    or categories @> '[{"id":"121326"}]'::jsonb
    or categories @> '[{"id":"121327"}]'::jsonb
    or categories @> '[{"id":"102534"}]'::jsonb);

-- 3) ตรวจย้อนกลับ: ชิ้นที่อยู่หมวด "กุมารทอง หมดแล้ว" ทั้งที่ยังพร้อมบูชา (ควรเป็น 0 แถว)
select id, title from products
where not sold_out and categories @> '[{"id":"102229"}]'::jsonb;

-- ถ้าบล็อก 3 มีแถวขึ้นมา และต้องการถอดหมวดออกให้ตรงกับสถานะ:
-- update products
-- set categories = (
--       select coalesce(jsonb_agg(c), '[]'::jsonb)
--       from jsonb_array_elements(categories) c
--       where c->>'id' <> '102229'
--     ),
--     updated_at = now()
-- where not sold_out and categories @> '[{"id":"102229"}]'::jsonb;
