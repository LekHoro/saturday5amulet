"use client";
import { createSupabaseBrowser } from "./client";

/** อัปโหลดรูปขึ้น Supabase Storage (bucket "images") แล้วคืน public URL
 *  folder เช่น "products" | "articles" | "content" */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const sb = createSupabaseBrowser();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from("images").upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type || undefined,
  });
  if (error) throw new Error(error.message);
  return sb.storage.from("images").getPublicUrl(path).data.publicUrl;
}
