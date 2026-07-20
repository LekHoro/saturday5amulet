// Shared helpers for the one-off Supabase migration scripts.
// Run from web/:  node scripts/migrate/upload-images.mjs  then  node scripts/migrate/seed.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";

config({ path: ".env.local" });

export const MIGRATION_DIR =
  process.env.MIGRATION_DIR ?? path.resolve(process.cwd(), "..", "migration");

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "ต้องมี NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY ใน web/.env.local ก่อน"
  );
  process.exit(1);
}

export const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

export function readJson(...segments) {
  return JSON.parse(readFileSync(path.join(...segments), "utf8"));
}

/** old igetweb URL → path in the "images" bucket (legacy/<basename>) */
export function loadImageMap() {
  const raw = readJson(MIGRATION_DIR, "data", "image-map.json");
  const map = new Map();
  for (const [oldUrl, localPath] of Object.entries(raw)) {
    map.set(oldUrl, `legacy/${path.basename(localPath)}`);
  }
  return map;
}

export function publicImageUrl(bucketPath) {
  return `${SUPABASE_URL}/storage/v1/object/public/images/${bucketPath}`;
}
