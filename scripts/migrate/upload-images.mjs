// อัปโหลดรูปทั้งหมดจาก migration/images → Supabase Storage bucket "images" (โฟลเดอร์ legacy/)
// รันซ้ำได้: ข้ามไฟล์ที่อัปโหลดแล้ว
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { supabase, MIGRATION_DIR, loadImageMap } from "./lib.mjs";

const CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

async function listExisting() {
  const existing = new Set();
  let offset = 0;
  for (;;) {
    const { data, error } = await supabase.storage
      .from("images")
      .list("legacy", { limit: 1000, offset });
    if (error) throw error;
    for (const f of data) existing.add(f.name);
    if (data.length < 1000) break;
    offset += data.length;
  }
  return existing;
}

const imageMap = loadImageMap();
const files = [...new Set(imageMap.values())]; // legacy/<basename>
console.log(`ทั้งหมด ${files.length} ไฟล์`);

const existing = await listExisting();
const todo = files.filter((p) => !existing.has(path.basename(p)));
console.log(`อัปโหลดแล้ว ${existing.size} — เหลือ ${todo.length}`);

let done = 0;
let failed = [];
const CONCURRENCY = 6;

async function uploadOne(bucketPath) {
  const base = path.basename(bucketPath);
  const local = path.join(MIGRATION_DIR, "images", base);
  if (!existsSync(local)) {
    failed.push({ bucketPath, reason: "local file missing" });
    return;
  }
  const ext = path.extname(base).toLowerCase();
  const { error } = await supabase.storage
    .from("images")
    .upload(bucketPath, readFileSync(local), {
      contentType: CONTENT_TYPES[ext] ?? "application/octet-stream",
      upsert: true,
      cacheControl: "31536000",
    });
  if (error) failed.push({ bucketPath, reason: error.message });
  done++;
  if (done % 50 === 0) console.log(`  ${done}/${todo.length}`);
}

for (let i = 0; i < todo.length; i += CONCURRENCY) {
  await Promise.all(todo.slice(i, i + CONCURRENCY).map(uploadOne));
}

console.log(`เสร็จ: สำเร็จ ${done - failed.length}, ล้มเหลว ${failed.length}`);
if (failed.length) {
  console.log(failed.slice(0, 20));
  process.exitCode = 1;
}
