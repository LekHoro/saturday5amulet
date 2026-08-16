"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { saveMaster, deleteMaster } from "../../../actions";

export default function MasterForm(props: {
  slug: string;
  name: string;
  photo: string | null;
  bio: string | null;
  videosText: string;
  banner: string | null;
}) {
  const router = useRouter();
  const [photo, setPhoto] = useState(props.photo);
  const [bio, setBio] = useState(props.bio ?? "");
  const [videosText, setVideosText] = useState(props.videosText);
  const [banner, setBanner] = useState(props.banner);
  // เก็บว่ากำลังอัปช่องไหน — ปุ่มอีกช่องจะได้ไม่ขึ้น "กำลังอัปโหลด..." ตามไปด้วย
  const [uploading, setUploading] = useState<"photo" | "banner" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onUpload(kind: "photo" | "banner", files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(kind);
    setError(null);
    const sb = createSupabaseBrowser();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `masters/${props.slug}-${kind}-${Date.now()}.${ext}`;
    const { error } = await sb.storage.from("images").upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type || undefined,
    });
    if (error) setError(`อัปโหลดรูปไม่สำเร็จ: ${error.message}`);
    else {
      const url = sb.storage.from("images").getPublicUrl(path).data.publicUrl;
      if (kind === "photo") setPhoto(url);
      else setBanner(url);
    }
    setUploading(null);
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    const res = await saveMaster({ slug: props.slug, photo, bio, videosText, banner });
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.push("/admin/masters");
    router.refresh();
  }

  async function onDelete() {
    if (!confirm(`ลบ "${props.name}" ออกจากเว็บถาวร?`)) return;
    setSaving(true);
    const res = await deleteMaster(props.slug);
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.push("/admin/masters");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-semibold">รูปอาจารย์</label>
        <div className="mt-2 flex items-center gap-4">
          <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-gold/50 bg-night-soft">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">🙏</div>
            )}
          </div>
          <div className="space-y-2">
            <label className="block cursor-pointer rounded-xl border border-gold/40 px-4 py-2 text-center text-sm text-gold-light transition hover:border-gold">
              {uploading === "photo" ? "กำลังอัปโหลด..." : "เลือกรูปใหม่"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading !== null}
                onChange={(e) => onUpload("photo", e.target.files)}
              />
            </label>
            {photo && (
              <button onClick={() => setPhoto(null)} className="block w-full text-center text-xs text-ember">
                ลบรูป (กลับไปใช้รูปวัตถุมงคลแทน)
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold">ประวัติย่อ</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={6}
          placeholder="ประวัติจริงของอาจารย์ (เว้นว่างได้ เว็บจะไม่แสดงส่วนนี้)"
          className="mt-1 w-full rounded-xl border border-gold/30 bg-night-soft px-4 py-3 text-ivory outline-none focus:border-gold"
        />
      </div>

      <div>
        <label className="text-sm font-semibold">แบนเนอร์ (แนวนอน)</label>
        <p className="mt-0.5 text-xs text-smoke">
          ขึ้นกลางหน้าประวัติ เหนือคลิปยูทูป — แนวนอน 1700×900 (แบนเนอร์เก่าจาก igetweb คือ 850×450
          สัดส่วนเดียวกัน) เว้นว่างได้ เว็บจะไม่แสดงส่วนนี้
        </p>
        <div className="mt-2 space-y-2">
          {banner && (
            <div className="overflow-hidden rounded-xl border border-gold/30 bg-night-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner} alt="" className="h-auto w-full" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <label className="cursor-pointer rounded-xl border border-gold/40 px-4 py-2 text-center text-sm text-gold-light transition hover:border-gold">
              {uploading === "banner"
                ? "กำลังอัปโหลด..."
                : banner
                  ? "เปลี่ยนแบนเนอร์"
                  : "เลือกแบนเนอร์"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading !== null}
                onChange={(e) => onUpload("banner", e.target.files)}
              />
            </label>
            {banner && (
              <button onClick={() => setBanner(null)} className="text-xs text-ember">
                ลบแบนเนอร์
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold">วิดีโอ YouTube</label>
        <p className="mt-0.5 text-xs text-smoke">
          บรรทัดละคลิป: วางลิงก์ YouTube ตามด้วย | และชื่อคลิป เช่น
          <br />
          <code>https://youtu.be/HF5yjfpxuyw | คาถากุมารนะหน้าทอง</code>
        </p>
        <textarea
          value={videosText}
          onChange={(e) => setVideosText(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-xl border border-gold/30 bg-night-soft px-4 py-3 font-mono text-sm text-ivory outline-none focus:border-gold"
        />
      </div>

      {error && <p className="text-sm text-ember">{error}</p>}

      <button
        onClick={onSave}
        disabled={saving || uploading !== null}
        className="w-full rounded-xl bg-gold py-3.5 font-bold text-night transition hover:brightness-110 disabled:opacity-60"
      >
        {saving ? "กำลังบันทึก..." : "บันทึก"}
      </button>

      <button
        onClick={onDelete}
        disabled={saving || uploading !== null}
        className="w-full rounded-xl border border-ember/60 py-3 text-sm font-semibold text-ember transition hover:bg-ember/10 disabled:opacity-60"
      >
        ลบอาจารย์นี้
      </button>
    </div>
  );
}
