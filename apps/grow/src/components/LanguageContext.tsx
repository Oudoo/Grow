"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { EcosystemSuite } from "@/lib/types";

export type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
  ecosystem: EcosystemSuite[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    "nav.about": "About Us",
    "nav.about.title": "The Growth Institution",
    "nav.about.desc": "GROW unifies creative excellence with enterprise infrastructure. Strategy, content, performance, and predictive systems — one integrated body.",
    "nav.about.link": "Read the Manifesto",
    "nav.methodology": "Methodology",
    "nav.methodology.desc": "The GROW operating protocol for compounding growth.",
    "nav.suites": "Business Solutions",
    "nav.suites.desc": "Enterprise systems engineered to run your entire operation.",
    "nav.products": "Products",
    "nav.products.desc": "Browse every system in the GROW ecosystem.",
    "nav.products.creative": "Creative Products",
    "nav.products.tech": "Tech Products",
    "nav.services": "Services",
    "nav.services.eyebrow": "The Marketing Practice",
    "nav.services.title": "Growth services most agencies here can't run.",
    "nav.services.all": "See all services",
    "nav.suites.eyebrow": "Business Solutions",
    "nav.suites.title": "Marketing, social, media buying & enterprise systems.",
    "nav.audit": "Ignite My Growth",
    "nav.audit.short": "Ignite Growth",

    // Home Page Hero — agency first
    "hero.title": "Marketing, Engineered as Infrastructure.",
    "hero.subtitle": "GROW is the integrated agency. Creative, media, content, and enterprise systems —",
    "hero.subtitle.highlight": "Operating as One",
    "hero.explore": "Start a Growth Engagement",
    "hero.contact": "Talk to Strategy",
    "hero.challenge.default": "Select Bottleneck...",
    "hero.challenge.1": "Rising CAC & Flat Conversion",
    "hero.challenge.2": "Fragmented Brand & Content Output",
    "hero.challenge.3": "No Visibility Into Marketing ROI",
    "hero.challenge.4": "Disconnected Operations & Data Silos",
    "hero.query.placeholder": "Describe your growth bottleneck...",
    "hero.diagnose.btn": "Diagnose Now",

    // Services page
    "services.page.eyebrow": "The Marketing Practice",
    "services.page.title": "Services Built to Win, Not to Fill a Deck.",
    "services.page.subtitle": "The high-ceiling growth services most agencies in the region simply can't run — engineered, measured, and accountable.",
    "services.page.cta.title": "Ready to run marketing that compounds?",
    "services.page.cta.desc": "Start with a growth audit. We diagnose the bottleneck, model the upside, and show you the plan before you commit.",

    // Services — the agency practice (homepage)
    "services.eyebrow": "The Agency Practice",
    "services.title": "Four Disciplines. One Infrastructure.",
    "services.subtitle": "Every engagement runs on the same foundation: verified data, predictive modeling, and industrial execution.",
    "services.1.title": "Brand & Creative",
    "services.1.desc": "Identity systems, campaign creative, and design languages built to institutional standard. Quietly dominant, never decorative.",
    "services.2.title": "Performance Media",
    "services.2.desc": "Paid acquisition across Meta, Google, TikTok, and LinkedIn. Every dollar attributed. Every decision modeled before it is made.",
    "services.3.title": "Content Engine",
    "services.3.desc": "Editorial systems and production pipelines that publish with industrial cadence — measured by reach, citeability, and conversion.",
    "services.4.title": "Growth Intelligence",
    "services.4.desc": "Forecasting, seasonality modeling, and anomaly detection on verified first-party data. Facts, not opinions.",
    "services.upsell.title": "Then We Go Further.",
    "services.upsell.desc": "Most agencies stop at campaigns. GROW deploys the enterprise systems underneath — CRM, ERP, HR, logistics — so growth compounds on solid infrastructure.",
    "services.upsell.cta": "Explore Business Solutions",

    // Methodology Page
    "methodology.title": "The GROW Methodology",
    "methodology.subtitle": "One operating protocol. Three phases. Compounding growth.",
    "methodology.1.title": "1. Diagnose",
    "methodology.1.desc": "We map your funnel, brand position, media spend, and operations. Every bottleneck is measured, quantified, and ranked by revenue impact.",
    "methodology.2.title": "2. Strategize",
    "methodology.2.desc": "Our strategists architect an integrated growth plan — creative direction, channel mix, content cadence, and the systems that support them.",
    "methodology.3.title": "3. Execute",
    "methodology.3.desc": "Campaigns ship. Systems deploy. Telemetry tracks every metric, and we optimize on evidence — not opinion.",
    "methodology.1.sub1": "Full-Funnel & Brand Position Audit",
    "methodology.1.sub2": "Media Spend & Channel Efficiency Analysis",
    "methodology.1.sub3": "Marketing Stack & Data Integrity Mapping",
    "methodology.2.sub1": "Integrated Growth Architecture",
    "methodology.2.sub2": "Channel Mix & Content Engine Blueprinting",
    "methodology.2.sub3": "Predictive ROI & Budget Modeling",
    "methodology.3.sub1": "Campaign Launch & Creative Production",
    "methodology.3.sub2": "Cross-Channel Orchestration",
    "methodology.3.sub3": "Continuous Telemetry & Growth Tracking",
    "methodology.protocol": "The Protocol",
    "methodology.protocol.desc": "We do not guess. We measure, model, and execute with absolute precision.",

    // Growth Intelligence Platform showcase
    "dashboard.title": "The Growth Intelligence Platform",
    "dashboard.subtitle": "Every campaign, channel, and client metric — collected, verified, modeled, and explained in one system.",
    "dashboard.kpi1.label": "Revenue Influenced",
    "dashboard.kpi1.value": "$1.2B Tracked",
    "dashboard.kpi2.label": "Customers Reached",
    "dashboard.kpi2.value": "80K Activated",
    "dashboard.kpi3.label": "Events Processed",
    "dashboard.kpi3.value": "15M Modeled",
    "dashboard.live_feed": "Live System Feed",
    "dashboard.feed.1": "Attribution model reconciled Meta and GA4 conversions for quarterly reporting.",
    "dashboard.feed.2": "Predictive engine reallocated budget toward the highest-yield channel cohort.",
    "dashboard.feed.3": "Creative test #418 reached significance; winning variant promoted to scale.",
    "dashboard.feed.4": "Pipeline velocity adjusted from real-time CRM and media telemetry.",
    "dashboard.feed.5": "CAC anomaly detected, verified against source data, and flagged for review.",

    // Business Solutions (Suites) Page — the upsell
    "suites.title": "Business Solutions",
    "suites.subtitle": "Beyond the agency: enterprise systems engineered to run your entire operation.",
    "suites.bundle.title": "The One Ecosystem Bundle",
    "suites.bundle.desc": "The complete enterprise transformation package. Full access to all suites and systems with dedicated architectural support — one source of truth, limitless scale.",
    "suites.view_products": "View Systems",

    // Products
    "products.title": "Solution Catalog",
    "products.subtitle": "Every system in the GROW ecosystem — built to integrate, engineered to scale.",
    "products.filter.all": "All Systems",
    "products.view_details": "View Details",
    "product.back": "Back to Catalog",
    "product.capabilities.title": "Technical Capabilities",
    "product.capabilities.subtitle": "Built for scale, security, and performance.",
    "product.capabilities.desc": "Integrates with Grow Core to unlock this capability across your organization.",
    "product.arch.title": "Integration Architecture",
    "product.arch.subtitle": "How this system connects to the core.",
    "product.arch.edge": "Edge Node",
    "product.arch.sync": "SYNC / DATA_LAKE",
    "product.arch.core": "Grow Core",
    "product.arch.core.desc": "Central Database",

    // ROI
    "roi.title": "Marketing Growth Calculator",
    "roi.subtitle": "See the additional sales GROW's marketing engine can generate on top of what you spend today.",
    "roi.inputs.title": "Your Current Marketing",
    "roi.inputs.budget": "Monthly Marketing Budget",
    "roi.inputs.aov": "Average Order Value",
    "roi.inputs.roas": "Current ROAS (Return on Ad Spend)",
    "roi.inputs.roas.desc": "Revenue you currently earn for every $1 of media spend.",
    "roi.inputs.uplift": "Modeled GROW Performance Uplift",
    "roi.outputs.sales": "Estimated Additional Annual Sales",
    "roi.outputs.sales.desc": "Incremental revenue GROW's creative, media, and conversion engine adds on top of your current performance — modeled on your inputs.",
    "roi.outputs.roas": "Projected ROAS",
    "roi.outputs.roas.unit": "x",
    "roi.outputs.customers": "New Customers",
    "roi.outputs.customers.unit": "/mo",

    // About Us Page
    "about.hero.title": "We exist to",
    "about.hero.highlight": "industrialize",
    "about.hero.title.end": "growth.",
    "about.hero.desc": "GROW is not a vendor. We are the integrated institution where brand, media, content, and enterprise systems operate as one — measured, modeled, and accountable.",
    "about.process.title": "The Operating Process",
    "about.process.subtitle": "Rigorous diagnosis before precise execution.",
    "about.process.1.title": "Diagnostic Phase",
    "about.process.1.desc": "We embed inside your funnel and your operation, identifying wasted spend, fragmented output, and the bottlenecks that cap growth.",
    "about.process.2.title": "Strategic Alignment",
    "about.process.2.desc": "We architect an integrated roadmap. Every campaign and every system targets a measured bottleneck with a forecast return.",
    "about.process.3.title": "Execution at Scale",
    "about.process.3.desc": "Creative ships, media scales, and the supporting infrastructure deploys — orchestrated as one program with full telemetry.",
    "about.philosophy.title": "The Institutional Protocol.",
    "about.philosophy.1.title": "Operational Parity",
    "about.philosophy.1.desc": "Marketing and operations read from the same verified data. We eradicate silos so every decision is made on synchronous intelligence.",
    "about.philosophy.2.title": "Capital Efficiency",
    "about.philosophy.2.desc": "Every dollar of spend is attributed and every manual hour is automated. Growth compounds when nothing leaks.",
    "about.philosophy.3.title": "Predictive Modeling",
    "about.philosophy.3.desc": "We forecast before we spend. Seasonality, channel yield, and pipeline are modeled continuously — decisions precede outcomes.",
    "about.philosophy.badge": "Institutional Tech Architecture",
    "about.team.subtitle": "The people accountable for your growth.",
    "about.team.1.name": "Dr. Ahmed Alaa",
    "about.team.1.role": "Chief Executive Officer",
    "about.team.1.desc": "Sets the growth thesis and holds every engagement to measured outcomes — strategy translated into market motion.",
    "about.team.2.name": "Dr. Shennawy",
    "about.team.2.role": "Board Member",
    "about.team.2.desc": "Brings institutional governance and long-horizon strategy, anchoring the firm's discipline and standards.",
    "about.team.3.name": "Mahmoud Hassan",
    "about.team.3.role": "Chief Technology Officer",
    "about.team.3.desc": "Orchestrates macroscopic data strategies and ensures architectural integrity across all deployments.",
    "about.team.4.name": "Danya Mohamed",
    "about.team.4.role": "Marketing Manager",
    "about.team.4.desc": "Runs the creative and campaign engine that turns positioning into measurable demand across channels.",
    "about.cta.title.start": "The Cost of Fragmentation is",
    "about.cta.title.highlight": "Exponential.",
    "about.cta.desc": "Every quarter run on disconnected agencies, tools, and spreadsheets is growth permanently lost. Consolidate the function. Run it as infrastructure.",
    "about.cta.button": "Initiate Growth Audit",
  },
  ar: {
    // Navbar
    "nav.about": "من نحن",
    "nav.about.title": "مؤسسة النمو",
    "nav.about.desc": "توحّد GROW التميز الإبداعي مع البنية التحتية المؤسسية. الاستراتيجية والمحتوى والأداء والأنظمة التنبؤية — كيان واحد متكامل.",
    "nav.about.link": "اقرأ بياننا",
    "nav.methodology": "منهجيتنا",
    "nav.methodology.desc": "بروتوكول التشغيل من GROW لنموٍ متراكم.",
    "nav.suites": "حلول الأعمال",
    "nav.suites.desc": "أنظمة مؤسسية مصممة لإدارة عملياتك بالكامل.",
    "nav.products": "المنتجات",
    "nav.products.desc": "تصفح جميع أنظمة منظومة GROW.",
    "nav.products.creative": "المنتجات الإبداعية",
    "nav.products.tech": "المنتجات التقنية",
    "nav.services": "الخدمات",
    "nav.services.eyebrow": "ممارسات التسويق",
    "nav.services.title": "خدمات نموٍّ يعجز معظم الوكالات هنا عن تقديمها.",
    "nav.services.all": "اطّلع على كل الخدمات",
    "nav.suites.eyebrow": "حلول الأعمال",
    "nav.suites.title": "تسويق وسوشيال وشراء إعلانات وأنظمة مؤسسية.",
    "nav.audit": "أطلق نموّك الآن",
    "nav.audit.short": "أطلق نموّك",

    // Home Page Hero — agency first
    "hero.title": "تسويق يُدار كبنية تحتية.",
    "hero.subtitle": "GROW هي الوكالة المتكاملة. الإبداع والإعلام والمحتوى وأنظمة المؤسسات —",
    "hero.subtitle.highlight": "تعمل ككيان واحد",
    "hero.explore": "ابدأ شراكة نموّ",
    "hero.contact": "تحدّث مع فريق الاستراتيجية",
    "hero.challenge.default": "اختر التحدّي...",
    "hero.challenge.1": "ارتفاع تكلفة الاستحواذ وثبات التحويل",
    "hero.challenge.2": "تشتت الهوية وإنتاج المحتوى",
    "hero.challenge.3": "غياب الرؤية حول عائد التسويق",
    "hero.challenge.4": "عمليات منفصلة وصوامع بيانات",
    "hero.query.placeholder": "صف تحدي النمو لديك...",
    "hero.diagnose.btn": "شخّص الآن",

    // Services page
    "services.page.eyebrow": "ممارسات التسويق",
    "services.page.title": "خدماتٌ صُمِّمت لتُحقّق الفوز، لا لتملأ عرضًا تقديميًا.",
    "services.page.subtitle": "خدمات النمو ذات السقف العالي التي يعجز معظم الوكالات في المنطقة عن تقديمها — مُهندَسة، ومقيسة، وخاضعة للمساءلة.",
    "services.page.cta.title": "جاهزٌ لتسويقٍ يتراكم أثره؟",
    "services.page.cta.desc": "ابدأ بتدقيق نمو. نُشخّص العائق، ونُنمذج العائد المتوقع، ونعرض لك الخطة قبل أن تلتزم بأي شيء.",

    // Services — the agency practice (homepage)
    "services.eyebrow": "ممارسات الوكالة",
    "services.title": "أربعة تخصصات. بنية تحتية واحدة.",
    "services.subtitle": "كل شراكةٍ تقوم على الأساس نفسه: بياناتٌ موثّقة، ونمذجةٌ تنبؤية، وتنفيذٌ بدقّةٍ صناعية.",
    "services.1.title": "العلامة والإبداع",
    "services.1.desc": "أنظمة هويةٍ وإبداع حملاتٍ ولغات تصميمٍ وفق معايير مؤسسية. حضورٌ هادئٌ ومهيمن، لا زخرفة.",
    "services.2.title": "وسائط الأداء المدفوعة",
    "services.2.desc": "استحواذٌ مدفوع عبر Meta وGoogle وTikTok وLinkedIn. كل جنيهٍ يُنسب لمصدره، وكل قرارٍ يُنمذَج قبل اتخاذه.",
    "services.3.title": "محرك المحتوى",
    "services.3.desc": "أنظمة تحريرية وخطوط إنتاج تنشر بإيقاع صناعي — تُقاس بالوصول والاستشهاد والتحويل.",
    "services.4.title": "ذكاء النمو",
    "services.4.desc": "تنبؤ ونمذجة موسمية وكشف شذوذ على بيانات طرف أول موثقة. حقائق لا آراء.",
    "services.upsell.title": "ثم نذهب أبعد.",
    "services.upsell.desc": "تتوقف معظم الوكالات عند الحملات. أما GROW فتنشر الأنظمة المؤسسية تحتها — CRM وERP والموارد البشرية واللوجستيات — ليتراكم النمو على بنية صلبة.",
    "services.upsell.cta": "استكشف حلول الأعمال",

    // Methodology Page
    "methodology.title": "منهجية GROW",
    "methodology.subtitle": "بروتوكول تشغيل واحد. ثلاث مراحل. نمو متراكم.",
    "methodology.1.title": "1. التشخيص",
    "methodology.1.desc": "نرسم خريطة قمعك التسويقي وموقع علامتك وإنفاقك الإعلامي وعملياتك. كل عائق يُقاس ويُحدد كمياً ويُرتب حسب أثره على الإيرادات.",
    "methodology.2.title": "2. الاستراتيجية",
    "methodology.2.desc": "يصمم استراتيجيونا خطة نمو متكاملة — اتجاه إبداعي ومزيج قنوات وإيقاع محتوى والأنظمة الداعمة لها.",
    "methodology.3.title": "3. التنفيذ",
    "methodology.3.desc": "الحملات تنطلق. الأنظمة تُنشر. القياس يتتبع كل مؤشر، ونحسّن بناءً على الدليل لا الرأي.",
    "methodology.1.sub1": "تدقيق كامل للقمع وموقع العلامة",
    "methodology.1.sub2": "تحليل الإنفاق الإعلامي وكفاءة القنوات",
    "methodology.1.sub3": "رسم خريطة الأدوات التسويقية وسلامة البيانات",
    "methodology.2.sub1": "هندسة نمو متكاملة",
    "methodology.2.sub2": "مخطط مزيج القنوات ومحرك المحتوى",
    "methodology.2.sub3": "نمذجة تنبؤية للعائد والميزانية",
    "methodology.3.sub1": "إطلاق الحملات والإنتاج الإبداعي",
    "methodology.3.sub2": "تنسيق متزامن عبر القنوات",
    "methodology.3.sub3": "قياس مستمر وتتبع دقيق للنمو",
    "methodology.protocol": "البروتوكول",
    "methodology.protocol.desc": "نحن لا نخمّن. نقيس، وننمذج، وننفذ بدقة مطلقة.",

    // Growth Intelligence Platform showcase
    "dashboard.title": "منصة ذكاء النمو",
    "dashboard.subtitle": "كل حملة وقناة ومؤشر — يُجمع ويُوثق ويُنمذج ويُفسر في نظام واحد.",
    "dashboard.kpi1.label": "إيرادات متأثرة",
    "dashboard.kpi1.value": "$1.2B متتبعة",
    "dashboard.kpi2.label": "عملاء تم الوصول إليهم",
    "dashboard.kpi2.value": "80K مفعّلون",
    "dashboard.kpi3.label": "أحداث معالجة",
    "dashboard.kpi3.value": "15M منمذجة",
    "dashboard.live_feed": "البث الحي للنظام",
    "dashboard.feed.1": "نموذج الإسناد طابق تحويلات Meta وGA4 لتقارير الربع.",
    "dashboard.feed.2": "المحرك التنبؤي أعاد توزيع الميزانية نحو القناة الأعلى مردوداً.",
    "dashboard.feed.3": "اختبار إبداعي #418 بلغ الدلالة الإحصائية؛ تم ترقية النسخة الفائزة.",
    "dashboard.feed.4": "تعديل سرعة خط المبيعات من بيانات CRM والإعلام اللحظية.",
    "dashboard.feed.5": "رصد شذوذ في تكلفة الاستحواذ والتحقق منه مقابل بيانات المصدر.",

    // Business Solutions (Suites) Page — the upsell
    "suites.title": "حلول الأعمال",
    "suites.subtitle": "أبعد من الوكالة: أنظمة مؤسسية مصممة لإدارة عملياتك بالكامل.",
    "suites.bundle.title": "باقة المنظومة الواحدة",
    "suites.bundle.desc": "باقة التحول المؤسسي الكاملة. وصول كامل لجميع الحزم والأنظمة مع دعم هندسي مخصص — مصدر واحد للحقيقة وتوسع بلا حدود.",
    "suites.view_products": "استعراض الأنظمة",

    // Products
    "products.title": "دليل الحلول",
    "products.subtitle": "كل نظام في منظومة GROW — مبني ليتكامل ومُهندَس ليتوسع.",
    "products.filter.all": "جميع الأنظمة",
    "products.view_details": "عرض التفاصيل",
    "product.back": "العودة للدليل",
    "product.capabilities.title": "القدرات الفنية",
    "product.capabilities.subtitle": "بنية مصممة لأعلى معايير الأمان والتوسع والأداء.",
    "product.capabilities.desc": "يتكامل مع Grow Core لإطلاق هذه القدرة عبر مؤسستك.",
    "product.arch.title": "بنية التكامل المؤسسي",
    "product.arch.subtitle": "كيف يرتبط هذا النظام بالنواة المركزية.",
    "product.arch.edge": "نقطة الاتصال الطرفية",
    "product.arch.sync": "التزامن / بحيرة البيانات",
    "product.arch.core": "نواة Grow",
    "product.arch.core.desc": "قاعدة البيانات المركزية",

    // ROI
    "roi.title": "حاسبة النمو التسويقي",
    "roi.subtitle": "شاهد المبيعات الإضافية التي يحققها محرك GROW التسويقي فوق ما تنفقه اليوم.",
    "roi.inputs.title": "تسويقك الحالي",
    "roi.inputs.budget": "ميزانية التسويق الشهرية",
    "roi.inputs.aov": "متوسط قيمة الطلب",
    "roi.inputs.roas": "العائد الحالي على الإنفاق الإعلاني",
    "roi.inputs.roas.desc": "الإيراد الذي تحققه حاليًا مقابل كل دولارٍ تنفقه على الإعلانات.",
    "roi.inputs.uplift": "تحسّن الأداء المتوقع مع GROW",
    "roi.outputs.sales": "المبيعات السنوية الإضافية المقدّرة",
    "roi.outputs.sales.desc": "الإيراد الإضافي الذي يضيفه محرك GROW الإبداعي والإعلامي والتحويلي فوق أدائك الحالي — مُنمذَجٌ بناءً على مدخلاتك.",
    "roi.outputs.roas": "العائد المتوقع على الإنفاق",
    "roi.outputs.roas.unit": "×",
    "roi.outputs.customers": "عملاء جدد",
    "roi.outputs.customers.unit": "/شهريًا",

    // About Us Page
    "about.hero.title": "نحن هنا لكي",
    "about.hero.highlight": "نُصنّع",
    "about.hero.title.end": "النمو.",
    "about.hero.desc": "GROW ليست مورّداً. نحن المؤسسة المتكاملة حيث تعمل العلامة والإعلام والمحتوى وأنظمة المؤسسات ككيان واحد — مقاس ومنمذج وخاضع للمساءلة.",
    "about.process.title": "عملية التشغيل",
    "about.process.subtitle": "تشخيص صارم يسبق تنفيذاً دقيقاً.",
    "about.process.1.title": "مرحلة التشخيص",
    "about.process.1.desc": "نتعمق داخل قمعك التسويقي وعملياتك، فنحدد الإنفاق المهدور والإنتاج المشتت والعوائق التي تسقف النمو.",
    "about.process.2.title": "المواءمة الاستراتيجية",
    "about.process.2.desc": "نهندس خارطة طريق متكاملة. كل حملة وكل نظام يستهدف عائقاً مقاساً بعائد متوقع.",
    "about.process.3.title": "التنفيذ على نطاق واسع",
    "about.process.3.desc": "الإبداع ينطلق، والإعلام يتوسع، والبنية الداعمة تُنشر — برنامج واحد منسق بقياس كامل.",
    "about.philosophy.title": "البروتوكول المؤسسي.",
    "about.philosophy.1.title": "التكافؤ التشغيلي",
    "about.philosophy.1.desc": "التسويق والعمليات يقرآن من البيانات الموثقة ذاتها. نقضي على الصوامع ليُتخذ كل قرار على ذكاء متزامن.",
    "about.philosophy.2.title": "كفاءة رأس المال",
    "about.philosophy.2.desc": "كل دولار إنفاق يُنسب لمصدره وكل ساعة يدوية تُؤتمت. النمو يتراكم حين لا يتسرب شيء.",
    "about.philosophy.3.title": "النمذجة التنبؤية",
    "about.philosophy.3.desc": "نتنبأ قبل أن ننفق. الموسمية ومردود القنوات وخط المبيعات تُنمذج باستمرار — القرار يسبق النتيجة.",
    "about.philosophy.badge": "بنية تقنية مؤسسية",
    "about.team.subtitle": "مَن يتحمّلون مسؤولية نموّك.",
    "about.team.1.name": "د. أحمد علاء",
    "about.team.1.role": "الرئيس التنفيذي",
    "about.team.1.desc": "يضع رؤية النمو ويُخضع كل شراكةٍ لنتائج مقيسة — استراتيجيةٌ تتحوّل إلى حركةٍ في السوق.",
    "about.team.2.name": "د. الشناوي",
    "about.team.2.role": "عضو مجلس الإدارة",
    "about.team.2.desc": "يُرسي الحوكمة المؤسسية والاستراتيجية بعيدة المدى، ويثبّت انضباط الشركة ومعاييرها.",
    "about.team.3.name": "محمود حسن",
    "about.team.3.role": "الرئيس التنفيذي للتكنولوجيا",
    "about.team.3.desc": "ينسّق استراتيجيات البيانات الكلية ويضمن سلامة البنية التحتية عبر جميع عمليات النشر.",
    "about.team.4.name": "دانيا محمد",
    "about.team.4.role": "مديرة التسويق",
    "about.team.4.desc": "تقود محرك الإبداع والحملات الذي يحوّل التموضع إلى طلبٍ قابلٍ للقياس عبر القنوات.",
    "about.cta.title.start": "تكلفة التشتت",
    "about.cta.title.highlight": "تتصاعد أسياً.",
    "about.cta.desc": "كل ربع سنة يُدار عبر وكالات وأدوات وجداول منفصلة هو نمو مفقود للأبد. وحّد الوظيفة، وأدرها كبنية تحتية.",
    "about.cta.button": "ابدأ تدقيق النمو",
  }
};

export function LanguageProvider({ children, initialEcosystem }: { children: React.ReactNode, initialEcosystem: EcosystemSuite[] }) {
  const [language, setLanguage] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Hydration guard: restoring the persisted language and revealing content on
    // mount must run client-side, so setting state here is intentional.
    /* eslint-disable react-hooks/set-state-in-effect */
    const savedLang = localStorage.getItem("grow-lang") as Language;
    if (savedLang) setLanguage(savedLang);
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "ar" : "en";
    setLanguage(newLang);
    localStorage.setItem("grow-lang", newLang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, ecosystem: initialEcosystem }}>
      <div dir={language === "ar" ? "rtl" : "ltr"} className={language === "ar" ? "font-arabic" : ""} style={{ visibility: mounted ? "visible" : "hidden" }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
