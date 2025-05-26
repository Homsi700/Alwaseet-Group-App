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
    minimumQuantity?: number;
    expirationDate?: string;
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


// نوع البيانات للفاتورة
export interface Invoice {
    invoiceId: number;
    invoiceNumber: string;
    invoiceDate: Date;
    customerId: number;
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
    notes: string;
    companyId: number;
    createdBy: number;
}

// نوع البيانات لبنود الفاتورة
export interface InvoiceItem {
    productId: number;
    quantity: number;
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
