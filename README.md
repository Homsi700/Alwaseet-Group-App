<<<<<<< HEAD
# نظام محاسبي الوسيط جروب | Alwaseet Group Accounting System

## آخر التحديثات | Latest Updates
🔧 **28-05-2025**: تم حل مشكلة الاتصال بقاعدة البيانات
- تم إصلاح مشكلة الاتصال مع SQL Server باستخدام Windows Authentication
- تم تحسين عملية تسجيل الدخول وإنشاء التوكن JWT
- تم إصلاح التوجيه التلقائي إلى لوحة التحكم بعد تسجيل الدخول
- تم تحسين رسائل الخطأ باللغة العربية

=======
<<<<<<< HEAD
# محاسبي | نظام محاسبي من مجموعة الوسيط جروب

## آخر التحديثات
🔧 **28-05-2025**: تم حل مشكلة الاتصال بقاعدة البيانات (تحول كامل إلى `mssql` في Node.js)
- ✅ تم التحول بالكامل لاستخدام مكتبة `mssql` في Node.js للاتصال المباشر بـ SQL Server، وإلغاء الاعتماد على جسر Python.
- ✅ تم إصلاح عملية تسجيل الدخول للتحقق من اسم المستخدم وكلمة المرور (مع تعطيل مؤقت لمقارنة `bcrypt` لمرحلة التطوير).
- ✅ تم تحسين التوجيه بعد تسجيل الدخول لضمان ظهور لوحة التحكم مع الشريط الجانبي.
- ✅ تم تحسين دعم اللغة العربية في الواجهات الرئيسية والنصوص الثابتة.
- ✅ تم تبسيط سكريبتات التشغيل والتثبيت.

## نظرة عامة
نظام محاسبي متكامل مصمم خصيصاً لمجموعة الوسيط جروب. يوفر النظام إدارة شاملة للمبيعات، المشتريات، المخزون، والعمليات المالية.

## الميزات المنفذة حالياً
- ✅ نظام المصادقة (تسجيل الدخول) مع توكن JWT.
- ✅ حماية المسارات الداخلية.
- ✅ إدارة المستخدمين (هيكل أساسي في قاعدة البيانات).
- ✅ واجهة مستخدم عربية (افتراضي) مع إمكانية التبديل للإنجليزية.
- ✅ تصميم متجاوب.
- ✅ نظام السمات (الوضع الليلي/النهاري).
- ✅ لوحة تحكم رئيسية مع مؤشرات أداء.
- ✅ وحدة منتجات (واجهة أمامية مع نماذج إضافة/تعديل/حذف، تستخدم React Query، ونقاط نهاية API وهمية حالياً تنتظر الربط بقاعدة البيانات).
- ✅ صفحات هيكلية لمعظم الوحدات الأخرى.
- ✅ اتصال مباشر بقاعدة بيانات SQL Server من Node.js.

## الميزات قيد التطوير
- 🔄 **وحدة المنتجات:** ربط نقاط نهاية API (CRUD والبحث) بقاعدة البيانات بشكل كامل.
- 🔄 **وحدة الفئات:** بناء الواجهة ونقاط نهاية API وربطها بقاعدة البيانات والمنتجات.
- 🔄 إدارة المخزون.
- 🔄 نظام نقاط البيع (ربط بواجهة المنتجات الحقيقية).
- 🔄 التقارير المالية.
- 🔄 إدارة العملاء والموردين.
- 🔄 إكمال ترجمة جميع النصوص في التطبيق.
- 🔄 إعادة تفعيل مقارنة كلمة المرور المشفرة (`bcrypt`) في API تسجيل الدخول.

## المتطلبات التقنية
- Node.js (v18+)
- SQL Server
- Visual Studio Code (أو أي محرر نصوص آخر)

## تشغيل المشروع
1.  **إعداد متغيرات البيئة:**
    *   قم بإنشاء ملف `.env.local` في المجلد الجذر للمشروع.
    *   أضف متغيرات البيئة اللازمة للاتصال بقاعدة البيانات و JWT_SECRET. مثال:
        ```env
        DB_SERVER='Your_Server_Name\\Your_Instance_Name'
        DB_DATABASE='AlwaseetGroup'
        DB_USER='your_db_user_if_not_trusted'
        DB_PASSWORD='your_db_password_if_not_trusted'
        DB_TRUSTED_CONNECTION='true' # أو false إذا كنت تستخدم DB_USER/DB_PASSWORD
        DB_PORT='1433' # المنفذ الافتراضي لـ SQL Server
        DB_ENCRYPT='false' # أو true حسب إعدادات الخادم
        DB_TRUST_SERVER_CERTIFICATE='true'

        JWT_SECRET='your-super-secret-jwt-key-at-least-32-characters'
        ```
2.  **تثبيت الاعتماديات:**
    *   شغل السكريبت `install_dependencies.bat` (أو قم بتشغيل `npm install` مباشرة في الطرفية).
3.  **إعداد قاعدة البيانات (إذا لم تكن موجودة):**
    *   تأكد من وجود قاعدة بيانات `AlwaseetGroup` على خادم SQL Server الخاص بك.
    *   قم بتشغيل سكريبتات SQL اللازمة لإنشاء الجداول والبيانات الأولية (إذا كانت متوفرة، حالياً نعتمد على قاعدة بيانات موجودة مسبقاً).
    *   يمكنك استخدام سكريبت `scripts/update-admin-password.ts` (بتشغيله عبر `npx tsx scripts/update-admin-password.ts`) لإنشاء/تحديث كلمة مرور المستخدم المسؤول 'admin'.
4.  **تشغيل المشروع:**
    *   شغل السكريبت `run_project.bat` (أو قم بتشغيل `npm run dev` مباشرة في الطرفية).
    *   سيتم فتح المشروع في المتصفح على `http://localhost:9002`.

## هيكل المشروع
- `/src/app` - صفحات التطبيق (Next.js App Router).
- `/src/app/(app)` - مجموعة مسارات للصفحات الداخلية المحمية.
- `/src/app/api` - نقاط نهاية API.
- `/src/components` - مكونات واجهة المستخدم (ShadCN UI ومكونات مخصصة).
- `/src/lib` - مكتبات وأدوات مساعدة (مثل `db.ts` للاتصال بقاعدة البيانات).
- `/src/providers` - مزودات السياق (Theme, Language, Auth).
- `/src/types` - تعريفات TypeScript.
- `.env.local` - (يجب إنشاؤه) لمتغيرات البيئة.

## التقنيات المستخدمة
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- SQL Server (متصل مباشرة عبر مكتبة `mssql` في Node.js)
- shadcn/ui
- JWT Authentication (مكتبة `jose`)
- React Query (TanStack Query) لإدارة حالة الخادم

## إعدادات قاعدة البيانات (في `.env.local` و `src/lib/db.ts`)
يتم الآن الاتصال مباشرة بـ SQL Server باستخدام مكتبة `mssql`. يتم قراءة إعدادات الاتصال من ملف `.env.local`.

**ملاحظات هامة:**
- تأكد من تشغيل خدمة SQL Server على جهازك أو الخادم.
- تأكد من أن بيانات اعتماد الاتصال في `.env.local` صحيحة.
- لا يوجد اعتماد على Python حالياً.
=======
# نظام محاسبي الوسيط جروب | Alwaseet Group Accounting System

## آخر التحديثات | Latest Updates
🔧 **28-05-2025**: تم حل مشكلة الاتصال بقاعدة البيانات
- تم إصلاح مشكلة الاتصال مع SQL Server باستخدام Windows Authentication
- تم تحسين عملية تسجيل الدخول وإنشاء التوكن JWT
- تم إصلاح التوجيه التلقائي إلى لوحة التحكم بعد تسجيل الدخول
- تم تحسين رسائل الخطأ باللغة العربية

>>>>>>> d617af1578f167462c0d30a08feba605f0bb3885
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
<<<<<<< HEAD
=======
>>>>>>> e95e0a423eddc498b0bcdbb854024930762bd26a
>>>>>>> d617af1578f167462c0d30a08feba605f0bb3885
