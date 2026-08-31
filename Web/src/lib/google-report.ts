import { createSign } from "node:crypto";

/**
 * ดึงรายงานจาก Google Analytics 4 + Search Console ด้วย service account
 * เซ็น JWT เองผ่าน node:crypto — ไม่ต้องลาก googleapis ทั้งก้อนมาเพื่อสองเมธอด
 *
 * env ที่ต้องมี (ตั้งใน Vercel):
 * - GOOGLE_SERVICE_ACCOUNT_JSON : เนื้อไฟล์ key JSON ของ service account ทั้งก้อน
 * - GA4_PROPERTY_ID             : เลข property GA4 (ตัวเลขล้วน ไม่ใช่ G-XXXX)
 * - GSC_SITE (ไม่บังคับ)        : ค่าเริ่มต้น sc-domain:saturday5amulet.com
 */

const SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
].join(" ");

export const GSC_SITE = process.env.GSC_SITE ?? "sc-domain:saturday5amulet.com";

export function reportsConfigured(): boolean {
  return !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON && !!process.env.GA4_PROPERTY_ID;
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

// token ใช้ซ้ำได้ ~1 ชม. — เก็บในโมดูล ประหยัดรอบขอ token ตอนหน้ารายงานยิงหลาย query
let cached: { token: string; exp: number } | null = null;

async function accessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.exp - 60 > now) return cached.token;

  const sa = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!) as {
    client_email: string;
    private_key: string;
  };
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPES,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const jwt = `${header}.${claims}.${signer.sign(sa.private_key, "base64url")}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`ขอ token ไม่ผ่าน: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, exp: now + data.expires_in };
  return data.access_token;
}

async function googlePost<T>(url: string, body: unknown): Promise<T> {
  const token = await accessToken();
  const res = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    // รายงานย้อนหลังไม่เปลี่ยนรายชั่วโมง — cache ฝั่ง Next 1 ชม. กันยิง API ถี่เกิน
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Google API ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

// ---------- GA4 Data API ----------

type GaRow = { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] };

export type GaReportRequest = {
  dateRanges: { startDate: string; endDate: string }[];
  dimensions?: { name: string }[];
  metrics: { name: string }[];
  dimensionFilter?: unknown;
  orderBys?: unknown[];
  limit?: number;
};

/** ยิง runReport แล้วคืน rows แบบแบน ๆ: [ค่า dimension..., ค่า metric...] */
export async function gaReport(req: GaReportRequest): Promise<string[][]> {
  const property = process.env.GA4_PROPERTY_ID!;
  const data = await googlePost<{ rows?: GaRow[] }>(
    `https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`,
    req
  );
  return (data.rows ?? []).map((r) => [
    ...(r.dimensionValues ?? []).map((d) => d.value),
    ...(r.metricValues ?? []).map((m) => m.value),
  ]);
}

// ---------- Search Console API ----------

export type GscRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export async function gscQuery(body: {
  startDate: string;
  endDate: string;
  dimensions: string[];
  rowLimit?: number;
  dimensionFilterGroups?: unknown[];
}): Promise<GscRow[]> {
  const data = await googlePost<{ rows?: GscRow[] }>(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`,
    body
  );
  return data.rows ?? [];
}

// ---------- วันที่ (เวลาไทย) ----------

/** วันที่แบบ YYYY-MM-DD เวลาไทย ย้อนหลัง n วันจากวันนี้ */
export function bkkDate(daysAgo: number): string {
  return new Date(Date.now() + 7 * 3600_000 - daysAgo * 86_400_000).toISOString().slice(0, 10);
}
