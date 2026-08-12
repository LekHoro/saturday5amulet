// ระบบสองภาษา: ไทยอยู่ URL เดิม (/) อังกฤษอยู่ใต้ /en (โครงเดียวกับเว็บ igetweb เดิม)
// proxy.ts rewrite path ไม่มี locale → /th ภายใน แล้วหน้า (site)/[lang] อ่าน param นี้

export const LANGS = ["th", "en"] as const;
export type Lang = (typeof LANGS)[number];

export function isLang(x: string): x is Lang {
  return (LANGS as readonly string[]).includes(x);
}

/** สร้าง href ตามภาษา — ไทยไม่มี prefix (URL เดิม), อังกฤษเติม /en */
export function href(lang: Lang, path: string): string {
  if (lang !== "en") return path;
  return path === "/" ? "/en" : `/en${path}`;
}

/** path ปัจจุบัน (จาก usePathname ซึ่งมี /en ติดมา) → path ไม่มี locale */
export function stripLang(pathname: string): string {
  if (pathname === "/en") return "/";
  return pathname.replace(/^\/en(?=\/)/, "");
}

const th = {
  htmlLang: "th",
  ogLocale: "th_TH",

  meta: {
    title: "เสาร์๕มหานิยม - Saturday5Amulet วัตถุมงคล เครื่องราง กุมารทอง",
    template: "%s | เสาร์๕มหานิยม",
    description:
      "เสาร์๕มหานิยม วัตถุมงคล เครื่องราง กุมารทอง ของแท้จากวัดและสำนักโดยตรง เปิดร้านมาตั้งแต่ปี 2012 พร้อมวิธีบูชาและคาถา",
  },

  nav: {
    home: "หน้าแรก",
    products: "วัตถุมงคลและเครื่องราง",
    masters: "ครูบาอาจารย์",
    gallery: "ภาพงานพิธี",
    articles: "บทความ",
    howToOrder: "วิธีสั่งบูชา",
    menu: "เมนู",
    mainMenu: "เมนูหลัก",
    openMenu: "เปิดเมนู",
    closeMenu: "ปิดเมนู",
    viewAllOf: (label: string) => `ดู${label}ทั้งหมด →`,
    searchAria: "ค้นหาวัตถุมงคล",
    searchPlaceholder: "ค้นหาชื่อรุ่น เกจิอาจารย์ หรือหมวดหมู่…",
    searchSubmit: "ค้นหา",
    searchClose: "ปิดค้นหา",
  },

  footer: {
    about:
      "วัตถุมงคล เครื่องราง กุมารทอง ของแท้จากวัดและสำนักโดยตรง เปิดร้านมาตั้งแต่ปี 2012",
    menu: "เมนู",
    contact: "ติดต่อ",
    openDaily: "เปิดทุกวัน ตอบแชทเร็ว",
  },

  home: {
    heroTitle1: "วัตถุมงคล เครื่องราง กุมารทอง",
    heroTitle2: "ของแท้จากวัดและสำนักโดยตรง",
    heroLead:
      "เสาร์๕มหานิยม เปิดร้านมาตั้งแต่ปี 2012 — คัดทุกองค์จากพิธีปลุกเสกจริง พร้อมประวัติการจัดสร้าง วิธีบูชา และคาถากำกับครบทุกรุ่น",
    ctaProducts: "ชมวัตถุมงคลทั้งหมด",
    ctaArticles: "อ่านบทความ / วิธีบูชา",
    heroBadge: "รุ่นใหม่ · กุมารทอง หลวงพ่ออำนาจ มหาวีโร",
    trust: [
      { title: "เปิดมาตั้งแต่ปี 2012", text: "ประสบการณ์กว่า 14 ปี" },
      { title: "พิธีปลุกเสกจริง", text: "มีภาพงานพิธียืนยันทุกรุ่น" },
      { title: "จัดส่งทั่วโลก", text: "EMS World · มีเลขติดตาม" },
      { title: "ปรึกษาฟรีทาง LINE", text: "ตอบไว เช็คของแท้ได้" },
    ],
    byCategory: "เลือกชมตามหมวดหมู่",
    mainCategory: "หมวดหลัก",
    items: (n: number) => `${n} รายการ`,
    byMaster: "เลือกตามครูบาอาจารย์",
    viewAll: "ดูทั้งหมด →",
    featured: "วัตถุมงคลแนะนำ",
    kumanthongTitle: "กุมารทอง — ตัวดังประจำร้าน",
    kumanthongViewAll: "ดูกุมารทองทั้งหมด →",
    bestSeller: "ขายดีอันดับ 1",
    othersTitle: "เครื่องรางและวัตถุมงคลอื่น ๆ",
    ceremonyService: {
      title1: "บริการพิธีจุดเทียนเสริมดวง",
      title2: "ทำพิธีให้ตามฤกษ์มงคล",
      lead: "รับจัดพิธีจุดเทียนบูชา เสริมดวง เสริมโชคลาภ ทำพิธีจริงพร้อมส่งภาพและวิดีโอยืนยันให้ทุกครั้ง สอบถามฤกษ์และรายละเอียดได้เลย",
      cta: "สอบถามพิธีทาง LINE",
      lineMessage: "สนใจสอบถามพิธีจุดเทียนเสริมดวง",
      imageAlt: "พิธีจุดเทียนบูชา",
    },
    lineCta: {
      title: "ไม่แน่ใจว่ารุ่นไหนเหมาะกับคุณ ทักมาปรึกษาได้เลย",
      text: "เช็คของแท้ · สอบถามวิธีบูชา · ติดตามพัสดุ — ตอบทุกข้อความ",
      button: "แอด LINE @sat589",
    },
    orderEasy: "สั่งบูชาง่าย ๆ ใน 3 ขั้นตอน",
    orderSteps: [
      { title: "เลือกวัตถุมงคล", text: "ดูรายละเอียด รูปภาพ และพุทธคุณของแต่ละรุ่นได้จากหน้าเว็บ" },
      { title: "ทัก Line สอบถาม", text: "กดปุ่มสั่งบูชา ระบบจะเปิดแชท Line พร้อมชื่อรุ่นที่คุณสนใจอัตโนมัติ" },
      { title: "ชำระเงินและจัดส่ง", text: "โอนชำระแล้วรอรับองค์ที่บ้าน พร้อมวิธีบูชาและคาถากำกับทุกองค์" },
    ],
    ceremonyGallery: "ภาพงานพิธีจริง",
    ceremonyGalleryLead:
      "ทุกองค์ผ่านพิธีปลุกเสก พุทธาภิเษก และไหว้ครูจากงานจริง — ดูบรรยากาศพิธีได้จากภาพเหล่านี้",
    latestArticles: "บทความล่าสุด",
    readCount: (n: string) => `อ่าน ${n} ครั้ง`,
  },

  products: {
    allTitle: "วัตถุมงคลและเครื่องรางทั้งหมด",
    fallbackTitle: "วัตถุมงคล",
    metaSearch: (q: string) => `ค้นหา "${q}"`,
    metaCatDescription: (name: string, n: number) =>
      `รวม${name}ทั้งหมด ${n} รายการ — ของแท้จากวัดและสำนักโดยตรง พร้อมวิธีบูชาและคาถากำกับ`,
    metaDescription:
      "รวมวัตถุมงคล เครื่องราง กุมารทอง กุมารี จากพระเกจิอาจารย์ชื่อดัง เลือกชมตามประเภท พุทธคุณ หรือพระเกจิ",
    filter: "ตัวกรอง",
    filterAria: "ตัวกรองหมวดหมู่",
    closeFilter: "ปิดตัวกรอง",
    all: "ทั้งหมด",
    sortAria: "เรียงลำดับ",
    sortRecommended: "แนะนำ",
    sortNew: "ใหม่ล่าสุด",
    sortPriceAsc: "ราคาต่ำ → สูง",
    sortPriceDesc: "ราคาสูง → ต่ำ",
    found: (n: number) => `พบ ${n} รายการ`,
    showing: (shown: number, total: number) => `แสดง ${shown} จาก ${total} รายการ`,
    showMore: (next: number, total: number) => `ดูเพิ่มเติม (${next} จาก ${total})`,
    clearSearch: "ล้างคำค้นหา",
    notFound: (q: string) => `ไม่พบ "${q}"`,
    notFoundHint:
      "ลองใช้คำสั้นลง เช่น ชื่อรุ่นหรือชื่ออาจารย์ หรือทักมาสอบถามได้เลย ทางร้านช่วยตามหารุ่นที่ต้องการให้ได้",
    askViaLine: "สอบถามทาง Line",
    soldOutBadge: "หมดแล้ว",
    closedCard: "ปิดรายการบูชาแล้ว",
  },

  product: {
    breadcrumbAria: "เส้นทางหน้า",
    soldOut: "หมดแล้ว — เก็บไว้เป็นประวัติรุ่น",
    notifyLabel: "แจ้งเตือนเมื่อมีเข้าใหม่ทาง Line",
    notifyHint:
      "รุ่นนี้หมดแล้ว กดปุ่มเพื่อฝากชื่อไว้ — ทางร้านจะทัก Line แจ้งเมื่อมีองค์ใหม่หรือรุ่นใกล้เคียงเข้ามา",
    priceLabel: "ราคาบูชา",
    inquireLabel: "สอบถาม / สั่งบูชาผ่าน Line",
    inquireHint: "กดปุ่มแล้วระบบจะเปิดแชท Line พร้อมแนบชื่อรุ่นนี้ให้อัตโนมัติ",
    sku: "รหัสสินค้า",
    categories: "หมวดหมู่",
    updatedAt: "อัปเดตล่าสุด",
    byMaster: (name: string) => `โดย ${name} →`,
    allByMaster: (name: string) => `ดูวัตถุมงคลของ${name}ทั้งหมด →`,
    details: "รายละเอียด",
    related: "วัตถุมงคลที่เกี่ยวข้อง",
    imageAlt: (title: string, i: number) => `${title} รูปที่ ${i}`,
    videoAlt: (title: string, i: number) => `${title} วิดีโอที่ ${i}`,
    zoomAria: "ดูรูปขยายเต็มจอ",
    closeZoom: "ปิดรูปขยาย",
    prevMedia: "รูปก่อนหน้า",
    nextMedia: "รูปถัดไป",
    goToMedia: (i: number) => `ดูรูปที่ ${i}`,
  },

  articles: {
    metaTitle: "บทความ วิธีบูชา คาถา และข่าวพิธีปลุกเสก",
    metaDescription:
      "รวมบทความสายมู วิธีบูชากุมารทอง คาถาวัตถุมงคล ดูดวง พิธีกรรมโบราณ และข่าวงานพิธีปลุกเสกวัตถุมงคล",
    pageTitle: "บทความและข่าวสาร",
    lead: (n: number) => `วิธีบูชา คาถา ดูดวง พิธีกรรมโบราณ และข่าวงานพิธีปลุกเสก — ${n} เรื่อง`,
    eyebrow: "ความรู้และข่าวสารสายมู",
    topics: "เลือกอ่านตามหมวด",
    featured: "เรื่องเด่น",
    mostRead: "อ่านมากที่สุด",
    readMore: "อ่านต่อ →",
    allSections: "← บทความทุกหมวด",
    stories: (n: number) => `${n} เรื่อง`,
    more: "ดูเพิ่มเติม →",
    read: (n: string) => `อ่าน ${n}`,
    readTimes: (n: string) => `อ่าน ${n} ครั้ง`,
    breadcrumb: "บทความ",
    sections: {
      kumanthong: "ประวัติและวิธีบูชากุมารทอง",
      katha: "คาถาบูชาวัตถุมงคลและกุมารทอง",
      merit: "ไหว้พระทำบุญ เสริมดวง",
      horoscope: "ดูดวง ราศี",
      ritual: "พิธีกรรมและความเชื่อโบราณ",
      ceremony: "ข่าวงานพิธีและวัตถุมงคลรุ่นใหม่",
      other: "บทความอื่น ๆ",
    } as Record<string, string>,
    consultTitle: "สนใจวัตถุมงคลหรืออยากปรึกษาเรื่องดวง / การบูชา",
    consultLabel: "ปรึกษาผ่าน Line",
  },

  gallery: {
    metaTitle: "ภาพงานพิธีจริง — พิธีปลุกเสก ไหว้ครู เททอง",
    metaDescription:
      "รวมภาพบรรยากาศงานพิธีจริงของทางร้าน ทั้งพิธีปลุกเสก พุทธาภิเษก ไหว้ครู และเททองหล่อ — ยืนยันทุกองค์ผ่านพิธีจริงจากครูบาอาจารย์",
    title: "ภาพงานพิธีจริง",
    lead: "บรรยากาศพิธีปลุกเสก พุทธาภิเษก ไหว้ครู และเททองหล่อ — บันทึกจากงานจริงทุกครั้ง เพื่อยืนยันว่าทุกองค์ผ่านพิธีตามตำรับครูบาอาจารย์",
    photos: (n: number) => `${n} รูป`,
    albumDescription: (title: string, n: number) =>
      `ภาพบรรยากาศ ${title} — งานพิธีจริงของทางร้าน ${n} รูป`,
    photoAlt: (title: string, i: number) => `${title} รูปที่ ${i}`,
    breadcrumb: "ภาพงานพิธี",
  },

  masters: {
    metaTitle: "ครูบาอาจารย์ / สำนัก",
    metaDescription:
      "รวมครูบาอาจารย์และสำนักผู้ปลุกเสกวัตถุมงคล เครื่องราง กุมารทอง — อาจารย์สุบิน นะหน้าทอง, พระอาจารย์อำนาจ มหาวีโร, หลวงปู่แย้ม วัดสามง่าม และอีกหลายท่าน",
    title: "ครูบาอาจารย์ / สำนัก",
    lead: "ทุกองค์คัดสายตรงจากครูบาอาจารย์และสำนักผู้จัดสร้าง ผ่านพิธีปลุกเสกจริง เลือกชมวัตถุมงคลตามอาจารย์ที่ท่านศรัทธาได้เลย",
    youtube: "▶ ดูวิดีโอพิธีจากช่อง YouTube ของร้าน",
    byMaster: "เลือกตามอาจารย์",
    breadcrumb: "ครูบาอาจารย์",
    editions: (n: number) => `${n} รุ่น`,
    available: (n: number) => `พร้อมบูชา ${n}`,
    totalEditions: (n: number) => `วัตถุมงคลทั้งหมด ${n} รุ่น`,
    availableEditions: (n: number) => `พร้อมบูชา ${n} รุ่น`,
    videos: "วิดีโอคาถา / พิธีปลุกเสก",
    galleryHeading: "ภาพงานพิธีจริง",
    amuletsOf: (name: string) => `วัตถุมงคลของ${name}`,
    metaMaster: (name: string, n: number) =>
      `รวมวัตถุมงคล เครื่องราง ${name} ทั้งหมด ${n} รุ่น — คัดสายตรงผ่านพิธีปลุกเสกจริง พร้อมวิธีบูชาและคาถากำกับ`,
  },

  order: {
    metaTitle: "วิธีสั่งบูชาและชำระเงิน",
    metaDescription:
      "ขั้นตอนการสั่งบูชาวัตถุมงคลกับเสาร์๕มหานิยม — ทัก Line สอบถามก่อนได้ไม่มีข้อผูกมัด ยืนยันยอดและชำระเงินในแชท จัดส่งด่วนทั่วประเทศและต่างประเทศ พร้อมวิธีบูชาและคาถากำกับทุกรุ่น",
    title: "วิธีสั่งบูชาและชำระเงิน",
    lead: "การบูชาทุกองค์เริ่มและจบในแชท Line — ทักมาสอบถามก่อนได้โดยไม่มีข้อผูกมัด ทางร้านเปิดทุกวัน ตอบแชทเร็ว",
    steps: [
      {
        title: "เลือกวัตถุมงคลที่สนใจ",
        text: "ดูรูปภาพ ราคาบูชา พุทธคุณ และข้อมูลพิธีปลุกเสกของแต่ละรุ่นได้จากหน้าเว็บ ถ้ายังไม่แน่ใจว่ารุ่นไหนเหมาะ ทักมาเล่าสิ่งที่ตั้งใจได้เลย ทางร้านช่วยแนะนำให้",
      },
      {
        title: "ทัก Line คุยกับทางร้านโดยตรง",
        text: 'กดปุ่ม "สั่งบูชาผ่าน Line" ในหน้าสินค้า ระบบจะแนบชื่อรุ่นให้อัตโนมัติ หรือแอดไลน์ @sat589 แล้วแจ้งรุ่นที่ต้องการ สอบถามได้ทุกเรื่องก่อนตัดสินใจ ไม่มีข้อผูกมัด',
      },
      {
        title: "ยืนยันการบูชาและชำระเงินในแชท",
        text: "เมื่อพร้อมบูชา ทางร้านจะแจ้งยอดรวมพร้อมบัญชีสำหรับโอนเป็นลายลักษณ์อักษรในแชท โอนแล้วส่งสลิปยืนยันในแชทเดียวกัน ประวัติการคุยเก็บไว้เป็นหลักฐานได้ตลอด",
      },
      {
        title: "แพ็คอย่างดี ส่งด่วนถึงบ้าน",
        text: "จัดส่งด่วนทั่วประเทศ แจ้งเลขพัสดุให้ติดตามในแชททันทีที่จัดส่ง ทุกองค์แนบวิธีบูชาและคาถากำกับ",
      },
    ],
    starterHeading: "ไม่รู้จะเริ่มถามอะไร? แตะคำถามด้านล่างได้เลย",
    starterHint: "ระบบจะเปิดแชท Line พร้อมพิมพ์คำถามให้ แค่กดส่ง",
    starterQuestions: [
      "ช่วยแนะนำรุ่นที่เหมาะกับโชคลาภ ค้าขาย",
      "อยากทราบวิธีบูชาและของที่ต้องเตรียม",
      "รุ่นที่สนใจมีองค์พร้อมส่งไหม",
      "ส่งต่างประเทศได้ไหม ค่าส่งประมาณเท่าไหร่",
    ],
    assurances: [
      {
        title: "แชทเดียวจบทุกขั้นตอน",
        text: "ตั้งแต่สอบถาม ยืนยันยอด ส่งสลิป จนถึงเลขพัสดุ อยู่ในแชทเดียวกันทั้งหมด มีประวัติเป็นหลักฐานตลอด",
      },
      {
        title: "ของแท้จากวัดและสำนัก",
        text: "ทุกองค์ผ่านพิธีปลุกเสก พุทธาภิเษก และไหว้ครูจากงานจริง มีข้อมูลพิธีกำกับทุกรุ่น",
      },
      {
        title: "ติดตามพัสดุได้",
        text: "จัดส่งด่วนทั่วประเทศ และต่างประเทศผ่าน EMS World แจ้งเลขติดตามในแชททันทีที่ส่ง",
      },
    ],
    faqHeading: "คำถามที่พบบ่อย",
    faqs: [
      {
        q: "ทักไปถามเฉย ๆ ก่อนได้ไหม ยังไม่แน่ใจว่าจะบูชา",
        a: "ได้เสมอ การทักแชทไม่มีข้อผูกมัด สอบถามรายละเอียด เปรียบเทียบรุ่น หรือให้ช่วยแนะนำก่อนได้ ตัดสินใจเมื่อพร้อมเท่านั้น",
      },
      {
        q: "ชำระเงินอย่างไร ปลอดภัยแค่ไหน",
        a: "ทางร้านแจ้งยอดรวมพร้อมบัญชีสำหรับโอนเป็นลายลักษณ์อักษรในแชท Line เท่านั้น โอนแล้วส่งสลิปยืนยันในแชทเดียวกัน ทุกขั้นตอนมีประวัติแชทเก็บไว้เป็นหลักฐาน หากมีข้อความแอบอ้างจากช่องทางอื่นให้ทักยืนยันกับไลน์ทางการของร้านก่อนโอนทุกครั้ง",
      },
      {
        q: "มั่นใจได้อย่างไรว่าเป็นของแท้",
        a: "ทุกองค์มาจากวัดและสำนักโดยตรง ผ่านพิธีปลุกเสก พุทธาภิเษก และไหว้ครูจากงานจริง แต่ละรุ่นมีข้อมูลพิธีและที่มากำกับในหน้าสินค้า ดูภาพบรรยากาศงานพิธีจริงได้ที่หน้าภาพงานพิธี",
        link: { href: "/gallery", label: "ดูภาพงานพิธีจริง →" },
      },
      {
        q: "บูชาไปแล้ว ไม่รู้วิธีเลี้ยง วิธีไหว้ ทำอย่างไร",
        a: "ทุกองค์แนบวิธีบูชาและคาถากำกับไปพร้อมพัสดุ และมีบทความวิธีบูชาอ่านได้บนเว็บ หากติดขัดตรงไหนทักแชทมาถามได้ตลอดแม้บูชาไปแล้ว",
        link: { href: "/articles", label: "อ่านบทความวิธีบูชา →" },
      },
      {
        q: "รุ่นที่หมดแล้ว ยังพอหาได้ไหม",
        a: "รุ่นที่หมดแล้วจะขึ้นสถานะไว้ในหน้าเว็บเพื่อเก็บเป็นประวัติรุ่น กดปุ่มแจ้งเตือนในหน้ารุ่นนั้นหรือทักแชทฝากชื่อรุ่นไว้ เมื่อมีเข้าใหม่ทางร้านจะแจ้งทาง Line ทันที",
      },
      {
        q: "อยู่ต่างประเทศ สั่งได้ไหม",
        a: "ได้ ทางร้านจัดส่งต่างประเทศผ่าน EMS World แจ้งประเทศปลายทางในแชทเพื่อเช็คค่าส่งก่อนตัดสินใจได้เลย (We ship worldwide)",
      },
    ] as { q: string; a: string; link?: { href: string; label: string } }[],
    ctaHeading: "พร้อมเมื่อไหร่ ทักมาได้เลย",
    ctaStart: "เริ่มแชทกับทางร้าน",
    startChatMessage: "สนใจสั่งบูชาวัตถุมงคล",
  },

  line: {
    inquiry: (title: string) => `สนใจสั่งบูชา: ${title}`,
    notify: (title: string) => `รุ่นนี้หมดแล้ว รบกวนแจ้งเมื่อมีเข้าใหม่: ${title}`,
    articleInquiry: (title: string) => `อ่านบทความ "${title}" แล้วสนใจสอบถามเพิ่มเติม`,
    searchInquiry: (q: string) => `สนใจสอบถามวัตถุมงคล: ${q}`,
    floatingGreeting: "สวัสดีครับ/ค่ะ สนใจสอบถามวัตถุมงคล",
    floatingLabel: "สอบถาม / สั่งบูชา",
    floatingAria: "ทัก Line สอบถาม / สั่งบูชา",
    qrTitle: "เพิ่มเพื่อน Line ร้าน",
    qrHint: "สแกน QR หรือกดปุ่มเพิ่มเพื่อน — สอบถาม เช็คสถานะจัดส่ง หรือรับข่าวรุ่นใหม่ก่อนใครได้ทางแชทเดียว",
    qrAria: (id: string) => `สแกนหรือกดเพื่อเพิ่มเพื่อน Line ${id}`,
    scanTitle: "สแกนเพื่อเปิดแชท Line",
    scanHint: "เปิดกล้องมือถือหรือแอป Line สแกน — ระบบจะแนบข้อความให้อัตโนมัติ",
    scanClose: "ปิด",
  },

  countdown: {
    auspicious: "วันมงคล",
    countdownTo: "นับถอยหลังวันมงคล",
    today: "วันนี้เป็นวันพิธี",
    dateLocale: "th-TH",
    units: { d: "วัน", h: "ชั่วโมง", m: "นาที", s: "วินาที" },
  },

  carousel: {
    aria: "แบนเนอร์โปรโมชัน",
    prev: "แบนเนอร์ก่อนหน้า",
    next: "แบนเนอร์ถัดไป",
    goTo: (n: number) => `ไปแบนเนอร์ที่ ${n}`,
  },

  categoryGroups: {
    type: "ตามประเภท",
    power: "ตามพุทธคุณ",
    master: "ตามพระเกจิ / อาจารย์",
  } as Record<string, string>,

  // แคตตาล็อกหน้ารวมสินค้า — คำโปรยบอกว่าหมวดพุทธคุณแต่ละหมวดมีของแบบไหน
  catalog: {
    searchButton: "ค้นหา",
    viewAll: (n: number) => `ดูทั้งหมด (${n})`,
    allProducts: (n: number) => `ดูวัตถุมงคลทั้งหมด ${n} รายการ`,
    allProductsHint: "หน้ารวมแบบตาราง พร้อมค้นหาและเรียงลำดับ",
    leads: {
      "91638": "ยันต์ เหรียญ และเครื่องรางสายค้าขาย",
      "41976": "ขุนแผน น้ำมัน ตะกรุด สายเมตตามหานิยม",
      "102273": "พระราหู ท้าวเวสสุวรรณ สายแก้ปีชง",
    } as Record<string, string>,
  },

  langSwitch: {
    label: "เปลี่ยนภาษา",
    other: "EN",
    otherAria: "Switch to English",
  },
};

export type Dict = typeof th;

const en: Dict = {
  htmlLang: "en",
  ogLocale: "en_US",

  meta: {
    title: "Saturday5Amulet — Thai Amulets, Talismans & Kumanthong",
    template: "%s | Saturday5Amulet",
    description:
      "Saturday5Amulet — authentic Thai amulets, talismans and Kumanthong sourced directly from temples and masters since 2012, with worship guides and katha for every edition. We ship worldwide.",
  },

  nav: {
    home: "Home",
    products: "Amulets & Talismans",
    masters: "Masters",
    gallery: "Ceremony Gallery",
    articles: "Articles",
    howToOrder: "How to Order",
    menu: "Menu",
    mainMenu: "Main menu",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    viewAllOf: (label: string) => `View all ${label} →`,
    searchAria: "Search amulets",
    searchPlaceholder: "Search by edition, master or category…",
    searchSubmit: "Search",
    searchClose: "Close search",
  },

  footer: {
    about:
      "Authentic Thai amulets, talismans and Kumanthong sourced directly from temples and masters — trusted since 2012. We ship worldwide.",
    menu: "Menu",
    contact: "Contact",
    openDaily: "Open daily · fast replies",
  },

  home: {
    heroTitle1: "Thai Amulets, Talismans & Kumanthong",
    heroTitle2: "Authentic, direct from temples and masters",
    heroLead:
      "Saturday5Amulet — trusted since 2012. Every piece comes from a real consecration ceremony, with its history, worship guide and katha included.",
    ctaProducts: "Browse all amulets",
    ctaArticles: "Read articles & worship guides",
    heroBadge: "New edition · Kumanthong LP Amnard Mahaveero",
    trust: [
      { title: "Trusted since 2012", text: "Over 14 years of experience" },
      { title: "Real consecration ceremonies", text: "Ceremony photos for every edition" },
      { title: "We ship worldwide", text: "EMS World · with tracking" },
      { title: "Free advice on LINE", text: "Fast replies · authenticity checks" },
    ],
    byCategory: "Shop by category",
    mainCategory: "Main category",
    items: (n: number) => `${n} items`,
    byMaster: "Shop by master",
    viewAll: "View all →",
    featured: "Featured amulets",
    kumanthongTitle: "Kumanthong — our signature",
    kumanthongViewAll: "View all Kumanthong →",
    bestSeller: "Best seller",
    othersTitle: "Talismans & other amulets",
    ceremonyService: {
      title1: "Candle ritual service",
      title2: "Performed for you at an auspicious time",
      lead: "We perform candle-lighting rituals for fortune and luck on your behalf — real ceremonies with photo and video confirmation every time. Ask us about dates and details.",
      cta: "Ask about rituals on LINE",
      lineMessage: "Hello! I'm interested in the candle ritual service.",
      imageAlt: "Candle worship ritual",
    },
    lineCta: {
      title: "Not sure which edition suits you? Just ask",
      text: "Authenticity checks · worship advice · order tracking — we answer every message",
      button: "Add LINE @sat589",
    },
    orderEasy: "Order in 3 easy steps",
    orderSteps: [
      { title: "Choose your amulet", text: "Browse photos, details and blessings of each edition right on the site." },
      { title: "Message us on LINE", text: "Tap the order button — LINE chat opens with the edition name pre-filled for you." },
      { title: "Pay and receive", text: "Transfer payment and receive your amulet at home, with a worship guide and katha included." },
    ],
    ceremonyGallery: "Real ceremony photos",
    ceremonyGalleryLead:
      "Every piece passes real consecration, Buddha Abhiseka and Wai Khru ceremonies — see the atmosphere in these photos.",
    latestArticles: "Latest articles",
    readCount: (n: string) => `${n} views`,
  },

  products: {
    allTitle: "All Amulets & Talismans",
    fallbackTitle: "Amulets",
    metaSearch: (q: string) => `Search "${q}"`,
    metaCatDescription: (name: string, n: number) =>
      `All ${name} — ${n} items, authentic and sourced directly from temples and masters, with worship guides and katha.`,
    metaDescription:
      "Thai amulets, talismans, Kumanthong and Kumaree from renowned masters. Browse by type, blessing or master. We ship worldwide.",
    filter: "Filters",
    filterAria: "Category filters",
    closeFilter: "Close filters",
    all: "All",
    sortAria: "Sort",
    sortRecommended: "Recommended",
    sortNew: "Newest",
    sortPriceAsc: "Price: low → high",
    sortPriceDesc: "Price: high → low",
    found: (n: number) => `${n} results`,
    showing: (shown: number, total: number) => `Showing ${shown} of ${total} items`,
    showMore: (next: number, total: number) => `Show more (${next} of ${total})`,
    clearSearch: "Clear search",
    notFound: (q: string) => `No results for "${q}"`,
    notFoundHint:
      "Try a shorter keyword — an edition or master name — or just message us and we'll help you find it.",
    askViaLine: "Ask on LINE",
    soldOutBadge: "Sold out",
    closedCard: "No longer available",
  },

  product: {
    breadcrumbAria: "Breadcrumb",
    soldOut: "Sold out — kept as edition history",
    notifyLabel: "Notify me on LINE when available",
    notifyHint:
      "This edition is sold out. Tap the button to leave your name — we'll message you on LINE when a new or similar piece arrives.",
    priceLabel: "Price",
    inquireLabel: "Ask / order via LINE",
    inquireHint: "Tapping the button opens LINE chat with this edition's name attached automatically.",
    sku: "SKU",
    categories: "Categories",
    updatedAt: "Last updated",
    byMaster: (name: string) => `By ${name} →`,
    allByMaster: (name: string) => `See all amulets by ${name} →`,
    details: "Details",
    related: "Related amulets",
    imageAlt: (title: string, i: number) => `${title} — photo ${i}`,
    videoAlt: (title: string, i: number) => `${title} — video ${i}`,
    zoomAria: "View full-screen image",
    closeZoom: "Close full-screen view",
    prevMedia: "Previous image",
    nextMedia: "Next image",
    goToMedia: (i: number) => `View image ${i}`,
  },

  articles: {
    metaTitle: "Articles — Worship Guides, Katha & Ceremony News",
    metaDescription:
      "Articles on Thai amulet worship, Kumanthong care, katha chants, fortune reading, traditional rituals and consecration ceremony news.",
    pageTitle: "Articles & News",
    lead: (n: number) => `Worship guides, katha, fortune reading, traditional rituals and ceremony news — ${n} stories`,
    eyebrow: "Amulet knowledge & news",
    topics: "Browse by topic",
    featured: "Featured",
    mostRead: "Most read",
    readMore: "Read more →",
    allSections: "← All categories",
    stories: (n: number) => `${n} stories`,
    more: "See more →",
    read: (n: string) => `${n} reads`,
    readTimes: (n: string) => `${n} views`,
    breadcrumb: "Articles",
    sections: {
      kumanthong: "Kumanthong History & Worship",
      katha: "Katha for Amulets & Kumanthong",
      merit: "Merit-Making & Fortune Boosting",
      horoscope: "Horoscope & Zodiac",
      ritual: "Traditional Rituals & Beliefs",
      ceremony: "Ceremony News & New Editions",
      other: "Other Articles",
    } as Record<string, string>,
    consultTitle: "Interested in an amulet, or want advice on worship?",
    consultLabel: "Chat on LINE",
  },

  gallery: {
    metaTitle: "Ceremony Gallery — Consecrations, Wai Khru & Casting",
    metaDescription:
      "Photos from our real ceremonies: consecrations, Buddha Abhiseka, Wai Khru and gold casting — proof that every piece passes a genuine ceremony.",
    title: "Real Ceremony Photos",
    lead: "Consecration, Buddha Abhiseka, Wai Khru and gold-casting ceremonies — documented at every real event to confirm each piece is blessed the traditional way.",
    photos: (n: number) => `${n} photos`,
    albumDescription: (title: string, n: number) =>
      `Photos from ${title} — a real ceremony of our shop, ${n} photos`,
    photoAlt: (title: string, i: number) => `${title} — photo ${i}`,
    breadcrumb: "Ceremony Gallery",
  },

  masters: {
    metaTitle: "Masters & Temples",
    metaDescription:
      "The masters and temples behind our amulets — AJ Subin Nanatong, LP Amnard Mahaveero, LP Yaem Wat Samgham and many more.",
    title: "Masters & Temples",
    lead: "Every piece is sourced directly from the master or temple that created it, through real consecration ceremonies. Browse amulets by the master you have faith in.",
    youtube: "▶ Watch ceremony videos on our YouTube",
    byMaster: "Browse by master",
    breadcrumb: "Masters",
    editions: (n: number) => `${n} editions`,
    available: (n: number) => `${n} available`,
    totalEditions: (n: number) => `${n} editions in total`,
    availableEditions: (n: number) => `${n} available`,
    videos: "Katha & ceremony videos",
    galleryHeading: "Real ceremony photos",
    amuletsOf: (name: string) => `Amulets by ${name}`,
    metaMaster: (name: string, n: number) =>
      `All ${n} amulet editions by ${name} — sourced directly through real consecration ceremonies, with worship guides and katha.`,
  },

  order: {
    metaTitle: "How to Order & Pay",
    metaDescription:
      "How to order amulets from Saturday5Amulet — message us on LINE with no obligation, confirm and pay in chat, fast delivery across Thailand and worldwide via EMS World, worship guide and katha included.",
    title: "How to Order & Pay",
    lead: "Every order starts and ends in LINE chat — message us first with no obligation. We're open daily and reply fast.",
    steps: [
      {
        title: "Choose the amulet you like",
        text: "Browse photos, prices, blessings and ceremony details of each edition on the site. Not sure which is right for you? Tell us what you're hoping for and we'll recommend one.",
      },
      {
        title: "Message us directly on LINE",
        text: 'Tap "Order via LINE" on any product page — the edition name is attached automatically. Or add @sat589 and tell us the edition you want. Ask anything before deciding; no obligation.',
      },
      {
        title: "Confirm and pay in chat",
        text: "When you're ready, we send the total and bank account in writing in the chat. Transfer and send the slip in the same chat — the full history stays as your proof.",
      },
      {
        title: "Packed with care, shipped fast",
        text: "Fast delivery across Thailand and worldwide. Tracking number sent in chat as soon as it ships. Every piece comes with its worship guide and katha.",
      },
    ],
    starterHeading: "Not sure what to ask first? Tap a question below",
    starterHint: "LINE chat opens with the question typed for you — just hit send.",
    starterQuestions: [
      "Please recommend an edition for wealth and trade luck",
      "How do I worship it and what should I prepare?",
      "Is the edition I'm interested in ready to ship?",
      "Do you ship internationally? Roughly how much?",
    ],
    assurances: [
      {
        title: "One chat, start to finish",
        text: "From questions to payment slip to tracking number — everything stays in one chat, with the history as your record.",
      },
      {
        title: "Authentic, from temples & masters",
        text: "Every piece passes real consecration, Buddha Abhiseka and Wai Khru ceremonies, with ceremony details on every edition.",
      },
      {
        title: "Trackable delivery",
        text: "Fast delivery across Thailand, and worldwide via EMS World — tracking number sent in chat as soon as it ships.",
      },
    ],
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        q: "Can I just ask questions first, without committing?",
        a: "Always. Messaging us carries no obligation — ask for details, compare editions or get recommendations first, and decide only when you're ready.",
      },
      {
        q: "How do I pay, and how safe is it?",
        a: "We send the total and bank account in writing in LINE chat only. Transfer and send the slip in the same chat — every step stays in the chat history as proof. If you receive messages claiming to be us from other channels, verify with our official LINE before transferring.",
      },
      {
        q: "How do I know it's authentic?",
        a: "Every piece comes directly from the temple or master, through real consecration, Buddha Abhiseka and Wai Khru ceremonies. Each edition lists its ceremony and provenance on the product page — see photos from real ceremonies in our gallery.",
        link: { href: "/gallery", label: "See real ceremony photos →" },
      },
      {
        q: "I've received my amulet but don't know how to worship it. What now?",
        a: "Every piece ships with its worship guide and katha, and there are worship articles on the site. Stuck on anything? Message us anytime — even long after your purchase.",
        link: { href: "/articles", label: "Read worship guides →" },
      },
      {
        q: "Can I still get a sold-out edition?",
        a: "Sold-out editions stay on the site as edition history. Tap the notify button on that edition's page or leave your name in chat — we'll message you on LINE the moment a new one arrives.",
      },
      {
        q: "I'm outside Thailand. Can I order?",
        a: "Yes — we ship worldwide via EMS World. Tell us your country in chat and we'll check the shipping cost before you decide.",
      },
    ] as { q: string; a: string; link?: { href: string; label: string } }[],
    ctaHeading: "Whenever you're ready, just say hi",
    ctaStart: "Start a chat with us",
    startChatMessage: "Hello! I'm interested in ordering an amulet.",
  },

  line: {
    inquiry: (title: string) => `Hello! I'm interested in: ${title}`,
    notify: (title: string) => `This edition is sold out — please notify me when a new one arrives: ${title}`,
    articleInquiry: (title: string) => `I read the article "${title}" and would like to ask more.`,
    searchInquiry: (q: string) => `Hello! I'm looking for an amulet: ${q}`,
    floatingGreeting: "Hello! I'm interested in your amulets.",
    floatingLabel: "Chat / Order",
    floatingAria: "Chat on LINE to ask or order",
    qrTitle: "Add our LINE",
    qrHint: "Scan the QR or tap to add us — ask questions, check shipping status or get news of new editions first, all in one chat.",
    qrAria: (id: string) => `Scan or tap to add LINE ${id}`,
    scanTitle: "Scan to chat on LINE",
    scanHint: "Scan with your phone camera or the LINE app — your message is attached automatically.",
    scanClose: "Close",
  },

  countdown: {
    auspicious: "Auspicious day",
    countdownTo: "Countdown to the auspicious day",
    today: "The ceremony is today",
    dateLocale: "en-GB",
    units: { d: "days", h: "hours", m: "min", s: "sec" },
  },

  carousel: {
    aria: "Promotional banners",
    prev: "Previous banner",
    next: "Next banner",
    goTo: (n: number) => `Go to banner ${n}`,
  },

  categoryGroups: {
    type: "By type",
    power: "By blessing",
    master: "By master",
  } as Record<string, string>,

  catalog: {
    searchButton: "Search",
    viewAll: (n: number) => `View all (${n})`,
    allProducts: (n: number) => `View all ${n} amulets`,
    allProductsHint: "Full grid view with search and sorting",
    leads: {
      "91638": "Yantra, coins and charms for trade and fortune",
      "41976": "Khun Paen, oils and takrut for charm and kindness",
      "102273": "Rahu and Thao Wessuwan for warding off bad luck",
    } as Record<string, string>,
  },

  langSwitch: {
    label: "Switch language",
    other: "ไทย",
    otherAria: "เปลี่ยนเป็นภาษาไทย",
  },
};

export const dict: Record<Lang, Dict> = { th, en };

export function getDict(lang: Lang): Dict {
  return dict[lang];
}

// ชื่ออาจารย์ภาษาอังกฤษ — สะกดตามหน้า /en ของเว็บ igetweb เดิม เพื่อให้ลูกค้าต่างชาติที่คุ้นชื่อเดิมค้นเจอ
export const MASTER_NAMES_EN: Record<string, string> = {
  amnard: "LP Amnard Mahaveero",
  subin: "AJ Subin Nanatong",
  yaem: "LP Yaem Wat Samgham",
  ram: "AJ Ram Horaram",
  surasak: "LP Maha Surasak Wat Pradoo",
  kalong: "LP Kalong",
  nenkaew: "LP Nienkaew Kumpeero",
  chuan: "LP Chuan Wat Khaokaew",
  puen: "LP Puen Wat Lardchado",
  boy: "AJ Boy Chiangmai",
  kraidech: "Ajarn Kraided Roied",
  koi: "LP Goy Wat Khao Din Tai",
  thongthaeng: "Ajarn Thongtang",
  watsuthat: "Wat Suthat Bangkok",
};

// ชื่อคลิปคาถาภาษาอังกฤษ (youtube id → ชื่อ) — สะกดตามชื่อบทความ/สินค้าฉบับ EN ที่ร้านใช้อยู่
// คลิปที่ไม่มีในตารางนี้ตกไปใช้ชื่อไทยตามเดิม
export const MASTER_VIDEO_TITLES_EN: Record<string, string> = {
  HF5yjfpxuyw: "Katha Kuman Nanathong by Arjarn Subin Nanathong",
  nsrlp9ssRlg: "Katha Prai Mae Thong Kam by Ajarn Subin",
  JU3BZbOZM44: "Katha Kumanthong Khumsub by Ajarn Ram Horaram",
};

// เดือนไทย → เลขเดือน สำหรับแปลง dateText/updatedAt ("26 กุมภาพันธ์ 2024 17:33") เป็นอังกฤษ
const TH_MONTHS: Record<string, number> = {
  มกราคม: 0, กุมภาพันธ์: 1, มีนาคม: 2, เมษายน: 3, พฤษภาคม: 4, มิถุนายน: 5,
  กรกฎาคม: 6, สิงหาคม: 7, กันยายน: 8, ตุลาคม: 9, พฤศจิกายน: 10, ธันวาคม: 11,
};
const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** แปลงวันที่ข้อความไทยเป็นอังกฤษ — แปลงไม่ได้ก็คืนค่าเดิม */
export function localizeDateText(text: string | null, lang: Lang): string | null {
  if (!text || lang !== "en") return text;
  const m = text.match(/(\d{1,2})\s+(\S+)\s+(\d{4})(?:\s+(\d{1,2}:\d{2}))?/);
  if (!m) return text;
  const month = TH_MONTHS[m[2]];
  if (month === undefined) return text;
  let year = Number(m[3]);
  if (year > 2400) year -= 543; // พ.ศ. → ค.ศ.
  return `${Number(m[1])} ${EN_MONTHS[month]} ${year}`;
}
