"use client";

import { useCallback, useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

// Rich text editor สำหรับหน้า admin — output เป็น HTML สะอาด (h2/h3/p/strong/ul/ol/a/img)
// ให้เจ้าของร้านจัดเนื้อหาเหมือนพิมพ์เอกสาร ไม่ต้องเขียน HTML เอง

type ToolButton = {
  label: string;
  title: string;
  isActive?: (e: Editor) => boolean;
  run: (e: Editor) => void;
};

const BUTTONS: (ToolButton | "sep")[] = [
  { label: "ตัวหนา", title: "ตัวหนา", isActive: (e) => e.isActive("bold"), run: (e) => e.chain().focus().toggleBold().run() },
  { label: "เอียง", title: "ตัวเอียง", isActive: (e) => e.isActive("italic"), run: (e) => e.chain().focus().toggleItalic().run() },
  "sep",
  { label: "หัวข้อใหญ่", title: "หัวข้อใหญ่ (H2)", isActive: (e) => e.isActive("heading", { level: 2 }), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: "หัวข้อย่อย", title: "หัวข้อย่อย (H3)", isActive: (e) => e.isActive("heading", { level: 3 }), run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  "sep",
  { label: "• รายการ", title: "รายการหัวข้อย่อย", isActive: (e) => e.isActive("bulletList"), run: (e) => e.chain().focus().toggleBulletList().run() },
  { label: "1. รายการ", title: "รายการตัวเลข", isActive: (e) => e.isActive("orderedList"), run: (e) => e.chain().focus().toggleOrderedList().run() },
  { label: "❝ อ้างอิง", title: "ข้อความอ้างอิง", isActive: (e) => e.isActive("blockquote"), run: (e) => e.chain().focus().toggleBlockquote().run() },
  "sep",
  { label: "ล้างรูปแบบ", title: "ล้างรูปแบบตัวอักษร", run: (e) => e.chain().focus().unsetAllMarks().clearNodes().run() },
];

export default function RichTextEditor({
  value,
  onChange,
  uploadImage,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  /** อัปโหลดรูปแล้วคืน public URL — ใช้ปุ่ม "แทรกรูป" */
  uploadImage: (file: File) => Promise<string>;
  placeholder?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false, // เลี่ยง hydration mismatch บน Next.js
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "legacy-content min-h-[240px] rounded-b-xl bg-night-soft px-4 py-3 text-[15px] text-ivory outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("ใส่ลิงก์ (เว้นว่างเพื่อลบลิงก์):", prev ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const onPickImage = useCallback(
    async (files: FileList | null) => {
      if (!editor || !files?.length) return;
      for (const file of Array.from(files)) {
        try {
          const url = await uploadImage(file);
          editor.chain().focus().setImage({ src: url }).run();
        } catch (err) {
          alert(`แทรกรูปไม่สำเร็จ: ${err instanceof Error ? err.message : "ผิดพลาด"}`);
        }
      }
      if (fileRef.current) fileRef.current.value = "";
    },
    [editor, uploadImage]
  );

  if (!editor) return null;

  const btnCls = (active?: boolean) =>
    `rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
      active ? "bg-gold text-night" : "text-ivory hover:bg-gold/20"
    }`;

  return (
    <div className="rounded-xl border border-gold/30">
      <div className="flex flex-wrap items-center gap-1 rounded-t-xl border-b border-gold/20 bg-night p-2">
        {BUTTONS.map((b, i) =>
          b === "sep" ? (
            <span key={i} className="mx-0.5 h-5 w-px bg-gold/20" />
          ) : (
            <button
              key={i}
              type="button"
              title={b.title}
              onClick={() => b.run(editor)}
              className={btnCls(b.isActive?.(editor))}
            >
              {b.label}
            </button>
          )
        )}
        <span className="mx-0.5 h-5 w-px bg-gold/20" />
        <button type="button" title="ใส่ลิงก์" onClick={setLink} className={btnCls(editor.isActive("link"))}>
          🔗 ลิงก์
        </button>
        <button type="button" title="แทรกรูปในเนื้อหา" onClick={() => fileRef.current?.click()} className={btnCls()}>
          🖼 แทรกรูป
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onPickImage(e.target.files)}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
