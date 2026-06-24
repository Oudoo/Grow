/**
 * GROW agency services — the marketing practice surfaced in the navbar
 * "Services" mega-menu and on the /services page. These are deliberately the
 * eye-catching, high-ceiling offerings that are still rare in the Egyptian
 * market — positioned ahead of the productized systems in the catalog.
 *
 * Bilingual; the Arabic is written to read natively, not as a literal gloss.
 */

export interface ServiceItem {
  name: string;
  nameAr: string;
  desc: string;
  descAr: string;
  /** Optional badge, e.g. a market-availability flag */
  badge?: string;
  badgeAr?: string;
}

export interface ServiceGroup {
  group: string;
  groupAr: string;
  /** lucide-react icon name resolved in the navbar/page */
  icon: string;
  blurb: string;
  blurbAr: string;
  services: ServiceItem[];
}

export const services: ServiceGroup[] = [
  {
    group: "AI Creative & Production",
    groupAr: "الإبداع والإنتاج بالذكاء الاصطناعي",
    icon: "Sparkles",
    blurb: "Creative produced and tested at a volume the market can't match.",
    blurbAr: "إبداعٌ يُنتَج ويُختبَر بحجمٍ لا يضاهيه السوق.",
    services: [
      { name: "AI UGC & Avatar Ads", nameAr: "إعلانات UGC والأفاتار بالذكاء الاصطناعي", desc: "Lifelike creator-style video ads generated and localized in days, not weeks.", descAr: "إعلانات فيديو بأسلوب صنّاع المحتوى تُولَّد وتُحلّى محليًا في أيام، لا أسابيع.", badge: "Rare in Egypt", badgeAr: "نادرٌ في مصر" },
      { name: "Generative Creative Testing", nameAr: "اختبار الإبداع التوليدي", desc: "Hundreds of ad variants generated and battle-tested weekly to find the winners.", descAr: "مئات النسخ الإعلانية تُولَّد وتُختبَر أسبوعيًا للوصول إلى الأفضل أداءً." },
      { name: "AI Video Localization & Dubbing", nameAr: "ترجمة ودبلجة الفيديو بالذكاء الاصطناعي", desc: "One asset, every dialect — voice-matched dubbing for Gulf, Levant, and Egyptian markets.", descAr: "أصلٌ واحد بكل اللهجات — دبلجةٌ مطابقةٌ للصوت للأسواق الخليجية والشامية والمصرية." },
    ],
  },
  {
    group: "Growth Engineering",
    groupAr: "هندسة النمو",
    icon: "FlaskConical",
    blurb: "Decisions modeled before budget moves — proof, not opinion.",
    blurbAr: "قراراتٌ تُنمذَج قبل تحريك الميزانية — دليلٌ لا رأي.",
    services: [
      { name: "Marketing Mix Modeling", nameAr: "نمذجة المزيج التسويقي", desc: "Privacy-safe incrementality: know what each channel truly drives, not last-click fiction.", descAr: "قياس الأثر الفعلي بخصوصيةٍ تامة: اعرف ما يحققه كل قناةٍ حقًا، لا وهم النقرة الأخيرة.", badge: "Rare in Egypt", badgeAr: "نادرٌ في مصر" },
      { name: "AEO / GEO — Rank in AI Answers", nameAr: "الظهور داخل إجابات الذكاء الاصطناعي", desc: "Engineer your brand to be cited inside ChatGPT, Perplexity, and Gemini answers.", descAr: "هندسة علامتك لتُذكَر داخل إجابات ChatGPT وPerplexity وGemini.", badge: "New category", badgeAr: "فئةٌ جديدة" },
      { name: "Predictive Audiences & Clean Room", nameAr: "الجماهير التنبؤية وغرفة البيانات النظيفة", desc: "First-party data activated with churn and lifetime-value prediction, privacy intact.", descAr: "تفعيل بيانات الطرف الأول مع التنبؤ بالتسرّب والقيمة الدائمة، مع صون الخصوصية." },
      { name: "Experimentation Program", nameAr: "برنامج التجريب", desc: "A standing test pipeline that compounds conversion across site, app, and funnel.", descAr: "خط اختباراتٍ دائم يُراكم التحويل عبر الموقع والتطبيق والقمع." },
    ],
  },
  {
    group: "Lifecycle & Retention",
    groupAr: "دورة الحياة والاحتفاظ",
    icon: "Repeat",
    blurb: "Turn first purchases into compounding revenue.",
    blurbAr: "حوِّل أول عمليةٍ شراء إلى إيرادٍ متراكم.",
    services: [
      { name: "Retention & Lifecycle Automation", nameAr: "أتمتة الاحتفاظ ودورة الحياة", desc: "RFM-driven journeys that win back, upsell, and rescue at-risk customers automatically.", descAr: "رحلاتٌ مبنيةٌ على RFM تستعيد العملاء وتزيد المبيعات وتُنقذ المعرّضين للفقد تلقائيًا." },
      { name: "WhatsApp Commerce & Conversational CRM", nameAr: "التجارة عبر واتساب وإدارة العلاقات الحوارية", desc: "Sell, support, and re-engage inside the channel your customers actually live in.", descAr: "بِع وادعم وأعد التفاعل داخل القناة التي يعيش فيها عملاؤك فعلًا.", badge: "Built for MENA", badgeAr: "مصمّمٌ للمنطقة" },
      { name: "Loyalty & Referral Engines", nameAr: "أنظمة الولاء والإحالة", desc: "Programs that make your best customers your cheapest acquisition channel.", descAr: "برامجٌ تجعل أفضل عملائك أرخص قنوات استحواذك." },
    ],
  },
];

/** Slug set used by the navbar to split the Products mega-menu into
 *  Creative vs Tech even when the DB rows lack the category column. */
export const CREATIVE_SUITE_SLUGS = new Set([
  "ultimate-bundle",
  "marketing-growth",
  "social-content",
  "media-buying",
]);

export function isCreativeSuite(suite: { slug: string; category?: string }): boolean {
  return suite.category === "creative" || CREATIVE_SUITE_SLUGS.has(suite.slug);
}
