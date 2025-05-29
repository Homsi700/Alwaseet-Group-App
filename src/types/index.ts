
// نوع البيانات للمستخدم
export interface User {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    companyId: number;
    isActive: boolean;
}

// نوع البيانات للمنتج
export interface Product {
    productId: number; // Kept as productId for consistency with potential DB
    id: string; // Used for client-side keying and optimistic updates if needed
    name: string;
    barcode: string;
    description?: string;
    categoryId?: number; // Link to Category
    categoryName?: string; // Denormalized for display
    purchasePrice: number;
    salePrice: number;
    quantity: number;
    unitOfMeasure?: string;
    minimumQuantity?: number; // For low stock alerts
    expirationDate?: string;
    supplier?: string; // Optional, could be linked to a supplier table later
    imageUrl?: string;
    companyId?: number; // Assuming products are company-specific
    isActive?: boolean;
}

// نوع البيانات للفئة
export interface Category {
    categoryId: number;
    id: string; // Client-side key
    name: string;
    description?: string;
    companyId?: number;
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
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: number;
    isActive?: boolean;
}


// نوع البيانات للفاتورة
export interface Invoice {
    invoiceId: number;
    invoiceNumber: string;
    invoiceDate: Date | string;
    customerId: number;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    customerTaxNumber?: string;
    paymentMethod: string;
    subTotal: number;
    discountPercent: number;
    discountAmount: number;
    taxPercent: number;
    taxAmount: number;
    totalAmount: number;
    amountPaid: number;
    amountDue: number;
    status: string;
    notes?: string;
    companyId: number;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
    companyTaxNumber?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    createdBy: number;
    createdByUsername?: string;
    createdByFirstName?: string;
    createdByLastName?: string;
}

// نوع البيانات لبنود الفاتورة
export interface InvoiceItem {
    invoiceItemId?: number;
    invoiceId?: number;
    productId: number;
    productName?: string;
    productBarcode?: string;
    quantity: number;
    unitOfMeasure?: string;
    unitPrice: number;
    discountPercent: number;
    discountAmount: number;
    taxPercent: number;
    taxAmount: number;
    lineTotal: number;
}

// نوع البيانات للحساب المحاسبي
export interface Account {
    accountId: number;
    accountCode: string;
    accountName: string;
    accountType: string;
    balance: number;
    companyId: number;
    isActive: boolean;
}

// For API responses, especially for paginated lists
export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

