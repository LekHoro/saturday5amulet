// คลังคาถาสำหรับหน้า "คาถาประจำวัน"
//
// กติกาของไฟล์นี้ (สำคัญ):
// 1. ตัวบท (lines) ห้ามแต่งเพิ่มและห้ามแก้คำเอง — คัดจากบทความของร้าน หรือจากแหล่งที่ระบุใน
//    sourceUrl เท่านั้น ถ้าเห็นว่าสะกดผิด ให้เจ้าของร้านเป็นคนแก้ เพราะการเดาแก้คาถาคือการเปลี่ยนบท
// 2. บทที่มาจากบทความในเว็บใส่ sourceId หน้าคาถาจะลิงก์กลับไป — ได้ทั้งที่มาที่ตรวจสอบได้
//    และไม่ไปแย่ง SEO กับบทความของตัวเอง ส่วนบทที่รับมาจากข้างนอกใส่ origin (ชื่อตำรับ/ครูบาอาจารย์)
//    แล้วเก็บลิงก์ต้นทางไว้ที่ sourceUrl สำหรับตรวจย้อนหลัง ไม่ลิงก์ออกนอกเว็บจากหน้าคาถา
// 3. draft: true = ยังไม่ขึ้นหน้าเว็บ รอเจ้าของยืนยันถ้อยคำก่อน (ดู note ว่าติดตรงไหน)
//    บทที่ไม่มี draft เท่านั้นที่เข้าคิวคาถาประจำวันและแสดงในคลัง
// 4. ฉบับอังกฤษแปลเฉพาะชื่อ/สรรพคุณ/วิธีสวด — ตัวบทคงคำอ่านไทยไว้เหมือนเดิม
//    เพราะคาถาต้องออกเสียงตามเดิม ไม่ใช่แปลความหมาย

export interface Katha {
  slug: string;
  name: string;
  nameEn: string;
  /** ใช้ทำอะไร — ประโยคเดียว */
  purpose: string;
  purposeEn: string;
  /** ต้องตั้งนะโม 3 จบ ก่อนหรือไม่ */
  namo: boolean;
  /** ตัวบท แยกบรรทัดตามวรรคที่ควรหยุด */
  lines: string[];
  /** วิธีสวด/จำนวนจบ */
  how: string;
  howEn: string;
  /** ช่วงเวลาที่นิยมสวด — ว่างไว้ได้ */
  when?: string;
  whenEn?: string;
  /** id บทความต้นทางในเว็บ (/articles/<id>) — ไม่มีถ้าเป็นบทที่รับมาจากข้างนอก */
  sourceId?: string;
  /** ตำรับ/สายที่บทนี้มา เช่นชื่อครูบาอาจารย์หรือวัด — ใช้กับบทที่ไม่มีบทความในเว็บ */
  origin?: string;
  originEn?: string;
  /** ลิงก์ที่คัดตัวบทมา — เก็บไว้ตรวจย้อนหลังเท่านั้น ไม่แสดงบนหน้าเว็บ */
  sourceUrl?: string;
  /** ยังไม่ขึ้นหน้าเว็บ รอเจ้าของยืนยัน */
  draft?: boolean;
  /** ติดตรงไหน — สำหรับเจ้าของร้านอ่านตอนตรวจ ไม่ได้แสดงบนหน้าเว็บ */
  note?: string;
}

export const KATHA: Katha[] = [
  {
    slug: "rahu",
    name: "คาถาบูชาพระราหู",
    nameEn: "Katha for Phra Rahu",
    purpose: "สะเดาะเคราะห์ ผ่อนหนักเป็นเบา สำหรับดวงที่พระราหูทับหรือเล็งดวงชะตา",
    purposeEn:
      "Wards off misfortune and lightens a heavy year, for charts under the influence of Rahu",
    namo: true,
    lines: [
      "เอกะจักขุ นาฬิเกลา สุริยะประภา ราหูคาหา",
      "สัตตะ ระตะนะ สัมปันโน มณีโชติ ระโสยะถา",
      "สุวัณณะ รัชชะตะ สะมิทรา อะหังวันทามิ เมสะทาฯ",
      "เอกะจักขุ นาฬิเกลา จันทรประภา ราหูคาหา",
      "สัตตะ ระตะนะ สัมปันโน มณีโชติ ระโสยะถา",
      "สุวัณณะ รัชชะตะ สะมิทรา อะหังวันทามิ เมสะทาฯ",
    ],
    how: "ตั้งจิตให้เป็นสมาธิ ตั้งนะโม 3 จบ แล้วสวด 12 จบ",
    howEn: "Settle the mind, chant the Namo three times, then recite twelve times",
    when: "วันพุธกลางคืน พร้อมของไหว้สีดำ 12 อย่าง และธูปดำ 12 ดอก",
    whenEn: "Wednesday night, with twelve black offerings and twelve black incense sticks",
    sourceId: "263845",
  },
  {
    slug: "kho-khama",
    name: "คาถาขอขมากรรม",
    nameEn: "Katha of Apology to Past Karma",
    purpose: "ขอขมาเจ้ากรรมนายเวร สำหรับช่วงชีวิตติดขัด ไม่ราบรื่น",
    purposeEn:
      "Asks forgiveness from those wronged in past lives, for a stretch of life that keeps jamming",
    namo: true,
    lines: [
      "สัพพัง อะปะราธัง ขะมะถะเม ภันเต",
      "อุกาสะ ทะวารัตตะเยนะ กะตัง",
      "สัพพัง อะปะราธัง ขะมะถะเม ภันเต",
      "อุกาสะ ขะมามิ ภันเต",
    ],
    how: "ตั้งนะโม 3 จบ แล้วสวด จากนั้นกล่าวคำขอขมาด้วยความศรัทธาและเสียใจในสิ่งที่เคยทำ",
    howEn:
      "Chant the Namo three times, recite, then speak your apology sincerely and with real regret",
    when: "ทำปีละครั้ง คู่กับพิธีจุดธูป 36 ดอกกลางแจ้ง ก่อนเที่ยงวัน หันหน้าไปทางทิศตะวันออก",
    whenEn:
      "Once a year, alongside the outdoor 36-incense rite, before noon, facing east",
    sourceId: "256165",
  },
  {
    slug: "chao-thi",
    name: "บทสวดไหว้เจ้าที่เจ้าทาง",
    nameEn: "Katha for the Guardian of the Land",
    purpose: "ไหว้เจ้าที่ให้ค้าขายคล่อง กิจการรุ่งเรือง",
    purposeEn: "Honours the land guardian so trade flows and the business prospers",
    namo: false,
    lines: [
      "อิติสุคะโต อะระหังพุทโธ นะโมพุทธายะ",
      "ปะฐะวีคงคาพระภุมมะเทวา ขะมามิหัง",
    ],
    how: "จุดธูป 5 ดอก เทียน 2 เล่ม สวด 3 จบ แล้วกล่าวคำอธิษฐานขอเปิดทางทรัพย์",
    howEn:
      "Five incense sticks and two candles, recite three times, then state your wish for the day's trade",
    when: "ช่วงเช้าก่อน 10.09 น. — เปิดหน้าร้านไหว้ทุกวัน ทำบริษัทไหว้ทุกวันพระ",
    whenEn:
      "Mornings before 10:09 — daily for a shopfront, every Buddhist holy day for an office",
    sourceId: "276784",
  },

  // ---- สายโชคลาภ หนุนดวง (รับมาจากข้างนอก ไม่ได้อยู่ในบทความของร้าน) ----
  // เจ้าของร้านอนุญาตให้ดึงคาถาจากแหล่งอื่นเข้ามาเสริมได้ — เป็นบทโบราณที่เผยแพร่ทั่วไป
  // ไม่มีใครถือลิขสิทธิ์ตัวบท แต่ลิงก์ที่คัดมาเก็บไว้ที่ sourceUrl เผื่อต้องเทียบย้อนหลัง
  {
    slug: "ngoen-lan",
    name: "คาถาเงินล้าน",
    nameEn: "The Million Baht Katha",
    purpose: "เรียกทรัพย์ ปลดหนี้ หนุนการค้า — บทที่คนสวดกันมากที่สุดสายโชคลาภ",
    purposeEn:
      "Calls in wealth, clears debt and supports trade — the most widely recited wealth katha in Thailand",
    namo: true,
    lines: [
      "สัมปะจิตฉามิ นาสังสิโม",
      "พรหมา จะ มหาเทวา สัพเพยักขา ปะรายันติ",
      "พรหมา จะ มหาเทวา อภิลาภา ภะวันตุ เม",
      "มหาปุญโญ มหาลาโภ ภะวันตุ เม",
      "มิเตพาหุหะติ",
      "พุทธะมะอะอุ นะโมพุทธายะ",
      "วิระทะโย วิระโคนายัง วิระหิงสา",
      "วิระทาสี วิระทาสา วิระอิตถิโย",
      "พุทธัสสะ มานีมามะ พุทธัสสะ สวาโหม",
      "สัมปะติจฉามิ",
      "เพ็งๆ พาๆ หาๆ ฤาๆ",
    ],
    how: "ตั้งนะโม 3 จบ แล้วสวดวันละ 9 จบ ถ้าติดขัดหนักสวด 108 จบ จะแบ่งสวดเช้า–กลางวัน–เย็นก็ได้",
    howEn:
      "Chant the Namo three times, then recite nine times a day — 108 times when money is very tight. You may split the rounds across morning, midday and evening",
    origin: "หลวงพ่อฤๅษีลิงดำ วัดท่าซุง จ.อุทัยธานี",
    originEn: "Luang Por Ruesi Ling Dam, Wat Tha Sung, Uthai Thani",
    sourceUrl: "https://www.sanook.com/horoscope/105121/",
  },
  {
    slug: "wessuwan",
    name: "คาถาบูชาท้าวเวสสุวรรณ",
    nameEn: "Katha for Thao Wessuwan",
    purpose: "หนุนดวง ขจัดสิ่งอัปมงคล และขอทรัพย์ — สายเดียวกับที่คนบูชาแก้ปีชง",
    purposeEn:
      "Lifts the chart, clears ill omens and asks for wealth — the same line people turn to in an unlucky year",
    namo: true,
    lines: [
      "อิติปิ โส ภะคะวา ยมมะราชาโน ท้าวเวสสุวรรณโณ",
      "มะระณัง สุขัง อะหัง สุคะโต นะโม พุทธายะ",
      "ท้าวเวสสุวรรณโณ จาตุมะหาราชิกา ยักขะพันตาภัทภูริโต",
      "เวสสะ พุสะ พุทธัง อะระหัง พุทโธ ท้าวเวสสุวรรณโณ นะโม พุทธายะ",
    ],
    how: "ตั้งนะโม 3 จบ แล้วสวด 9 จบ",
    howEn: "Chant the Namo three times, then recite nine times",
    when: "ก่อนออกจากบ้านหรือก่อนนอน",
    whenEn: "Before leaving the house, or before sleep",
    origin: "ท้าวเวสสุวรรณ (ท้าวกุเวร) ชั้นจาตุมหาราชิกา — ฉบับย่อ",
    originEn: "Thao Wessuwan (Kuvera) of the Four Heavenly Kings — short version",
    sourceUrl:
      "https://www.krungsri.com/th/plearn-plearn/lifestyle/living/thao-wessuwan-worship-guide",
  },
  {
    slug: "siwali",
    name: "คาถาบูชาพระสีวลี",
    nameEn: "Katha for Phra Siwali",
    purpose: "ขอลาภสักการะ ค้าขายไม่ขาดสาย — พระสีวลีเป็นเอตทัคคะด้านลาภมาก",
    purposeEn:
      "Asks for a steady flow of gain and trade — Phra Siwali is foremost among monks in receiving offerings",
    namo: true,
    lines: [
      "สีวะลี จะ มะหาเถโร เทวะตานะระปูชิโต",
      "โสระโห ปัจจะยาทิมหิ อะหัง วันทามิ ตัง สะทา",
      "สีวะลี จะ มะหาเถโร ยักขะเทวาภิปูโต",
      "โสระโห ปัจจะยาทิมหิ อะหัง วันทามิ ตัง สะทา",
      "สีวะลีเถระคุณัง เอตัง โสตถิลาภัง ภะวันตุ เม",
    ],
    how: "ตั้งนะโม 3 จบ แล้วสวด 3, 5 หรือ 9 จบ",
    howEn: "Chant the Namo three times, then recite three, five or nine times",
    when: "ก่อนนอน หรือก่อนเปิดร้าน — จะเสกน้ำล้างหน้าด้วยก็ได้",
    whenEn: "Before sleep or before opening the shop — you may also bless washing water with it",
    origin: "พระสีวลีเถระ (พระฉิมพลี)",
    originEn: "Phra Siwali Thera (Phra Chimphli)",
    sourceUrl: "https://www.sanook.com/horoscope/230585/",
    note:
      "วรรค 'ยักขะเทวาภิปูโต' บางฉบับเขียนว่า 'ยักขะเทวาภิปูชิโต' ผมคงตามแหล่งที่คัดมา ถ้าเจ้าของถือฉบับไหนอยู่แก้ได้",
  },
  {
    slug: "nang-kwak",
    name: "คาถาบูชาแม่นางกวัก",
    nameEn: "Katha for Mae Nang Kwak",
    purpose: "กวักลูกค้าเข้าร้าน เรียกเงินเรียกทอง สายค้าขายโดยตรง",
    purposeEn: "Beckons customers into the shop and calls in money — squarely a trade katha",
    namo: true,
    lines: ["เอหิ จิตตัง มหาลาภัง ปิยัง มะมะ มามา"],
    how: "ตั้งนะโม 3 จบ จุดธูป 9 ดอก แล้วสวด",
    howEn: "Chant the Namo three times, light nine incense sticks, then recite",
    when: "ตั้งหิ้งหันหน้าออกนอกร้าน ถวายน้ำทุกวัน และถวายผลไม้อย่างน้อยสัปดาห์ละครั้ง",
    whenEn:
      "Set the shrine facing out of the shop, offer water daily and fruit at least once a week",
    origin: "แม่นางกวัก เครื่องรางสายค้าขาย — ฉบับย่อ",
    originEn: "Mae Nang Kwak, the beckoning-lady talisman — short version",
    sourceUrl: "https://www.thairath.co.th/horoscope/belief/2652468",
  },

  // ---- สายเมตตามหาเสน่ห์ (บทความ 17118) ----
  // เจ้าของร้านอนุญาตให้ใช้แล้ว ตัวบทคัดตามบทความทุกตัวอักษร
  // ส่วนคำอธิบายวิธีใช้เขียนใหม่เป็นสำนวนของร้านเอง ไม่ลอกวงเล็บอธิบายในบทความเดิม
  {
    slug: "phuk-jai",
    name: "คาถามหาเสน่ห์ผูกใจคน",
    nameEn: "Katha to Bind Goodwill",
    purpose: "ให้คนทั่วไปรักใคร่ยินดี เหมาะกับงานที่ต้องพบผู้คนเยอะ",
    purposeEn: "Draws general goodwill — useful when your work means meeting many people",
    namo: true,
    lines: ["โอมนะโมพุทธะ นะ มะ อะ อุ", "เอหิชัยยะ เอหิสัพเพชะนา พะหูชะนา เอหิ"],
    how: "ตั้งนะโม 3 จบ แล้วภาวนา จะเสกกับแป้งผัดหน้าหรือน้ำหอมด้วยก็ได้",
    howEn:
      "Chant the Namo three times, then recite — you may also recite it over face powder or perfume",
    sourceId: "17118",
  },
  {
    slug: "sek-paeng",
    name: "คาถาเสกแป้งผัดหน้า เมตตามหานิยม",
    nameEn: "Katha for Blessing Face Powder",
    purpose: "เสริมเมตตามหานิยมให้ผู้พบเห็นเอ็นดู",
    purposeEn: "Adds warmth and likeability in the eyes of those you meet",
    namo: true,
    lines: [
      "นะ เมตตาโม กรุณา พุทธาปราณี ธายินดี ยะเอ็นดู",
      "สัพพะปะสิทธิมัง ปิยัง มะมะ",
    ],
    how: "ตั้งนะโม 3 จบ เสกลงแป้งผัดหน้าหรือน้ำหอม แล้วลูบไล้ใบหน้าและร่างกาย",
    howEn:
      "Chant the Namo three times, recite over face powder or perfume, then apply it to face and body",
    sourceId: "17118",
  },
  {
    slug: "mon-rak",
    name: "คาถามนต์รักมหาเสน่ห์",
    nameEn: "Katha of the Love Charm",
    purpose: "ภาวนากับดอกไม้ที่จะมอบให้คนรัก",
    purposeEn: "Recited over flowers you are about to give someone you love",
    namo: true,
    lines: [
      "โอม นะ ปะ โร รันนะขุเภติ",
      "พุทธัง สะระติ จิตตัง สมาคะมา",
      "ธัมมัง สะระติ จิตตัง สมาคะมา",
      "สังฆัง สะระติ จิตตัง สมาคะมา",
    ],
    how: "ตั้งนะโม 3 จบ แล้วภาวนาลงบนดอกไม้ก่อนนำไปให้",
    howEn: "Chant the Namo three times, then recite over the flowers before handing them over",
    sourceId: "17118",
  },
  {
    slug: "khunphaen",
    name: "คาถาขุนแผนมหาเสน่ห์",
    nameEn: "Khun Phaen Charm Katha",
    purpose: "เสกกับของใช้ประจำตัวให้เป็นที่ต้องตาต้องใจ",
    purposeEn: "Recited over a personal item you carry, to draw attention and affection",
    namo: true,
    lines: ["เอหิมะมะ นะโมพุทธายะ นะมะพะทะ"],
    how: "ตั้งนะโม 3 จบ แล้วท่องกับของใช้ส่วนตัวชิ้นใดก็ได้ที่พกติดตัว",
    howEn: "Chant the Namo three times, then recite over any personal item you keep with you",
    sourceId: "17118",
  },
  {
    slug: "luangpu-suk",
    name: "คาถาเมตตามหาเสน่ห์ หลวงปู่ศุข",
    nameEn: "Metta Charm Katha of Luang Pu Suk",
    purpose: "สายเมตตามหานิยมของหลวงปู่ศุข วัดปากคลองมะขามเฒ่า",
    purposeEn:
      "In the metta lineage of Luang Pu Suk of Wat Pak Khlong Makham Thao",
    namo: true,
    lines: [
      "อักโขหะมัสสะมิ โลกัสสะ อิติปาระมิตาติงสา",
      "อิติสัพพัญญูมาคะตา อิติ โพธิมะนุปัตโต",
      "อิติปิโส จะ เต นะโม อะระหัง ลาโภ พุทโธ ลาภัง นะชาลีติ นะมะพะทะ",
      "สัพเพ ชะนา พหู ชะนา ราชาปุริโส อิตถิโยมาพัง",
      "เอหิ จิตตัง ปิยัง มะมะ เอหิ มาเร โส มามา อาคัจเฉยยะ อาคัจฉาหิ",
    ],
    how: "ตั้งนะโม 3 จบ แล้วภาวนา",
    howEn: "Chant the Namo three times, then recite",
    sourceId: "17118",
  },
  {
    slug: "en-du",
    name: "คาถาเอ็นดูมหาเสน่ห์",
    nameEn: "Katha to Win Kindness",
    purpose: "ท่องก่อนไปพบผู้หลักผู้ใหญ่ ให้ท่านรักใคร่เอ็นดู",
    purposeEn: "Recited before meeting seniors or elders, to be met with kindness",
    namo: true,
    lines: [
      "วิชชาจะระณะสัมปันโน อิติปิโสภะคะวา",
      "ปิยะเทวะมนุสสานัง ปิโยพรหมานะ มุตตะโม",
      "ปิโยนาคะ สุปัณณานัง ปิณินทะริยัง นะมามิหัง",
      "นะเมตตา โมกรุณา พุทปรานี ธายินดี ยะเอ็นดู",
    ],
    how: "ตั้งนะโม 3 จบ แล้วท่องก่อนเข้าพบ",
    howEn: "Chant the Namo three times, then recite before you go in",
    sourceId: "17118",
  },
  {
    slug: "sane-mahalap",
    name: "คาถาเสน่ห์มหาลาภ",
    nameEn: "Charm Katha for Great Fortune",
    purpose: "เรียกทรัพย์และโชคลาภ ควบสายเมตตา",
    purposeEn: "Calls in wealth and fortune, on the metta side",
    namo: true,
    lines: [
      "นะมามีมา มะหาลาภา อิติพุทธัสสะ",
      "สุวัณณังวา ระชะตังวา มะณีวา ธะนังวา",
      "พีชังวา อัตถังวา ปัตถังวา",
      "เอหิ เอหิ อาคัจเฉยยะ อิติมีมา นะมามิหัง",
    ],
    how: "ตั้งนะโม 3 จบ แล้วสวด 3 จบก่อนนอน และอีก 3 จบตอนเช้า",
    howEn:
      "Chant the Namo three times, then recite three times before bed and three more in the morning",
    sourceId: "17118",
  },
  {
    slug: "metta-chantho",
    name: "คาถาเมตตามหาเสน่ห์ (จันโท)",
    nameEn: "Chantho Metta Charm Katha",
    purpose: "บทมหาเสน่ห์ที่นิยมที่สุดในบทความ ใช้ก่อนออกไปพบผู้คน",
    purposeEn: "The most-cited charm katha in the article, used before going out to meet people",
    namo: true,
    lines: [
      "จันโท อะภิกันตะโร ปิติ ปิโย เทวะมนุสสานัง",
      "อิตถิโย ปุริโส มะ อะ อุ อุ มะ อะ อิสวาสุ อิกะวิติ",
    ],
    how: "ตั้งนะโม 3 จบ แล้วภาวนา 3 จบก่อนออกไปพบคน",
    howEn: "Chant the Namo three times, then recite three times before going out to meet people",
    sourceId: "17118",
    note:
      "เจ้าของยืนยันให้ใช้ฉบับนี้แล้ว — บทความ 17118 พิมพ์บทนี้ไว้ 4 ครั้งสะกดไม่ตรงกัน " +
      "(อะภกันตะโร/อะภิกันตะโร, อิตภิโยปุริ โส/อิตถิโย ปุริโส) ที่ใช้อยู่คือฉบับที่สะกดครบที่สุด",
  },
  {
    slug: "rak-khrai",
    name: "คาถารักใคร่ หลงรัก",
    nameEn: "Katha of Love and Longing",
    purpose: "เสกสีผึ้งทาปากก่อนไปพบคนที่หมายตา",
    purposeEn: "Recited over lip balm before meeting the person you have in mind",
    namo: true,
    lines: [
      "พุทโธ จับจิต ธัมโม จับใจ สังโฆ รักใคร่",
      "พุทโธ มามา ธัมโม มามา สังโฆ มามา",
      "นะเมตตา โมเห็นหน้ารักสนิท พุทจับจิต ธามิให้กำจัด",
      "ยะกระหวัดจิต …(ชื่อคนที่เรารัก)… รักอย่าละ",
      "ชีวิตัง ยาวะนิพพานัง สะระนัง คัจฉามิ ฯ",
    ],
    how: "ตั้งนะโม 3 จบ แล้วภาวนา เอ่ยชื่อคนที่ต้องการตรงช่องว่าง นิยมเสกกับสีผึ้งทาปาก",
    howEn:
      "Chant the Namo three times and recite, saying the person's name in the gap — usually recited over lip balm",
    sourceId: "17118",
    note: "เจ้าของยืนยันแล้ว — วรรค 'ธามิให้กำจัด' คงไว้ตามบทความ 17118 ไม่ต้องแก้",
  },
  {
    slug: "rak-thae",
    name: "คาถารักแท้มหาเสน่ห์",
    nameEn: "Katha for True Love",
    purpose: "บริกรรมกับลูกอม แล้วอมขณะคุยกับคนที่เรารัก",
    purposeEn: "Recited over a sweet, held in the mouth while talking with the one you love",
    namo: true,
    lines: [
      "โอมนะโมพุทธายะ พุทธัง สะระติ ธัมมัง สะระติ สังฆัง สะระติ",
      "จิตตังสะมาเรมะมะเอทิ เอหิชัยยะ เอหิสัพเพชะนา พะหูชะนา เอหิ",
    ],
    how: "ตั้งนะโม 3 จบ แล้วบริกรรมลงบนลูกอม",
    howEn: "Chant the Namo three times, then recite over the sweet",
    sourceId: "17118",
    note:
      "เจ้าของยืนยันแล้ว — บทความมีทั้ง 'พุทธัง สระติ' และ 'พุทธัง สะระติ' ที่ใช้คือฉบับหลัง",
  },
  {
    slug: "mat-jai",
    name: "คาถามัดใจมหาเสน่ห์",
    nameEn: "Katha to Hold the Heart",
    purpose: "สวดก่อนนอน ให้คนรักคิดถึง",
    purposeEn: "Recited before sleep, so the one you love thinks of you",
    namo: true,
    lines: [
      "พุทธัง รัตตะนัง ธัมมัง รัตตะนัง สังฆัง รัตตะนัง",
      "นะผูก โมมัด พุทรัด ธารึง ยะกรึงคะเร โอมสวาหะ",
    ],
    how: "ตั้งนะโม 3 จบ แล้วสวดภาวนาก่อนนอน",
    howEn: "Chant the Namo three times, then recite before sleep",
    sourceId: "17118",
    note:
      "เจ้าของยืนยันแล้ว — วรรคแรกใช้ฉบับที่ครบสามรัตนะ (พุทธัง/ธัมมัง/สังฆัง รัตตะนัง)",
  },
  {
    slug: "jai-on",
    name: "คาถามหาเสน่ห์ใจอ่อน",
    nameEn: "Katha to Soften a Hard Heart",
    purpose: "ท่องก่อนไปเจรจากับเจ้าหนี้หรือคู่กรณี ให้ผ่อนปรน",
    purposeEn: "Recited before negotiating with a creditor or opposing party, to soften the terms",
    namo: true,
    lines: [
      "ปัญจะมังสิระสังชาตัง นะอตใจ",
      "นะกาโร โหติ สัมภะโวตรีวานะ นะ การัง ปัญจะสัมภะวัง",
    ],
    how: "ตั้งนะโม 3 จบ แล้วท่องก่อนเข้าเจรจา",
    howEn: "Chant the Namo three times, then recite before the conversation",
    sourceId: "17118",
    note: "เจ้าของยืนยันแล้ว — คงวรรค 'นะอตใจ' และ 'สัมภะโวตรีวานะ' ตามบทความ 17118",
  },
];

/** เฉพาะบทที่พร้อมขึ้นหน้าเว็บ */
export const LIVE_KATHA = KATHA.filter((k) => !k.draft);

export function kathaBySlug(slug: string): Katha | undefined {
  return LIVE_KATHA.find((k) => k.slug === slug);
}

/**
 * คาถาประจำวัน — ผูกกับวันที่ตามเวลาไทย ทุกคนที่เปิดวันเดียวกันจึงเห็นบทเดียวกัน
 * และเปลี่ยนเองตอนเที่ยงคืน (ไม่ใช่การสุ่มใหม่ทุกครั้งที่รีเฟรช)
 */
export function kathaOfTheDay(now: Date = new Date()): Katha {
  const bangkokDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // "2026-08-13"
  const dayNumber = Math.floor(Date.parse(`${bangkokDate}T00:00:00Z`) / 86_400_000);
  return LIVE_KATHA[dayNumber % LIVE_KATHA.length];
}
