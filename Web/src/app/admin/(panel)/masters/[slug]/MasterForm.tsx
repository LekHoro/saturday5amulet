"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { saveMaster } from "../../../actions";

export default function MasterForm(props: {
  slug: string;
  photo: string | null;
  bio: string | null;
  videosText: string;
}) {
  const router = useRouter();
  const [photo, setPhoto] = useState(props.photo);
  const [bio, setBio] = useState(props.bio ?? "");
  const [videosText, setVideosText] = useState(props.videosText);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const sb = createSupabaseBrowser();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `masters/${props.slug}-${Date.now()}.${ext}`;
    const { error } = await sb.storage.from("images").upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type || undefined,
    });
    if (error) setError(`อัปโหลดรูปไม่สำเร็จ: ${error.message}`);
    else setPhoto(sb.storage.from("images").getPublicUrl(path).data.publicUrl);
    setUploading(false);
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    const res = await saveMaster({ slug: props.slug, photo, bio, videosText });
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
              {uploading ? "กำลังอัปโหลด..." : "เลือกรูปใหม่"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => onUpload(e.target.files)}
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
        disabled={saving || uploading}
        className="w-full rounded-xl bg-gold py-3.5 font-bold text-night transition hover:brightness-110 disabled:opacity-60"
      >
        {saving ? "กำลังบันทึก..." : "บันทึก"}
      </button>
    </div>
  );
}
