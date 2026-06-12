import type { EcosystemSuite } from "@/lib/types";

export const ecosystem: EcosystemSuite[] = [
  {
    suite: "The Ultimate Bundle",
    suiteAr: "الباقة الشاملة",
    slug: "ultimate-bundle",
    category: "creative",
    products: [
      { name: "One Eco System Bundle", nameAr: "باقة النظام البيئي الموحد", slug: "one-eco-system", description: "The complete, unified enterprise digital transformation package. All suites, one source of truth.", descAr: "الباقة الشاملة للتحول الرقمي المؤسسي — كل الحلول والأنظمة بمصدرٍ واحدٍ للحقيقة." }
    ]
  },
  {
    suite: "Marketing & Growth",
    suiteAr: "التسويق والنمو",
    slug: "marketing-growth",
    category: "creative",
    products: [
      { name: "Brand Strategy & Positioning", nameAr: "استراتيجية العلامة والتموضع", slug: "brand-strategy", description: "Category design, messaging architecture, and a positioning that competitors cannot copy.", descAr: "تصميم الفئة، وبناء الرسائل، وتموضعٌ يصعب على المنافسين تقليده." },
      { name: "Performance Marketing", nameAr: "تسويق الأداء", slug: "performance-marketing", description: "Full-funnel acquisition engineered to a target CAC and ROAS — every pound attributed.", descAr: "استحواذٌ شامل عبر القمع بأكمله مُهندَسٌ على هدف تكلفة استحواذ وعائد إنفاقٍ محدد — كل جنيهٍ مُسنَدٌ لمصدره." },
      { name: "Marketing Automation & Journeys", nameAr: "أتمتة التسويق ورحلات العملاء", slug: "marketing-automation", description: "Triggered journeys across email, SMS, and WhatsApp that move buyers without manual effort.", descAr: "رحلاتٌ آليةٌ عبر البريد والرسائل وواتساب تُحرّك العملاء دون جهدٍ يدوي." },
      { name: "SEO & AEO Engine", nameAr: "محرك تحسين الظهور والسيو", slug: "seo-aeo", description: "Rank on Google and inside AI answers — technical, content, and authority in one program.", descAr: "تصدّرٌ على جوجل وداخل إجابات الذكاء الاصطناعي — تقنيٌّ ومحتوىً وموثوقية في برنامجٍ واحد." },
      { name: "Conversion Rate Optimization", nameAr: "تحسين معدل التحويل", slug: "cro", description: "A continuous experimentation lab that compounds landing-page and checkout conversion.", descAr: "مختبر تجريبٍ مستمر يُراكم تحسين صفحات الهبوط وإتمام الشراء." }
    ]
  },
  {
    suite: "Social & Content",
    suiteAr: "السوشيال والمحتوى",
    slug: "social-content",
    category: "creative",
    products: [
      { name: "Social Media Management", nameAr: "إدارة منصات التواصل", slug: "social-media", description: "Always-on channel management with a publishing cadence built for reach and saves.", descAr: "إدارةٌ دائمةٌ للمنصات بإيقاع نشرٍ مُصمَّمٍ للوصول والحفظ." },
      { name: "Content Studio", nameAr: "استوديو المحتوى", slug: "content-studio", description: "Editorial and design production line — scroll-stopping creative at industrial cadence.", descAr: "خط إنتاجٍ تحريريٍّ وتصميميّ — إبداعٌ يوقف التمرير بإيقاعٍ صناعي." },
      { name: "Influencer & UGC Engine", nameAr: "محرك المؤثرين والمحتوى من المستخدمين", slug: "influencer-ugc", description: "Creator sourcing, briefing, and performance tracking — UGC produced and measured at scale.", descAr: "اختيار صنّاع المحتوى وتوجيههم وقياس أدائهم — محتوى مستخدمين يُنتَج ويُقاس على نطاقٍ واسع." },
      { name: "Community Management", nameAr: "إدارة المجتمع", slug: "community", description: "Conversation, moderation, and response SLAs that turn audiences into advocates.", descAr: "حوارٌ وإشرافٌ واتفاقيات استجابةٍ تُحوّل الجمهور إلى سفراء." },
      { name: "Video & Motion Production", nameAr: "إنتاج الفيديو والموشن", slug: "video-production", description: "Short-form, motion, and localized dubbing — produced for every platform's native spec.", descAr: "محتوى قصير وموشن ودبلجة محلية — مُنتَجٌ وفق المواصفة الأصلية لكل منصة." }
    ]
  },
  {
    suite: "Media Buying & Performance",
    suiteAr: "شراء الإعلانات والأداء",
    slug: "media-buying",
    category: "creative",
    products: [
      { name: "Programmatic Media Buying", nameAr: "شراء الإعلانات البرمجي", slug: "programmatic", description: "Audience-led buying across the open web and CTV with brand-safety controls.", descAr: "شراءٌ موجَّهٌ بالجمهور عبر الويب المفتوح والتلفزيون المتصل مع ضوابط أمان العلامة." },
      { name: "Paid Social", nameAr: "إعلانات السوشيال المدفوعة", slug: "paid-social", description: "Meta, TikTok, and Snap managed to incremental conversions — not vanity metrics.", descAr: "ميتا وتيك توك وسناب تُدار لتحقيق تحويلاتٍ فعليةٍ إضافية — لا مقاييس مظهرية." },
      { name: "Paid Search & Shopping", nameAr: "إعلانات البحث والتسوق", slug: "paid-search", description: "Intent capture across Search, PMax, and Shopping with profit-aware bidding.", descAr: "التقاط النية عبر البحث وPMax والتسوق بمزايدةٍ واعيةٍ بالربح." },
      { name: "Out-of-Home & DOOH", nameAr: "الإعلانات الخارجية والرقمية", slug: "ooh-dooh", description: "Programmatic OOH planning with measured footfall and brand-lift attribution.", descAr: "تخطيطٌ برمجيٌّ للإعلانات الخارجية مع قياس الإقبال وأثر العلامة." },
      { name: "Retail & Marketplace Media", nameAr: "إعلانات التجزئة والأسواق", slug: "retail-media", description: "Amazon, Noon, and marketplace ad management tied to share-of-shelf growth.", descAr: "إدارة إعلانات أمازون ونون والأسواق مرتبطةً بنمو حصة الرف." }
    ]
  },
  {
    suite: "Operations & Logistics",
    suiteAr: "العمليات والخدمات اللوجستية",
    slug: "operations-logistics",
    category: "tech",
    products: [
      { name: "Transportation Management System (TMS)", nameAr: "نظام إدارة النقل (TMS)", slug: "tms", description: "AI-driven routing and freight optimization.", descAr: "توجيه مدفوع بالذكاء الاصطناعي وتحسين الشحن." },
      { name: "Fleet Management System", nameAr: "نظام إدارة الأسطول", slug: "fleet-management", description: "Real-time telemetry and preventative maintenance.", descAr: "القياس عن بعد في الوقت الفعلي والصيانة الوقائية." },
      { name: "Supply Chain Management (SCM)", nameAr: "إدارة سلسلة التوريد (SCM)", slug: "scm", description: "End-to-end visibility and vendor synchronization.", descAr: "رؤية شاملة ومزامنة مع الموردين." },
      { name: "Inventory & Warehouse Management System (WMS)", nameAr: "نظام إدارة المخزون والمستودعات (WMS)", slug: "wms", description: "Automated stock tracking and facility mapping.", descAr: "تتبع آلي للمخزون ورسم خرائط المرافق." }
    ]
  },
  {
    suite: "HR & Performance",
    suiteAr: "الموارد البشرية والأداء",
    slug: "hr-performance",
    category: "tech",
    products: [
      { name: "Payroll System", nameAr: "نظام مسيرات الرواتب", slug: "payroll", description: "Automated compliance and global disbursement.", descAr: "الامتثال الآلي والصرف العالمي." },
      { name: "People Management System", nameAr: "نظام إدارة الموارد البشرية", slug: "people-management", description: "Core HR operations unified.", descAr: "العمليات الأساسية للموارد البشرية الموحدة." },
      { name: "Performance Management System", nameAr: "نظام إدارة الأداء", slug: "performance", description: "KPI tracking and growth trajectory mapping.", descAr: "تتبع مؤشرات الأداء الرئيسية ورسم مسار النمو." },
      { name: "Learning Management System (LMS)", nameAr: "نظام إدارة التعلم (LMS)", slug: "lms", description: "Upskilling pathways and training deployment.", descAr: "مسارات صقل المهارات ونشر التدريب." },
      { name: "Quality Management System (QMS)", nameAr: "نظام إدارة الجودة (QMS)", slug: "qms", description: "Standard operating procedure enforcement.", descAr: "إنفاذ إجراءات التشغيل القياسية." },
      { name: "Employee Intranet & Portal", nameAr: "بوابة وإنترانت الموظفين", slug: "intranet", description: "Secure corporate communications hub.", descAr: "مركز اتصالات مؤسسي آمن." }
    ]
  },
  {
    suite: "Finance & Core ERP",
    suiteAr: "المالية ونظام تخطيط موارد المؤسسات",
    slug: "finance-erp",
    category: "tech",
    products: [
      { name: "Finance Management System", nameAr: "نظام الإدارة المالية", slug: "finance", description: "Real-time ledger and cash flow prediction.", descAr: "دفتر الأستاذ في الوقت الفعلي والتنبؤ بالتدفقات النقدية." },
      { name: "Enterprise Resource Planning", nameAr: "تخطيط موارد المؤسسات", slug: "core-erp", description: "The foundational core operational database.", descAr: "قاعدة البيانات التشغيلية الأساسية." },
      { name: "Procurement & Expenses Management System", nameAr: "نظام إدارة المشتريات والنفقات", slug: "procurement", description: "Spend controls and automated approvals.", descAr: "ضوابط الإنفاق والموافقات الآلية." }
    ]
  },
  {
    suite: "Customer & Sales",
    suiteAr: "العملاء والمبيعات",
    slug: "customer-sales",
    category: "tech",
    products: [
      { name: "Customer Relationship Management (CRM)", nameAr: "إدارة علاقات العملاء (CRM)", slug: "crm", description: "Pipeline velocity and relationship intelligence.", descAr: "سرعة خط الأنابيب وذكاء العلاقات." },
      { name: "Customer Support & Ticketing System", nameAr: "نظام دعم العملاء والتذاكر", slug: "ticketing", description: "Omnichannel issue resolution.", descAr: "حل المشكلات عبر قنوات متعددة." },
      { name: "Configure, Price, Quote (CPQ)", nameAr: "أداة التسعير وعروض الأسعار (CPQ)", slug: "cpq", description: "Complex pricing matrix automation.", descAr: "أتمتة مصفوفة التسعير المعقدة." }
    ]
  },
  {
    suite: "AI Transformation",
    suiteAr: "تحول الذكاء الاصطناعي",
    slug: "ai-transformation",
    category: "tech",
    products: [
      { name: "Grow Chatbot", nameAr: "روبوت محادثة Grow", slug: "grow-chatbot", description: "Conversational intelligence for internal and external queries.", descAr: "الذكاء الحواري للاستفسارات الداخلية والخارجية." },
      { name: "AI Recruitment System", nameAr: "نظام التوظيف بالذكاء الاصطناعي", slug: "ai-recruitment", description: "Candidate screening and skill-matching algorithms.", descAr: "فحص المرشحين وخوارزميات مطابقة المهارات." },
      { name: "Ready/Customized Skills for AI Agents", nameAr: "مهارات مخصصة لوكلاء الذكاء الاصطناعي", slug: "ai-skills", description: "Pre-trained functional behaviors for autonomous agents.", descAr: "سلوكيات وظيفية مدربة مسبقًا للوكلاء المستقلين." },
      { name: "Agents OS", nameAr: "نظام تشغيل الوكلاء", slug: "agents-os", description: "The operating environment for deploying autonomous workflows.", descAr: "بيئة التشغيل لنشر سير العمل المستقل." },
      { name: "AI Document Processing (Intelligent OCR)", nameAr: "معالجة المستندات بالذكاء الاصطناعي (OCR الذكي)", slug: "intelligent-ocr", description: "Unstructured data extraction and digitization.", descAr: "استخراج البيانات غير المنظمة ورقمنتها." }
    ]
  },
  {
    suite: "Data & Analytics",
    suiteAr: "البيانات والتحليلات",
    slug: "data-analytics",
    category: "tech",
    products: [
      { name: "Business Intelligence (BI) Dashboards", nameAr: "لوحات معلومات ذكاء الأعمال (BI)", slug: "bi-dashboards", description: "Real-time visual data storytelling.", descAr: "سرد بيانات مرئي في الوقت الفعلي." },
      { name: "Enterprise Data Lake/Warehouse", nameAr: "مستودع/بحيرة بيانات المؤسسة", slug: "data-lake", description: "Unified, secure storage for all operational data.", descAr: "تخزين موحد وآمن لجميع البيانات التشغيلية." },
      { name: "Predictive/Forecast Analytics Engine", nameAr: "محرك التحليلات التنبؤية/التوقعات", slug: "predictive-analytics", description: "Machine learning for future trend modeling.", descAr: "التعلم الآلي لنمذجة الاتجاهات المستقبلية." }
    ]
  },
  {
    suite: "IT & Security",
    suiteAr: "تكنولوجيا المعلومات والأمن",
    slug: "it-security",
    category: "tech",
    products: [
      { name: "Identity and Access Management (IAM)", nameAr: "إدارة الهوية والوصول (IAM)", slug: "iam", description: "Zero-trust security and role-based permissions.", descAr: "أمان مبني على انعدام الثقة وأذونات قائمة على الأدوار." },
      { name: "IT Service Management (ITSM)", nameAr: "إدارة خدمات تكنولوجيا المعلومات (ITSM)", slug: "itsm", description: "Internal tech support and hardware lifecycle tracking.", descAr: "الدعم الفني الداخلي وتتبع دورة حياة الأجهزة." }
    ]
  }
];
