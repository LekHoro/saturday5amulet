/** structured data ของหน้า — ใส่ได้ทั้งก้อนเดียวหรือหลายก้อนในสคริปต์เดียว */
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
