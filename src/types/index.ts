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
    productId: number;
    name: string;
    barcode: string;
    description: string;
    categoryId: number;
    purchasePrice: number;
    salePrice: number;
    quantity: number;
    unitOfMeasure: string;
    minimumQuantity: number;
    imageUrl: string;
    companyId: number;
    isActive: boolean;
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
