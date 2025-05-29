/**
 * هذا الملف يحتوي على تعريفات TypeScript لجميع الكيانات الرئيسية في النظام
 * يتم استخدامه في جميع أنحاء التطبيق لضمان اتساق البيانات
 */

// نوع البيانات للمستخدم
export interface User {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyId: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  lastLogin?: Date | string;
  isActive: boolean;
}

// نوع البيانات للشركة
export interface Company {
  companyId: number;
  name: string;
  taxNumber?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  currencyCode?: string;
  currencySymbol?: string;
  logo?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  isActive: boolean;
}

// نوع البيانات للفئة
export interface Category {
  categoryId: number;
  name: string;
  description?: string;
  parentCategoryId?: number;
  companyId: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: number;
  isActive: boolean;
}

// نوع البيانات للمنتج
export interface Product {
  productId: number;
  name: string;
  barcode?: string;
  description?: string;
  categoryId?: number;
  categoryName?: string; // للعرض فقط
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  unitOfMeasure?: string;
  minimumQuantity?: number;
  imageUrl?: string;
  companyId: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: number;
  isActive: boolean;
}

// نوع البيانات للعميل
export interface Customer {
  customerId: number;
  name: string;
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  creditLimit?: number;
  balance?: number;
  companyId: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: number;
  isActive: boolean;
}

// نوع البيانات لبند الفاتورة
export interface InvoiceItem {
  invoiceItemId?: number;
  invoiceId?: number;
  productId: number;
  productName?: string; // للعرض فقط
  productBarcode?: string; // للعرض فقط
  quantity: number;
  unitOfMeasure?: string;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  lineTotal: number;
}

// نوع البيانات للفاتورة
export interface Invoice {
  invoiceId: number;
  invoiceNumber: string;
  invoiceDate: Date | string;
  customerId: number;
  customerName?: string; // للعرض فقط
  customerPhone?: string; // للعرض فقط
  customerEmail?: string; // للعرض فقط
  customerAddress?: string; // للعرض فقط
  customerTaxNumber?: string; // للعرض فقط
  paymentMethod: string;
  subTotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: InvoiceStatus;
  notes?: string;
  companyId: number;
  companyName?: string; // للعرض فقط
  companyAddress?: string; // للعرض فقط
  companyPhone?: string; // للعرض فقط
  companyEmail?: string; // للعرض فقط
  companyTaxNumber?: string; // للعرض فقط
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy: number;
  createdByUsername?: string; // للعرض فقط
  createdByFirstName?: string; // للعرض فقط
  createdByLastName?: string; // للعرض فقط
  items?: InvoiceItem[]; // للعرض فقط
}

// نوع البيانات لإنشاء فاتورة جديدة
export interface CreateInvoiceRequest {
  invoice: {
    invoiceNumber?: string; // اختياري، سيتم إنشاؤه تلقائيًا إذا لم يتم توفيره
    invoiceDate?: Date | string; // اختياري، سيتم استخدام التاريخ الحالي إذا لم يتم توفيره
    customerId: number;
    paymentMethod: string;
    discountPercent?: number;
    taxPercent?: number;
    amountPaid?: number;
    status?: InvoiceStatus;
    notes?: string;
  };
  items: {
    productId: number;
    quantity: number;
    unitPrice?: number; // اختياري، سيتم استخدام سعر البيع من المنتج إذا لم يتم توفيره
    discountPercent?: number;
    taxPercent?: number;
  }[];
}

// نوع البيانات لاستجابة إنشاء فاتورة
export interface CreateInvoiceResponse {
  invoice: Invoice;
  items: InvoiceItem[];
}

// حالات الفاتورة
export enum InvoiceStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded',
  Unpaid = 'Unpaid',
  PartiallyPaid = 'PartiallyPaid',
  Paid = 'Paid',
}

// نوع البيانات للحساب المحاسبي
export interface Account {
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  parentAccountId?: number;
  balance: number;
  companyId: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: number;
  isActive: boolean;
}

// نوع البيانات للقيد المحاسبي
export interface JournalEntry {
  entryId: number;
  entryNumber: string;
  entryDate: Date | string;
  description?: string;
  referenceType?: string;
  referenceId?: number;
  companyId: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy: number;
  isPosted: boolean;
  details?: JournalEntryDetail[];
}

// نوع البيانات لتفاصيل القيد المحاسبي
export interface JournalEntryDetail {
  entryDetailId: number;
  entryId: number;
  accountId: number;
  accountName?: string; // للعرض فقط
  debitAmount: number;
  creditAmount: number;
  notes?: string;
}

// نوع البيانات للاستجابة المصفحة
export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

// نوع البيانات لمعايير البحث
export interface SearchCriteria {
  searchTerm?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: string;
  customerId?: number;
  categoryId?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// نوع البيانات للخطأ
export interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}

// نوع البيانات للاستجابة الناجحة
export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

// نوع البيانات للمستخدم الحالي
export interface CurrentUser {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyId: number;
  isActive: boolean;
  permissions?: string[];
}