# نظام محاسبي الوسيط جروب | Alwaseet Group Accounting System

## آخر التحديثات | Latest Updates
🔧 **28-05-2025**: تم حل مشكلة الاتصال بقاعدة البيانات
- تم إصلاح مشكلة الاتصال مع SQL Server باستخدام Windows Authentication
- تم تحسين عملية تسجيل الدخول وإنشاء التوكن JWT
- تم إصلاح التوجيه التلقائي إلى لوحة التحكم بعد تسجيل الدخول
- تم تحسين رسائل الخطأ باللغة العربية

## نظرة عامة | Overview
نظام محاسبي متكامل مصمم خصيصاً لمجموعة الوسيط جروب. يوفر النظام إدارة شاملة للمبيعات، المشتريات، المخزون، والعمليات المالية.

A comprehensive accounting system designed specifically for Alwaseet Group. The system provides complete management of sales, purchases, inventory, and financial operations.

## الميزات المنفذة حالياً | Current Features
- ✅ نظام المصادقة (تسجيل الدخول)
- ✅ إدارة المستخدمين
- ✅ واجهة مستخدم عربية
- ✅ تصميم متجاوب
- ✅ نظام السمات (الوضع الليلي/النهاري)

## الميزات قيد التطوير | Features Under Development
- 🔄 إدارة المنتجات
- 🔄 إدارة المخزون
- 🔄 نظام نقاط البيع
- 🔄 التقارير المالية
- 🔄 إدارة العملاء والموردين

## المتطلبات التقنية | Technical Requirements
- Node.js (v18+)
- SQL Server
- Visual Studio Code

## تشغيل المشروع | Running the Project
1. تثبيت الاعتماديات | Install dependencies:
```bash
npm install
```

2. إعداد قاعدة البيانات | Setup database:
```bash
# قم بتشغيل سكريبتات قاعدة البيانات في المجلد
./database/init.sql
./database/seed_data.sql
```

3. تشغيل المشروع | Run the project:
```bash
npm run dev
```

## هيكل المشروع | Project Structure
- `/src/app` - صفحات التطبيق | Application pages
- `/src/components` - مكونات واجهة المستخدم | UI components
- `/src/lib` - مكتبات وأدوات مساعدة | Libraries and utilities
- `/database` - سكريبتات قاعدة البيانات | Database scripts

## التقنيات المستخدمة | Technologies Used
- Next.js 14
- TypeScript
- Tailwind CSS
- SQL Server
- shadcn/ui
- JWT Authentication

## إعدادات قاعدة البيانات | Database Configuration
تم تكوين الاتصال بقاعدة البيانات في ملف `src/lib/db.ts` باستخدام:
```typescript
const config = {
  server: 'DESKTOP-0QOGPV9',
  database: 'AlwaseetGroup',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true,
    trustServerCertificate: true
  }
};
```

ملاحظات مهمة:
- تم استخدام Windows Authentication للاتصال بقاعدة البيانات
- تأكد من تشغيل خدمة SQL Server على جهازك
- تأكد من تثبيت SQL Server Native Client
- يجب تشغيل السكريبت `database/init.sql` لإنشاء قاعدة البيانات
