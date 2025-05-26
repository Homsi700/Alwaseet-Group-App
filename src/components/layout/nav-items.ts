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
  { title: 'Dashboard', href: '/', icon: LayoutGrid, description: 'Overview of your business metrics and modules.' },
  { title: 'Point of Sale', href: '/pos', icon: ShoppingCart, description: 'Quickly create new sales invoices and process transactions.' },
  { title: 'Products', href: '/products', icon: Package, description: 'Manage your product catalog, stock, and pricing.' },
  { title: 'Transactions', href: '/transactions', icon: History, description: 'View and filter all financial transaction logs.' },
  { title: 'Sales', href: '/sales', icon: TrendingUp, description: 'Track and manage sales orders, invoices, and customer payments.' },
  { title: 'Purchases', href: '/purchases', icon: ShoppingBag, description: 'Manage purchase orders, bills, and supplier payments.' },
  { title: 'Inventory', href: '/inventory', icon: Archive, description: 'Oversee stock levels, movements, and inventory valuation.' },
  { title: 'Customers', href: '/customers', icon: Users, description: 'Maintain your customer database and track interactions.' },
  { title: 'Suppliers', href: '/suppliers', icon: Truck, description: 'Keep track of your suppliers, contacts, and purchase history.' },
  { title: 'Finance', href: '/finance', icon: Landmark, description: 'Manage chart of accounts, journal entries, and financial health.' },
  { title: 'Reports', href: '/reports', icon: BarChartBig, description: 'Generate insightful business reports on sales, expenses, and more.' },
  { title: 'Backup & Restore', href: '/backup-restore', icon: DatabaseBackup, description: 'Secure your data with backups and restore when needed.' },
  { title: 'Settings', href: '/settings', icon: Settings, description: 'Configure application settings, user roles, and preferences.' },
];

// Filter items for main dashboard grid (excluding Dashboard itself, POS, Products, Transactions, Backup/Restore, Settings as they are quick access or specific pages)
export const dashboardGridItems: NavItem[] = navItems.filter(item =>
  !['/', '/pos', '/products', '/transactions', '/backup-restore', '/settings'].includes(item.href)
);

// Items for Quick Access section on Dashboard
export const dashboardQuickAccessItems: NavItem[] = navItems.filter(item =>
    ['/pos', '/products', '/transactions', '/backup-restore'].includes(item.href)
);
