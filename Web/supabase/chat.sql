-- บันทึกบทสนทนาของแชทบอท (ผู้ช่วยเสาร์ห้า) — หนึ่งแถวต่อหนึ่งคำถาม-คำตอบ
-- รันใน Supabase SQL Editor (หรือ apply_migration) หลัง merge โค้ดแชทบอทแล้ว
-- ผู้อ่านทั่วไป (anon) เขียนตรง ๆ ไม่ได้ตาม RLS จึงบันทึกผ่าน security definer function
-- เหมือน bump_article_views ใน schema.sql — อ่านได้เฉพาะเจ้าของร้าน (ไว้ทำหน้าแอดมินเฟส 3)

create table if not exists chat_turns (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  session_id text not null,
  channel text not null default 'web',      -- web | line (เฟส 2)
  lang text not null default 'th',
  page text,                                 -- path ที่ลูกค้าเปิดอยู่ตอนถาม
  question text not null,
  answer text not null,
  cards jsonb not null default '[]'::jsonb,  -- การ์ดที่บอทแนบ (kind/id/title)
  handoff jsonb,                             -- {reason, topic, summary} ถ้าส่งต่อแอดมิน
  usage jsonb                                -- token usage จาก API ไว้ดูต้นทุน
);

create index if not exists chat_turns_created_at_idx on chat_turns (created_at desc);
create index if not exists chat_turns_session_idx on chat_turns (session_id, created_at);
-- คำถามที่บอทส่งต่อเพราะไม่มีข้อมูล — ไว้ให้เจ้าของเติม FAQ (เฟส 3)
create index if not exists chat_turns_handoff_idx on chat_turns ((handoff->>'reason'))
  where handoff is not null;

alter table chat_turns enable row level security;

drop policy if exists "owner read chat" on chat_turns;
create policy "owner read chat" on chat_turns
  for select to authenticated
  using ((auth.jwt()->>'email') = 'saturday5amulet@gmail.com');

drop policy if exists "owner write chat" on chat_turns;
create policy "owner write chat" on chat_turns
  for all to authenticated
  using ((auth.jwt()->>'email') = 'saturday5amulet@gmail.com')
  with check ((auth.jwt()->>'email') = 'saturday5amulet@gmail.com');

-- ฟังก์ชันบันทึกจากเว็บ (anon) — จำกัดความยาวกันคนยิงขยะใส่ตาราง
create or replace function public.log_chat_turn(
  p_session text,
  p_channel text,
  p_lang text,
  p_page text,
  p_question text,
  p_answer text,
  p_cards jsonb,
  p_handoff jsonb,
  p_usage jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_session is null or length(p_session) > 64 then return; end if;
  if p_question is null or length(p_question) > 2000 then return; end if;
  if p_answer is null or length(p_answer) > 8000 then return; end if;
  insert into chat_turns (session_id, channel, lang, page, question, answer, cards, handoff, usage)
  values (
    p_session,
    coalesce(left(p_channel, 16), 'web'),
    coalesce(left(p_lang, 8), 'th'),
    left(p_page, 512),
    p_question,
    p_answer,
    coalesce(p_cards, '[]'::jsonb),
    p_handoff,
    p_usage
  );
end;
$$;

revoke all on function public.log_chat_turn(text, text, text, text, text, text, jsonb, jsonb, jsonb) from public;
grant execute on function public.log_chat_turn(text, text, text, text, text, text, jsonb, jsonb, jsonb) to anon, authenticated;
