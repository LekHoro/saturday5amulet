// ชนิดข้อมูล + ตัวช่วย pure + JSON fallback ของทั้งเว็บ
// การอ่านข้อมูลจริงทำผ่าน getData() ใน "@/lib/db" (Supabase ถ้าตั้งค่าแล้ว, ไม่งั้นใช้ JSON ในไฟล์นี้)
import productsRaw from "@/data/products.json";
import articlesRaw from "@/data/articles.json";
import newsRaw from "@/data/news.json";
import galleriesRaw from "@/data/galleries.json";
import { isVideoUrl } from "@/lib/media";
import { DEFAULT_HOME_BLOCKS, type HomeBlock } from "@/lib/home-blocks";

export interface Category {
  id: string;
  name: string;
}

/** คำแปลอังกฤษที่เจ้าของกรอกเองใน /admin (คอลัมน์ en) — ว่างไว้ได้ หน้า /en จะถอยไปใช้ไทย */
export interface EnContent {
  title?: string | null;
  /** สินค้าเท่านั้น เช่น "1,500 Baht" */
  priceText?: string | null;
  /** descriptionHtml (สินค้า) / contentHtml (บทความ) ฉบับอังกฤษ */
  html?: string | null;
  /** ข้อความล้วนที่ถอดจาก html — ใช้ทำ excerpt/ค้นหา */
  text?: string | null;
}

export interface Product {
  id: string;
  url: string;
  /** ท่อนชื่อต่อท้าย id ใน URL เช่น /products/43623-กุมารเจริญลาภ (ว่าง = ใช้ id เปล่า) */
  slug: string | null;
  /** แท็กคำค้น (แบบ igetweb) — ใช้ทำ keywords, ชิปใต้สินค้า และพ่วงเข้าช่องค้นหา */
  tags: string[];
  title: string;
  priceText: string;
  price: number | null;
  sku: string | null;
  updatedAt: string | null;
  soldOut: boolean;
  visible: boolean;
  categories: Category[];
  descriptionHtml: string | null;
  descriptionText: string | null;
  images: string[];
  meta: { title: string; description: string | null; keywords: string | null };
  en?: EnContent | null;
}

export interface Article {
  id: string;
  url: string;
  kind: string;
  title: string;
  dateText: string | null;
  views: number | null;
  categories: Category[];
  contentHtml: string | null;
  contentText: string | null;
  images: string[];
  meta: { title: string; description: string | null; keywords: string | null };
  en?: EnContent | null;
}

export interface Gallery {
  id: string;
  title: string;
  images: string[];
}

// --- ครูบาอาจารย์ / สำนัก (แกน "master") --------------------------------
// จุดขายหลักของร้าน: รวมวัตถุมงคลตามอาจารย์ผู้ปลุกเสก
// photo/bio/videos/banner เจ้าของกรอกภายหลังผ่าน /admin (ห้ามแต่ง bio เอง เป็นบุคคล/พระจริง)
export interface Master {
  slug: string;
  catId: string;
  name: string;
  photo?: string;
  bio?: string;
  videos?: { id: string; title: string }[];
  /** แบนเนอร์แนวนอนกลางหน้าประวัติ — มาตรฐาน 1700×900 (17:9 เท่าของเดิมจาก igetweb 850×450) */
  banner?: string;
}

export interface MasterWithMeta extends Master {
  count: number;
  available: number;
  /** รูปตัวแทนจากวัตถุมงคล ใช้เมื่อยังไม่มีรูปอาจารย์ */
  cover: string | null;
}

export interface Ceremony {
  label: string;
  date: string;
}

/** ข้อมูลทั้งเว็บหนึ่งชุด — โหลดครั้งเดียวต่อ cache ผ่าน getData() */
export interface SiteData {
  products: Product[];
  availableProducts: Product[];
  articles: Article[];
  news: Article[];
  galleries: Gallery[];
  masters: MasterWithMeta[];
  categoryNames: Record<string, string>;
  /** รูปประจำหมวดที่เจ้าของตั้งเองใน /admin/settings (catId → url) — ไม่ตั้งใช้รูปสินค้าอัตโนมัติ */
  categoryImages: Record<string, string>;
  nextCeremony: Ceremony | null;
  /** ลำดับบล็อกหน้าแรกที่เจ้าของจัดไว้ใน /admin/settings/home */
  homeBlocks: HomeBlock[];
}

// Curated category groups for navigation
// children: หมวดลูกของหมวดใหญ่ (แสดงซ้อนใน sidebar; เมนู/แอดมินยังใช้ ids แบบแบน)
export const categoryGroups: { label: string; slug: string; ids: string[]; children?: Record<string, string[]> }[] = [
  {
    label: "ตามประเภท",
    slug: "type",
    ids: ["8647", "121326", "121327", "102534", "102229"],
    children: { "8647": ["121326", "121327", "102534", "102229"] },
  },
  {
    label: "ตามพุทธคุณ",
    slug: "power",
    ids: ["91638", "41976", "102273"],
  },
  {
    label: "ตามพระเกจิ / อาจารย์",
    slug: "master",
    ids: ["8672", "8650", "8681", "8670", "8652", "8657", "8667", "43623", "8665", "115230", "88394", "88396", "102281", "8687"],
  },
];

// กุมารทองที่หมดแล้วมีหมวดของตัวเอง (โครงเดิมจาก igetweb) — ให้ระบบดูแลให้อัตโนมัติ
// เจ้าของกดแค่ "หมดแล้ว" ไม่ต้องจำว่าต้องติ๊กหมวดนี้เพิ่มทุกครั้ง
export const KUMAN_SOLD_OUT_CAT: Category = { id: "102229", name: "กุมารทอง หมดแล้ว" };
export const KUMAN_CAT_IDS = ["8647", "121326", "121327", "102534"];

/** กุมารทองหมด → เข้าหมวด "กุมารทอง หมดแล้ว"; กลับมามีของ → ถอดหมวดนั้นออก */
export function syncKumanSoldOut(categories: Category[], soldOut: boolean): Category[] {
  const has = categories.some((c) => c.id === KUMAN_SOLD_OUT_CAT.id);
  if (!soldOut) return has ? categories.filter((c) => c.id !== KUMAN_SOLD_OUT_CAT.id) : categories;
  const isKuman = categories.some((c) => KUMAN_CAT_IDS.includes(c.id));
  return isKuman && !has ? [...categories, KUMAN_SOLD_OUT_CAT] : categories;
}

// fallback masters config เมื่อยังไม่ต่อ Supabase (ใน Supabase อยู่ตาราง masters)
export const mastersConfig: Master[] = [
  {
    slug: "amnard",
    catId: "8650",
    name: "พระอาจารย์อำนาจ มหาวีโร",
    photo: "/masters/amnard.jpg",
    banner: "/banners/masters/amnard.jpg",
    videos: [
      { id: "P8KEStpp5Wc", title: "คาถาน้ำมันเจิมกุมารทอง พระอาจารย์อำนาจ มหาวีโร" },
      { id: "tqQ2MbO7md4", title: "กุมารีปิ่นเพชร พระอาจารย์อำนาจ มหาวีโร" },
    ],
  },
  {
    slug: "subin",
    catId: "8672",
    name: "อาจารย์สุบิน นะหน้าทอง",
    photo: "/masters/subin.jpg",
    banner: "/banners/masters/subin.jpg",
    videos: [
      { id: "HF5yjfpxuyw", title: "คาถากุมารนะหน้าทอง อาจารย์สุบิน นะหน้าทอง" },
      { id: "nsrlp9ssRlg", title: "คาถาพรายแม่ทองคำ อาจารย์สุบิน นะหน้าทอง" },
      { id: "bvOwjwSYYxM", title: "คาถากุมารทองสี่หน้าเก้าตา อาจารย์สุบิน นะหน้าทอง" },
      { id: "AfqYoo8xHFs", title: "อาจารย์สุบินปลุกเสกกุมารทองสี่หน้าเก้าตา" },
      { id: "79kZ9JHINkk", title: "อาจารย์สุบินปลุกเสกกุมารแก้วสารพัดนึกสี่หน้าเก้าตา" },
      { id: "XjfBMk3dUd8", title: "อาจารย์สุบิน ทำพิธีลงนะหน้าทอง 108" },
      { id: "k-iw3eb6sQo", title: "อาจารย์สุบินปลุกเสกพรายแม่ทองคำ รุ่น 1" },
      { id: "xpGuIF3SHZc", title: "สัมภาษณ์ อาจารย์สุบิน นะหน้าทอง กุมารมหาภูตินะหน้าทอง ปี 2561" },
      { id: "EOR-ry_a3c0", title: "พิธีจุดเทียนนพเคราะห์ อาจารย์สุบิน นะหน้าทอง วันที่ 10 พ.ย. 62" },
    ],
  },
  {
    slug: "yaem",
    catId: "8681",
    name: "หลวงปู่แย้ม วัดสามง่าม",
    photo: "/masters/yaem.jpg",
    banner: "/banners/masters/yaem.jpg",
    videos: [{ id: "IFsUa6rved4", title: "รวมรุ่นกุมารทองวัดสามง่าม หลวงปู่แย้ม" }],
  },
  {
    slug: "ram",
    catId: "8670",
    name: "อาจารย์ราม สำนักโหราราม",
    photo: "/masters/ram.jpg",
    videos: [{ id: "JU3BZbOZM44", title: "คาถากุมารทอง อาจารย์ราม สำนักโหราราม" }],
  },
  { slug: "surasak", catId: "8667", name: "หลวงพ่อพระมหาสุรศักดิ์ วัดประดู่" },
  {
    slug: "kalong",
    catId: "8657",
    name: "หลวงปู่กาหลง เขี้ยวแก้ว",
    photo: "/masters/kalong.jpg",
    // ประวัติจากเจ้าของร้าน (ห้ามแต่งเพิ่มเอง) — ย่อหน้าคั่นด้วยบรรทัดว่าง
    bio: [
      "หลวงปู่กาหลง เตชวัณโณ หรือที่ลูกศิษย์เรียกกันว่า “หลวงปู่กาหลง เขี้ยวแก้ว” เดิมท่านเป็นชาวคลอง 7 จ.ปทุมธานี เกิดเมื่อวันที่ 10 มกราคม พ.ศ. 2461 มีพี่น้องทั้งหมด 4 คน ท่านเป็นบุตรคนโต",
      "ตอนท่านจะถือกำเนิดมีเรื่องอัศจรรย์เกิดขึ้น มีชายคนหนึ่งชื่อ “ลุงบาง” อาชีพหาปลา คืนหนึ่งขณะออกหาปลาได้เห็นดวงไฟประหลาดลอยมายังหน้าบ้านของหลวงปู่ จึงตามดวงไฟนั้นไปเพื่อจะดูให้รู้ว่าเป็นดวงไฟอะไร แล้วได้เห็นพระฤๅษีตนหนึ่งจูงเด็กน้อยเข้าไปในบ้าน ลุงบางจึงยกมือขึ้นไหว้ด้วยความศรัทธา แล้วตั้งจิตอธิษฐานว่า หากสิ่งที่เห็นเป็นเรื่องจริง เด็กที่เกิดในบ้านหลังนั้นต้องเป็นเด็กชาย และหากเป็นจริงก็จะเลิกอาชีพหาปลาหันมาเข้าวัดฟังธรรม ไม่นานโยมแม่ของหลวงปู่ก็คลอดลูกออกมาเป็นเด็กชาย และให้ชื่อว่า “กาหลง” ส่วนลุงบางเมื่อพบว่าสิ่งที่ตนเห็นเป็นจริง ก็เลิกหาปลาตั้งแต่นั้นเป็นต้นมา และปิดเรื่องที่เห็นในคืนนั้นไว้ ไม่ได้บอกใคร",
      "หลวงปู่กาหลงอุปสมบทเมื่ออายุได้ 20 ปี ที่วัดนาบุญ คลองเจ็ด จ.ปทุมธานี ในวันที่ท่านอุปสมบท ลุงบางได้เล่าเหตุการณ์ที่ได้เห็นเมื่อ 20 ปีก่อนให้พระอุปัชฌาย์ฟัง และขอถวายตัวเป็นโยมอุปัฏฐากตั้งแต่บัดนั้นเป็นต้นมา",
      "“เขี้ยวแก้ว” นับเป็นของกายสิทธิ์ที่เกิดขึ้นเองตามธรรมชาติเฉพาะผู้มีบุญวาสนาบารมีสูงเท่านั้น และยังงอกสูงขึ้นหรือหดเข้าไปได้ด้วยแรงอธิษฐานของท่าน เขี้ยวแก้วนี้มีมาแต่เกิด เมื่อครั้งยังเด็กที่ปลายเขี้ยวมีลักษณะคล้ายรูปองค์พระนั่งสมาธิ แต่ท่านเห็นว่าเป็นถึงรูปองค์พระ ไม่เหมาะสมที่จะอยู่ในปากซึ่งต้องใช้ฟันบดเคี้ยวอาหาร จึงตั้งจิตอธิษฐานให้หลุดหายไป คงเหลือแต่เขี้ยวแก้ว เสมือนหนุมานทหารเอกพระราม ที่พระอิศวรได้ประทานกุณฑล ขนเพชร เขี้ยวแก้ว ให้เป็นของวิเศษกายสิทธิ์เพื่อต่อสู้กับศัตรู",
      "ท่านเป็นพระเถราจารย์ผู้มีวัตรปฏิบัติเคร่งครัด 1 ปีสรงน้ำ 1 ครั้ง ท่านเล่าว่าเคยสิ้นลมหายใจมรณภาพมาแล้วครั้งหนึ่ง โดยท้าววิษณุกรรมมารับ แต่โบสถ์วัดเขาแหลมหลังที่ 9 ยังสร้างไม่เสร็จ จึงต่ออายุขัยให้ ท่านเคยกล่าวไว้ว่า “ของ ๆ ฉัน ฉันตั้งใจทำมากับมือ ต่อไปจะมีค่ายิ่งกว่าทองคำ จะหายากยิ่งกว่าเพชร” และ “ฉันทำเครื่องรางของขลังมาตั้งแต่ปี 2485 แต่ไม่เคยประกาศให้ใครรู้ มีแต่บอกต่อกัน ถ้าไม่แน่จริงฉันคงสร้างโบสถ์ได้ไม่ถึง 8 หลังหรอก ขณะนี้กำลังสร้างหลังที่ 9” “วัตถุมงคลทุกอย่างที่ฉันสร้างจะไม่มีวันเสื่อม”",
      "หลวงปู่กาหลงได้มีโอกาสศึกษาวิชาอาคมและปฏิบัติพระกัมมัฏฐานกับครูบาอาจารย์หลายท่าน เช่น หลวงพ่อเนียม วัดนาบุญ ปทุมธานี, หลวงปู่ช้าง วัดเขียนเขต ปทุมธานี, หลวงปู่ด๊วด วัดกลางคลองสี่ ปทุมธานี, หลวงปู่ทา วัดพะเนียงแตก นครปฐม, หลวงพ่อแช่ม วัดตาก้อง นครปฐม, หลวงพ่อจง วัดหน้าต่างนอก อยุธยา, หลวงพ่อทองศุข วัดโตนดหลวง เพชรบุรี, หลวงปู่จันทร์ วัดนางหนู ลพบุรี, เจ้าคุณพระอินทสมาจารย์ (เงิน) วัดอินทรวิหาร กรุงเทพฯ, เจ้าคุณพระราชมงคลมุนี (สนธิ์) วัดสุทัศน์ กรุงเทพฯ และศึกษาสายวิชาหลวงปู่ศุข วัดปากคลองมะขามเฒ่า",
      "ท่านเป็นเกจิอาจารย์รุ่นเก่าที่เก่งกาจมานาน เคยเข้าร่วมพิธีปลุกเสกครั้งยิ่งใหญ่ พิธี 25 พุทธศตวรรษ ปี พ.ศ. 2500 ณ ท้องสนามหลวงและพระวิหารหลวง วัดสุทัศน์ และเคยไปปลุกเสกตามวัดต่าง ๆ อีกหลายวัด มีอยู่ครั้งหนึ่งที่ไปปลุกเสกร่วมกับหลวงปู่โต๊ะ หลังเสร็จพิธี หลวงปู่โต๊ะถึงกับชี้มาที่หลวงปู่กาหลง แล้วกล่าวกับหลวงพ่อแช่ม วัดนวลนรดิศ และศิษย์ที่นั่งฟังอยู่ว่า “พระรูปนี้ชื่ออะไร อยู่วัดไหน ทำไมพลังอำนาจจิตถึงได้รุนแรงพิสดารแบบนี้ ไม่เคยพบเห็นที่ไหนมาก่อน”",
      "หลวงปู่กาหลงอาพาธตั้งแต่ต้นปี พ.ศ. 2552 เป็นต้นมา และได้เข้ารักษาอาการอาพาธ ซึ่งตรวจพบมะเร็งที่ลำคอ ต่อมาอาการของท่านทรุดหนักลง จนกระทั่งท่านได้ถึงแก่มรณภาพลงอย่างสงบเมื่อวันที่ 12 กันยายน พ.ศ. 2552 ณ โรงพยาบาลเปาโล รวมสิริอายุ 91 ปี บวชเรียนมา 71 พรรษา หลังจากนั้นได้ตั้งสวดพระอภิธรรมศพเป็นเวลา 7 คืน และสวดศพ 100 วัน จากนั้นได้นำสรีระของท่านบรรจุใส่โลงแก้ว ให้สาธุชนได้กราบไหว้ต่อไป",
      "หลวงปู่กาหลงเป็นพระภิกษุสงฆ์ที่ประพฤติดีปฏิบัติชอบ มีอาคมแก่กล้า มีอำนาจวาสนาบารมี เป็นเนื้อนาบุญแห่งพระพุทธศาสนา ผู้ที่มีวัตถุมงคลของท่านไว้ครอบครอง ควรพิจารณาระลึกถึงคุณงามความดี เดินตามรอยเส้นทางที่ถูกต้อง มีคุณธรรม ยึดมั่นในศีลในธรรมตามแบบอย่างของท่านสืบไป",
    ].join("\n\n"),
  },
  {
    slug: "nenkaew",
    catId: "43623",
    name: "หลวงปู่เณรแก้ว คัมภีโร",
    videos: [
      { id: "2kRVG0qo1jI", title: "คลิปเต็ม หลวงปู่เณรแก้ว ปลุกเสกกุมารขุมทรัพย์ ณ ป่าช้า (3 ธ.ค. 62)" },
      { id: "fp_A3Ss-cKM", title: "เบื้องหลังการปลุกเสกกุมารทอง หลวงปู่เณรแก้ว ณ ป่าช้า 31-01-62 (คลิปเต็ม)" },
      { id: "tf_Z9u3jHOU", title: "หลวงปู่เณร เหรียญเสี่ยงทาย พระนอนกรุงเก่า" },
      {
        id: "evqVXkoCnZ8",
        title: "พิธีอาบน้ำมนต์ดอกไม้ ปีละครั้งในวันเพ็ญ หลวงปู่เณรแก้ว คัมภีโร ปี 2561",
      },
    ],
  },
  { slug: "chuan", catId: "8652", name: "หลวงปู่ชวน วัดเขาแก้ว", photo: "/masters/chuan.jpg" },
  { slug: "puen", catId: "8665", name: "พระครูปืน วัดลาดชะโด" },
  { slug: "boy", catId: "88394", name: "อาจารย์บอย บารมีเทพบันดาล" },
  {
    slug: "kraidech",
    catId: "88396",
    name: "อาจารย์ไกรเดช เศรษฐีลูกพ่อเวส",
    videos: [{ id: "eWECFN_SpKs", title: "สักยันต์นะหน้าทอง ยันต์ครูคุ้มนะหน้าทอง" }],
  },
  { slug: "koi", catId: "115230", name: "หลวงพ่อกอย วัดเขาดินใต้", photo: "/masters/koi.jpg" },
  { slug: "thongthaeng", catId: "102281", name: "อาจารย์ทองแท่ง จ.ชัยภูมิ" },
  { slug: "watsuthat", catId: "8687", name: "วัดสุทัศน์" },
];

// --- ตัวช่วย pure (ทำงานกับ SiteData ที่ได้จาก getData()) -----------------

export function productsInCategory(data: SiteData, catId: string): Product[] {
  return data.products.filter((p) => p.categories.some((c) => c.id === catId));
}

export function categoryCount(data: SiteData, catId: string): number {
  return productsInCategory(data, catId).length;
}

export function getProduct(data: SiteData, id: string): Product | undefined {
  return data.products.find((p) => p.id === id);
}

export function getArticle(data: SiteData, id: string): Article | undefined {
  return data.articles.find((a) => a.id === id) ?? data.news.find((a) => a.id === id);
}

export function getGallery(data: SiteData, id: string): Gallery | undefined {
  return data.galleries.find((g) => g.id === id);
}

export function getMaster(data: SiteData, slug: string): MasterWithMeta | undefined {
  return data.masters.find((m) => m.slug === slug);
}

// --- URL สินค้า: /products/{id}-{slug} (โครงเดียวกับเว็บเดิม igetweb) ------
// id นำหน้าเสมอ — ลิงก์เก่าทุกแบบ (/products/43623 และ /products/43623-ชื่อเก่า)
// ยังชี้ถูกชิ้น หน้า detail จะ 308 ไป URL ทางการให้เอง

// ท่อนชื่อยาวเกินทำ build พังทั้งเว็บ: ตอน prerender ชื่อโฟลเดอร์ = "{id}-{slug}.segments"
// ซึ่งระบบไฟล์จำกัด 255 ไบต์ และตัวไทยกินตัวละ 3 ไบต์ (เคยพังจริงกับสินค้า 690185)
// จึงตัดท่อนชื่อที่ขอบคำ (ขีดสุดท้าย) — ลิงก์แบบยาวยัง 308 มาที่ URL ที่ตัดแล้วให้เอง
const MAX_SLUG_BYTES = 180;
function capSlug(slug: string): string {
  const enc = new TextEncoder();
  if (enc.encode(slug).length <= MAX_SLUG_BYTES) return slug;
  let out = "";
  for (const ch of slug) {
    if (enc.encode(out + ch).length > MAX_SLUG_BYTES) break;
    out += ch;
  }
  const cut = out.lastIndexOf("-");
  return (cut > 0 ? out.slice(0, cut) : out).replace(/-+$/, "");
}

/** เส้นทางทางการของสินค้าชิ้นนี้ (ยังไม่เติม /en — ส่งผ่าน href() อีกที) */
export function productPath(p: { id: string; slug?: string | null }): string {
  const slug = p.slug?.trim();
  return slug ? `/products/${p.id}-${capSlug(slug)}` : `/products/${p.id}`;
}

/** แยก id ออกจากท่อนชื่อใน URL — "43623-กุมารเจริญลาภ" → { id: "43623", slug: "กุมารเจริญลาภ" } */
export function parseProductRef(param: string): { id: string; slug: string | null } {
  const m = param.match(/^(\d+)(?:-(.*))?$/);
  if (!m) return { id: param, slug: null };
  return { id: m[1], slug: m[2] || null };
}

/** ข้อความ → ท่อน slug ที่ใช้ใน URL ได้ (คงตัวไทยไว้ เหมือน URL เดิมของ igetweb) */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/["'’”“()[\]{}.,!?:;/\\|@#$%^&*+=~`<>]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

/** คำนวณ count/available/cover ให้อาจารย์ทุกท่าน — ลำดับตาม configs ที่ส่งเข้ามาเลย
 * (Supabase query เรียง .order("position") มาแล้ว, JSON fallback เรียงตามลำดับใน mastersConfig)
 * ให้เจ้าของจัดลำดับเองในแอดมินได้ ไม่ต้อง auto-sort ตามจำนวนรุ่นอีกต่อไป */
export function computeMasters(configs: Master[], products: Product[]): MasterWithMeta[] {
  return configs
    .map((m) => {
      const items = products.filter((p) => p.categories.some((c) => c.id === m.catId));
      const firstWithImage = items.find((p) => p.images[0]);
      return {
        ...m,
        count: items.length,
        available: items.filter((p) => !p.soldOut).length,
        cover: m.photo ?? firstWithImage?.images[0] ?? null,
      };
    })
    .filter((m) => m.count > 0);
}

export function buildCategoryNames(products: Product[]): Record<string, string> {
  const names: Record<string, string> = {};
  for (const p of products) for (const c of p.categories) names[c.id] = c.name;
  return names;
}

// --- ฉบับเบา (light) สำหรับ snapshot กลาง ---------------------------------
// unstable_cache จำกัด payload 2MB — snapshot กลางจึงตัด html ยาว ๆ ออก
// (หน้า detail ดึงเนื้อหาเต็มเป็นรายชิ้นผ่าน getProductFull/getArticleFull)
const EXCERPT = 300;

/** คำแปล EN ฉบับเบา — ตัด html ทิ้งเหมือนฝั่งไทย (คงชื่อ/ราคา/บทคัดย่อไว้ให้หน้า list ใช้) */
function lightenEn(en: EnContent | null | undefined): EnContent | null {
  if (!en) return null;
  return {
    title: en.title ?? null,
    priceText: en.priceText ?? null,
    html: null,
    text: en.text ? en.text.slice(0, EXCERPT) : null,
  };
}

export function lightenProduct(p: Product): Product {
  return {
    ...p,
    descriptionHtml: null,
    descriptionText: p.descriptionText ? p.descriptionText.slice(0, EXCERPT) : null,
    // snapshot เบาใช้แค่ทำการ์ด/ปก — ตัดวิดีโอทิ้ง ให้ images[0] เป็นรูปนิ่งเสมอ
    images: p.images.filter((u) => !isVideoUrl(u)),
    en: lightenEn(p.en),
  };
}

export function lightenArticle(a: Article): Article {
  return {
    ...a,
    en: lightenEn(a.en),
    contentHtml: null,
    contentText: a.contentText ? a.contentText.slice(0, EXCERPT) : null,
    images: a.images.filter((u) => !isVideoUrl(u)),
  };
}

// --- JSON fallback (ใช้เมื่อยังไม่ตั้งค่า Supabase หรือ Supabase ล่ม) ------

// keep only images hosted by the shop/igetweb (drops emoji/tracker images picked up in scraped content)
const OWN_IMAGE = /cache-igetweb-v2\.mt108\.info|cdn\.igetweb\.com|saturday5amulet\.com/;
function ownImages<T extends { images: string[] }>(item: T): T {
  return { ...item, images: (item.images ?? []).filter((u) => OWN_IMAGE.test(u)) };
}

function jsonProducts(): Product[] {
  // JSON ที่ scrape ไว้ยังไม่มี slug/tags (มาทีหลัง กรอกในแอดมิน) — เติมค่าว่างให้ครบชนิด
  return (productsRaw as Omit<Product, "visible" | "slug" | "tags">[])
    .filter((p) => p.title)
    .map((p) => ({ ...p, visible: true, slug: null, tags: [] }))
    .map(ownImages);
}
function jsonArticles(): Article[] {
  return (articlesRaw as Article[]).filter((a) => a.title).map(ownImages);
}
function jsonNews(): Article[] {
  return (newsRaw as Article[]).filter((a) => a.title && !("error" in a)).map(ownImages);
}

export function jsonSnapshot(): SiteData {
  const products = jsonProducts().map(lightenProduct);
  const galleries = (galleriesRaw as Gallery[]).filter((g) => g.title && g.images.length > 0);
  return {
    products,
    availableProducts: products.filter((p) => !p.soldOut),
    articles: jsonArticles().map(lightenArticle),
    news: jsonNews().map(lightenArticle),
    galleries,
    masters: computeMasters(mastersConfig, products),
    categoryNames: buildCategoryNames(products),
    categoryImages: {},
    nextCeremony: null,
    homeBlocks: DEFAULT_HOME_BLOCKS,
  };
}

/** สินค้าฉบับเต็ม (มี html) จาก JSON */
export function jsonProduct(id: string): Product | null {
  return jsonProducts().find((p) => p.id === id) ?? null;
}

/** บทความ/ข่าวฉบับเต็ม (มี html) จาก JSON */
export function jsonArticle(id: string): Article | null {
  return jsonArticles().find((a) => a.id === id) ?? jsonNews().find((a) => a.id === id) ?? null;
}

/** youtube id หรือ url → embed url */
export function youtubeEmbed(v: string | undefined): string | null {
  if (!v) return null;
  const m = v.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/) ?? v.match(/^([\w-]{11})$/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

// ช่อง YouTube ของร้าน — ใช้ handle @saturday5amulet (URL แบบ /c/ เป็นของเก่า YouTube เลิกออกให้แล้ว)
export const YOUTUBE_CHANNEL = "https://www.youtube.com/@saturday5amulet";

// แบนเนอร์สำเร็จรูปยุค igetweb ที่ถูกแปะซ้ำ ๆ ท้าย html สินค้า/บทความ —
// Add-Friend JPEG สองแบบ + ปุ่ม LINE gif ซ้ำซ้อนกับ CTA จริงและ LineQrBlock เลยตัดทิ้ง
// (คงแบนเนอร์ใบรับประกัน/จัดส่งทั่วโลกไว้ — เป็นเนื้อหา ไม่ใช่ CTA)
const LEGACY_CTA_BANNERS = [
  "6d0b4dd587eb23b9108d22cf48a8f1e5", // Add Friend @sat589
  "760106048fd765917373331ef414007a", // Add Friend @saturday5amulet
  "ce9ca042d7969e4542ec41b50a6e9e8b", // ปุ่มเขียว "คลิกที่ปุ่มนี้"
];
const bannerPattern = LEGACY_CTA_BANNERS.join("|");
const legacyCtaRe = new RegExp(
  // ทั้งแบบมี <a> หุ้ม และแบน <img> เดี่ยว ๆ
  `<a[^>]*>\\s*(?:<img[^>]*(?:${bannerPattern})[^>]*>\\s*)+</a>|<img[^>]*(?:${bannerPattern})[^>]*>`,
  "gi",
);

// strip igetweb wrapper header ("รายละเอียดสินค้า") from scraped html
export function cleanHtml(html: string | null): string {
  if (!html) return "";
  return html
    .replace(/<div class="page-header">[\s\S]*?<\/div>\s*<\/div>|<div class="page-header">[\s\S]*?<\/div>/, "")
    .replace(legacyCtaRe, "")
    .replace(/style="[^"]*"/g, "")
    .replace(/class="[^"]*"/g, "");
}

export function thumb(p: Product): string | null {
  return p.images[0] ?? null;
}
