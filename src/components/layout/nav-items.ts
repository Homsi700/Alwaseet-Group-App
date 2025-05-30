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
  Landmark, // Changed from DollarSign for Finance module
  BarChartBig,
  Settings,
  DatabaseBackup,
  Briefcase, // For App Logo
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const AppLogoIcon = Briefcase;

export const navItems: NavItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard', icon: LayoutGrid, description: 'نظرة عامة على مؤشرات الأداء والوحدات.' },
  { title: 'نقطة البيع', href: '/pos', icon: ShoppingCart, description: 'إنشاء فواتير البيع ومعالجة المبيعات.' },  { title: 'المنتجات', href: '/products', icon: Package, description: 'إدارة المنتجات، المخزون، والأسعار.' },
  { title: 'المعاملات', href: '/transactions', icon: History, description: 'عرض وتصفية سجلات المعاملات المالية.' },
  { title: 'المبيعات', href: '/sales', icon: TrendingUp, description: 'متابعة وإدارة طلبات البيع والفواتير ومدفوعات العملاء.' },
  { title: 'المشتريات', href: '/purchases', icon: ShoppingBag, description: 'إدارة أوامر الشراء والفواتير ومدفوعات الموردين.' },
  { title: 'المخزون', href: '/inventory', icon: Archive, description: 'مراقبة مستويات المخزون وحركته وتقييمه.' },
  { title: 'العملاء', href: '/customers', icon: Users, description: 'إدارة قاعدة بيانات العملاء ومتابعة التفاعلات.' },
  { title: 'الموردين', href: '/suppliers', icon: Truck, description: 'متابعة الموردين وجهات الاتصال وسجل المشتريات.' },
  { title: 'المالية', href: '/finance', icon: Landmark, description: 'إدارة الحسابات والقيود المحاسبية والصحة المالية.' },
  { title: 'التقارير', href: '/reports', icon: BarChartBig, description: 'إنشاء تقارير المبيعات والمصروفات وغيرها.' },
  { title: 'النسخ الاحتياطي', href: '/backup-restore', icon: DatabaseBackup, description: 'تأمين البيانات بالنسخ الاحتياطي والاستعادة.' },
  { title: 'الإعدادات', href: '/settings', icon: Settings, description: 'تكوين إعدادات التطبيق وأدوار المستخدمين.' },
];

// Filter items for main dashboard grid (excluding Dashboard itself, POS, Products, Transactions, Backup/Restore, Settings as they are quick access or specific pages)
export const dashboardGridItems: NavItem[] = navItems.filter(item =>
  !['/', '/pos', '/products', '/transactions', '/backup-restore', '/settings'].includes(item.href)
);

// Items for Quick Access section on Dashboard
export const dashboardQuickAccessItems: NavItem[] = navItems.filter(item =>
    ['/pos', '/products', '/transactions', '/backup-restore'].includes(item.href)
);
