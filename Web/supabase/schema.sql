-- Saturday5Amulet — Supabase schema
-- วิธีใช้: Supabase Dashboard → SQL Editor → วางไฟล์นี้ทั้งไฟล์ → Run (รันซ้ำได้ ไม่พังของเดิม)

-- ── ตาราง ──────────────────────────────────────────────────────────────

create table if not exists products (
  id text primary key,
  url text,
  title text not null default '',
  price_text text,
  price numeric,
  sku text,
  updated_text text,                             -- ข้อความ "อัปเดตล่าสุด" จากเว็บเดิม
  sold_out boolean not null default false,
  categories jsonb not null default '[]'::jsonb, -- [{id,name}]
  description_html text,
  description_text text,
  images jsonb not null default '[]'::jsonb,     -- [url, ...]
  meta jsonb not null default '{}'::jsonb,       -- {title,description,keywords}
  en jsonb,                                      -- คำแปลอังกฤษ {title,descriptionHtml,descriptionText,meta,translated}
  position int not null default 0,               -- ลำดับการแสดงผล (น้อย = ขึ้นก่อน)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists articles (
  id text primary key,
  url text,
  kind text not null default 'article',          -- 'article' | 'news'
  title text not null default '',
  date_text text,
  views int,
  categories jsonb not null default '[]'::jsonb,
  content_html text,
  content_text text,
  images jsonb not null default '[]'::jsonb,
  meta jsonb not null default '{}'::jsonb,
  en jsonb,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists galleries (
  id text primary key,
  title text not null default '',
  images jsonb not null default '[]'::jsonb,
  en jsonb,
  position int not null default 0,
  updated_at timestamptz not null default now()
);

-- ครูบาอาจารย์ (แกน master) — photo/bio/videos เจ้าของกรอกเพิ่มทีหลังผ่าน /admin
create table if not exists masters (
  slug text primary key,
  cat_id text not null,
  name text not null,
  photo text,
  bio text,
  videos jsonb not null default '[]'::jsonb,     -- [{id,title}]
  position int not null default 0,
  updated_at timestamptz not null default now()
);

-- ค่าตั้งต่าง ๆ เช่น next_ceremony = {"label":"พิธีเสาร์ ๕","date":"2027-04-03"}
create table if not exists settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default now()
);

-- ── Row Level Security: ทุกคนอ่านได้ / เขียนได้เฉพาะล็อกอิน (เจ้าของร้าน) ──

alter table products enable row level security;
alter table articles enable row level security;
alter table galleries enable row level security;
alter table masters enable row level security;
alter table settings enable row level security;

do $$
declare t text;
begin
  foreach t in array array['products','articles','galleries','masters','settings'] loop
    execute format('drop policy if exists "public read" on %I', t);
    execute format('create policy "public read" on %I for select using (true)', t);
    execute format('drop policy if exists "owner write" on %I', t);
    execute format('create policy "owner write" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- ── Storage: bucket "images" (สาธารณะ อ่านได้ทุกคน / อัปโหลดเฉพาะล็อกอิน) ──

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read images" on storage.objects;
create policy "public read images" on storage.objects
  for select using (bucket_id = 'images');

drop policy if exists "owner insert images" on storage.objects;
create policy "owner insert images" on storage.objects
  for insert to authenticated with check (bucket_id = 'images');

drop policy if exists "owner update images" on storage.objects;
create policy "owner update images" on storage.objects
  for update to authenticated using (bucket_id = 'images');

drop policy if exists "owner delete images" on storage.objects;
create policy "owner delete images" on storage.objects
  for delete to authenticated using (bucket_id = 'images');
