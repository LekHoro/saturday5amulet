"use client";

import { useRef, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { shrinkImage } from "@/lib/image-shrink";

/** โฟลเดอร์ทั้งหมดใน bucket images */
const FOLDERS = ["legacy", "products", "articles", "content", "masters", "categories", "banners"];

/** ไฟล์เล็กกว่านี้ปล่อยไว้ — เสียเวลาบีบใหม่โดยแทบไม่ได้อะไรคืน */
const MIN_SIZE = 350_000;

/** จำนวนไฟล์ที่ทำพร้อมกัน — มากกว่านี้เบราว์เซอร์เริ่มหน่วง เพราะ decode รูปกินแรงเครื่อง */
const CONCURRENCY = 3;

type Target = { path: string; size: number; mime: string };

type Phase = "idle" | "scanning" | "working" | "done" | "stopped";

function mb(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function ShrinkImagesTool() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [targets, setTargets] = useState<Target[]>([]);
  const [doneCount, setDoneCount] = useState(0);
  const [saved, setSaved] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef(false);

  async function scan() {
    setPhase("scanning");
    setError(null);
    setTargets([]);
    const sb = createSupabaseBrowser();
    const found: Target[] = [];
    try {
      for (const folder of FOLDERS) {
        for (let offset = 0; ; offset += 1000) {
          const { data, error: listErr } = await sb.storage
            .from("images")
            .list(folder, { limit: 1000, offset });
          if (listErr) throw new Error(listErr.message);
          if (!data?.length) break;
          for (const o of data) {
            const size = (o.metadata?.size as number | undefined) ?? 0;
            const mime = (o.metadata?.mimetype as string | undefined) ?? "";
            if (size >= MIN_SIZE && (mime === "image/jpeg" || mime === "image/png")) {
              found.push({ path: `${folder}/${o.name}`, size, mime });
            }
          }
          if (data.length < 1000) break;
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "อ่านรายชื่อรูปไม่สำเร็จ");
      setPhase("idle");
      return;
    }
    found.sort((a, b) => b.size - a.size);
    setTargets(found);
    setPhase("idle");
  }

  async function run() {
    stopRef.current = false;
    setPhase("working");
    setDoneCount(0);
    setSaved(0);
    setSkipped(0);
    setFailed([]);
    const sb = createSupabaseBrowser();
    const queue = [...targets];

    async function worker() {
      for (;;) {
        if (stopRef.current) return;
        const t = queue.shift();
        if (!t) return;
        try {
          const url = sb.storage.from("images").getPublicUrl(t.path).data.publicUrl;
          const res = await fetch(`${url}?fresh=${Date.now()}`, { cache: "no-store" });
          if (!res.ok) throw new Error(`โหลดรูปไม่ได้ (${res.status})`);
          const original = await res.blob();

          const shrunk = await shrinkImage(original, t.mime);
          if (!shrunk.done) {
            setSkipped((n) => n + 1);
          } else {
            const { error: upErr } = await sb.storage
              .from("images")
              .upload(t.path, shrunk.blob, {
                upsert: true,
                cacheControl: "31536000",
                // ชนิดที่บันทึกอาจไม่ใช่ชนิดเดิม (png ทึบถูกเขียนเป็น jpg) — ต้องยึดของที่ย่อออกมา
                contentType: shrunk.mime,
              });
            if (upErr) throw new Error(upErr.message);
            setSaved((n) => n + (original.size - shrunk.blob.size));
          }
        } catch (e) {
          const why = e instanceof Error ? e.message : "ไม่ทราบสาเหตุ";
          setFailed((list) => [...list, `${t.path} — ${why}`]);
        }
        setDoneCount((n) => n + 1);
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    setPhase(stopRef.current ? "stopped" : "done");
  }

  const totalBytes = targets.reduce((sum, t) => sum + t.size, 0);
  const busy = phase === "scanning" || phase === "working";

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={scan}
          disabled={busy}
          className="rounded-xl border border-gold-light/60 px-4 py-2 text-sm font-semibold text-gold-light transition hover:bg-gold/10 disabled:opacity-50"
        >
          {phase === "scanning" ? "กำลังหา…" : "หารูปที่ควรย่อ"}
        </button>
        {targets.length > 0 && phase !== "working" && (
          <button
            type="button"
            onClick={run}
            className="rounded-xl bg-gold px-4 py-2 text-sm font-bold text-night transition hover:brightness-110"
          >
            เริ่มย่อ {targets.length} รูป
          </button>
        )}
        {phase === "working" && (
          <button
            type="button"
            onClick={() => {
              stopRef.current = true;
            }}
            className="rounded-xl border border-crimson/60 px-4 py-2 text-sm font-semibold text-ivory transition hover:bg-crimson/20"
          >
            หยุด
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-crimson">{error}</p>}

      {targets.length > 0 && (
        <p className="mt-3 text-sm text-ivory/85">
          เจอ {targets.length} รูป รวม {mb(totalBytes)} — ใหญ่สุด {mb(targets[0].size)}
        </p>
      )}
      {phase === "idle" && targets.length === 0 && !error && (
        <p className="mt-3 text-sm text-smoke">กด “หารูปที่ควรย่อ” เพื่อดูว่ามีรูปใหญ่เหลืออยู่กี่รูป</p>
      )}

      {(phase === "working" || phase === "done" || phase === "stopped") && (
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-night">
            <div
              className="h-full bg-gold transition-all"
              style={{ width: `${targets.length ? (doneCount / targets.length) * 100 : 0}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-ivory/85">
            ทำแล้ว {doneCount}/{targets.length} · ประหยัดได้ {mb(saved)}
            {skipped > 0 && ` · ข้าม ${skipped} (ย่อแล้วไม่เล็กลง)`}
            {failed.length > 0 && ` · พลาด ${failed.length}`}
          </p>
          {phase === "done" && (
            <p className="mt-1 text-sm font-semibold text-gold-light">
              เสร็จแล้ว — กด “หารูปที่ควรย่อ” ซ้ำได้เพื่อเช็กว่าเหลือรูปใหญ่อีกไหม
            </p>
          )}
          {phase === "stopped" && (
            <p className="mt-1 text-sm text-smoke">หยุดแล้ว — กดเริ่มใหม่ได้ รูปที่ย่อไปแล้วจะถูกข้าม</p>
          )}
          {failed.length > 0 && (
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-crimson">
              {failed.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
