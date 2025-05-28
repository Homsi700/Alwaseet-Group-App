import type { LucideIcon } from 'lucide-react';
import {
  LayoutGrid,
  ShoppingCart,
  Package,
  History,
  TrendingUp,
  ShoppingBag,
  Archive,
  Users,
  Truck,
  Landmark,
  BarChartBig,
  Settings,
  DatabaseBackup,
  Briefcase, 
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const AppLogoIcon = Briefcase; // شعار التطبيق

// تم ترجمة جميع العناوين والأوصاف إلى اللغة العربية
export const navItems: NavItem[] = [
  { title: 'لوحة التحكم', href: '/', icon: LayoutGrid, description: 'نظرة عامة على مؤشرات عملك ووحدات النظام.' },
  { title: 'نقطة البيع', href: '/pos', icon: ShoppingCart, description: 'إنشاء فواتير مبيعات جديدة ومعالجة المعاملات بسرعة.' },
  { title: 'المنتجات', href: '/products', icon: Package, description: 'إدارة كتالوج منتجاتك، المخزون، والأسعار.' },
  { title: 'الحركات المالية', href: '/transactions', icon: History, description: 'عرض وتصفية جميع سجلات الحركات المالية.' },
  { title: 'المبيعات', href: '/sales', icon: TrendingUp, description: 'تتبع وإدارة طلبات البيع، الفواتير، ومدفوعات العملاء.' },
  { title: 'المشتريات', href: '/purchases', icon: ShoppingBag, description: 'إدارة أوامر الشراء، الفواتير، ومدفوعات الموردين.' },
  { title: 'المخزون', href: '/inventory', icon: Archive, description: 'الإشراف على مستويات المخزون، الحركات، وتقييم المخزون.' },
  { title: 'العملاء', href: '/customers', icon: Users, description: 'الحفاظ على قاعدة بيانات عملائك وتتبع التفاعلات.' },
  { title: 'الموردون', href: '/suppliers', icon: Truck, description: 'تتبع مورديك، معلومات الاتصال، وتاريخ المشتريات.' },
  { title: 'المالية', href: '/finance', icon: Landmark, description: 'إدارة دليل الحسابات، قيود اليومية، والصحة المالية.' },
  { title: 'التقارير', href: '/reports', icon: BarChartBig, description: 'إنشاء تقارير أعمال ثاقبة حول المبيعات، النفقات، والمزيد.' },
  { title: 'النسخ الاحتياطي والاستعادة', href: '/backup-restore', icon: DatabaseBackup, description: 'تأمين بياناتك بالنسخ الاحتياطية واستعادتها عند الحاجة.' },
  { title: 'الإعدادات', href: '/settings', icon: Settings, description: 'تكوين إعدادات التطبيق، أدوار المستخدمين، والتفضيلات.' },
];

// تصفية العناصر لشبكة لوحة التحكم الرئيسية (باستثناء لوحة التحكم نفسها، نقطة البيع، المنتجات، الحركات، النسخ الاحتياطي/الاستعادة، الإعدادات)
export const dashboardGridItems: NavItem[] = navItems.filter(item =>
  !['/', '/pos', '/products', '/transactions', '/backup-restore', '/settings'].includes(item.href)
);

// عناصر قسم الوصول السريع في لوحة التحكم
export const dashboardQuickAccessItems: NavItem[] = navItems.filter(item =>
    ['/pos', '/products', '/transactions', '/backup-restore'].includes(item.href)
);
