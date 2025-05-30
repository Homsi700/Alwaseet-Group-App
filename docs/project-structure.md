# هيكل المشروع | Project Structure

## نظرة عامة | Overview

هذه الوثيقة تقدم نظرة شاملة على هيكل مشروع نظام محاسبي الوسيط جروب، مع شرح لكل مجلد وملف رئيسي.

## المجلدات الرئيسية | Main Directories

```
Alwaseet-Group-App/
├── src/                  # المصدر الرئيسي للتطبيق
│   ├── app/              # صفحات التطبيق (Next.js App Router)
│   ├── components/       # مكونات واجهة المستخدم
│   ├── hooks/            # React Hooks مخصصة
│   ├── lib/              # مكتبات وأدوات مساعدة
│   ├── providers/        # مزودات السياق
│   ├── types/            # تعريفات TypeScript
│   └── scripts/          # سكريبتات مساعدة
├── public/               # الملفات العامة (الصور، الأيقونات، إلخ)
├── database/             # سكريبتات قاعدة البيانات
├── docs/                 # وثائق المشروع
└── .env.local            # متغيرات البيئة (يجب إنشاؤه)
```

## هيكل مجلد `src/app` | `src/app` Directory Structure

```
src/app/
├── (app)/                # مجموعة مسارات للصفحات الداخلية المحمية
│   ├── backup-restore/   # صفحات النسخ الاحتياطي واستعادة البيانات
│   ├── customers/        # صفحات إدارة العملاء
│   ├── dashboard/        # صفحة لوحة التحكم الرئيسية
│   ├── employees/        # صفحات إدارة الموظفين
│   ├── finance/          # صفحات الإدارة المالية
│   ├── inventory/        # صفحات إدارة المخزون
│   ├── notifications/    # صفحات الإشعارات
│   ├── pos/              # صفحات نظام نقاط البيع
│   ├── products/         # صفحات إدارة المنتجات
│   ├── purchase-orders/  # صفحات أوامر الشراء
│   ├── purchases/        # صفحات المشتريات
│   ├── reports/          # صفحات التقارير
│   ├── sales/            # صفحات المبيعات
│   ├── sales-overview/   # صفحات نظرة عامة على المبيعات
│   ├── settings/         # صفحات الإعدادات
│   ├── suppliers/        # صفحات إدارة الموردين
│   ├── transactions/     # صفحات المعاملات المالية
│   ├── layout.tsx        # تخطيط الصفحات الداخلية
│   └── page.tsx          # الصفحة الرئيسية الداخلية
├── api/                  # نقاط نهاية API
│   ├── auth/             # واجهات API للمصادقة
│   ├── categories/       # واجهات API للفئات
│   ├── common/           # واجهات API مشتركة
│   ├── customers/        # واجهات API للعملاء
│   ├── invoices/         # واجهات API للفواتير
│   ├── products/         # واجهات API للمنتجات
│   ├── reports/          # واجهات API للتقارير
│   ├── rpc/              # واجهات API للإجراءات البعيدة
│   └── sales/            # واجهات API للمبيعات
├── login/                # صفحة تسجيل الدخول
├── globals.css           # أنماط CSS العامة
├── layout.tsx            # تخطيط التطبيق الرئيسي
├── middleware.ts         # وسيط Next.js
└── page.tsx              # الصفحة الرئيسية
```

## هيكل قسم التقارير | Reports Section Structure

```
src/app/(app)/reports/
├── page.tsx              # الصفحة الرئيسية للتقارير
└── inventory/            # تقارير المخزون
    ├── status/           # تقرير حالة المخزون
    │   └── page.tsx
    ├── low-stock/        # تقرير المنتجات منخفضة المخزون
    │   └── page.tsx
    ├── valuation/        # تقرير تقييم المخزون
    │   └── page.tsx
    ├── movement/         # تقرير حركة المخزون
    │   └── page.tsx
    └── performance/      # تقرير أداء المنتجات
        └── page.tsx

src/app/api/reports/
└── inventory/            # واجهات API لتقارير المخزون
    ├── status/           # واجهة API لتقرير حالة المخزون
    │   └── route.ts
    ├── low-stock/        # واجهة API لتقرير المنتجات منخفضة المخزون
    │   └── route.ts
    ├── valuation/        # واجهة API لتقرير تقييم المخزون
    │   └── route.ts
    ├── movement/         # واجهة API لتقرير حركة المخزون
    │   └── route.ts
    └── performance/      # واجهة API لتقرير أداء المنتجات
        └── route.ts
```

## هيكل مجلد `src/components` | `src/components` Directory Structure

```
src/components/
├── ui/                   # مكونات واجهة المستخدم الأساسية (shadcn/ui)
├── charts/               # مكونات الرسوم البيانية
│   ├── inventory-value-chart.tsx
│   ├── inventory-status-chart.tsx
│   ├── stock-movement-chart.tsx
│   ├── product-performance-chart.tsx
│   ├── product-profitability-chart.tsx
│   └── product-sales-chart.tsx
├── export/               # مكونات تصدير البيانات
│   └── export-data.tsx
├── forms/                # مكونات النماذج
├── layout/               # مكونات التخطيط
│   ├── header.tsx
│   ├── sidebar.tsx
│   └── footer.tsx
├── modals/               # مكونات النوافذ المنبثقة
├── tables/               # مكونات الجداول
└── widgets/              # مكونات الودجات
```

## هيكل مجلد `src/hooks` | `src/hooks` Directory Structure

```
src/hooks/
├── use-auth.ts           # Hook للمصادقة
├── use-categories.ts     # Hook للفئات
├── use-customers.ts      # Hook للعملاء
├── use-inventory-status.ts # Hook لحالة المخزون
├── use-inventory-valuation.ts # Hook لتقييم المخزون
├── use-low-stock.ts      # Hook للمنتجات منخفضة المخزون
├── use-product-performance.ts # Hook لأداء المنتجات
├── use-products.ts       # Hook للمنتجات
├── use-sales.ts          # Hook للمبيعات
├── use-stock-movements.ts # Hook لحركات المخزون
├── use-suppliers.ts      # Hook للموردين
├── use-theme.ts          # Hook للسمات
└── use-toast.ts          # Hook للإشعارات
```

## هيكل مجلد `src/lib` | `src/lib` Directory Structure

```
src/lib/
├── db.ts                 # اتصال قاعدة البيانات
├── auth.ts               # وظائف المصادقة
├── utils.ts              # وظائف مساعدة عامة
├── date-utils.ts         # وظائف مساعدة للتواريخ
├── format-utils.ts       # وظائف مساعدة للتنسيق
└── validation.ts         # وظائف التحقق من الصحة
```

## هيكل مجلد `src/providers` | `src/providers` Directory Structure

```
src/providers/
├── auth-provider.tsx     # مزود سياق المصادقة
├── theme-provider.tsx    # مزود سياق السمات
└── language-provider.tsx # مزود سياق اللغة
```

## هيكل مجلد `src/types` | `src/types` Directory Structure

```
src/types/
├── index.ts              # تصدير جميع الأنواع
├── auth.ts               # أنواع المصادقة
├── category.ts           # أنواع الفئات
├── customer.ts           # أنواع العملاء
├── inventory.ts          # أنواع المخزون
├── product.ts            # أنواع المنتجات
├── report.ts             # أنواع التقارير
├── sale.ts               # أنواع المبيعات
├── stock-movement.ts     # أنواع حركات المخزون
└── supplier.ts           # أنواع الموردين
```

## هيكل مجلد `database` | `database` Directory Structure

```
database/
├── init.sql              # سكريبت إنشاء قاعدة البيانات
├── seed_data.sql         # سكريبت بيانات البذر
├── setup_auth.sql        # سكريبت إعداد المصادقة
├── create_views.sql      # سكريبت إنشاء العروض
└── useful_commands.sql   # أوامر SQL مفيدة
```

## هيكل مجلد `docs` | `docs` Directory Structure

```
docs/
├── project-roadmap.md    # خارطة طريق المشروع
├── project-structure.md  # هيكل المشروع (هذا الملف)
├── reports-implementation.md # توثيق تنفيذ قسم التقارير
├── database-integration-plan.md # خطة تكامل قاعدة البيانات
└── هيكل قاعدة البيانات  # توثيق هيكل قاعدة البيانات
```

## ملفات التكوين | Configuration Files

```
Alwaseet-Group-App/
├── .env.local            # متغيرات البيئة (يجب إنشاؤه)
├── next.config.js        # تكوين Next.js
├── tailwind.config.ts    # تكوين Tailwind CSS
├── tsconfig.json         # تكوين TypeScript
├── package.json          # تبعيات المشروع
└── install_dependencies.bat # سكريبت تثبيت التبعيات
```

## ملاحظات هامة | Important Notes

1. **مجلد `src/app/(app)`**: يحتوي على جميع الصفحات الداخلية المحمية التي تتطلب مصادقة.

2. **مجلد `src/app/api`**: يحتوي على جميع نقاط نهاية API التي تتفاعل مع قاعدة البيانات.

3. **مجلد `src/components/ui`**: يحتوي على مكونات shadcn/ui المعاد استخدامها في جميع أنحاء التطبيق.

4. **مجلد `src/hooks`**: يحتوي على Hooks مخصصة لجلب البيانات والتفاعل مع API.

5. **مجلد `src/lib`**: يحتوي على وظائف مساعدة واتصال قاعدة البيانات.

6. **مجلد `src/providers`**: يحتوي على مزودات السياق لإدارة حالة التطبيق العالمية.

7. **مجلد `database`**: يحتوي على سكريبتات SQL لإعداد قاعدة البيانات.

8. **ملف `.env.local`**: يجب إنشاؤه يدوياً ويحتوي على متغيرات البيئة الحساسة مثل اتصال قاعدة البيانات و JWT_SECRET.