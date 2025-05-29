/**
 * هذا الملف يحتوي على تعريفات لهيكل قاعدة البيانات
 * يستخدم كمرجع لجميع الاستعلامات في التطبيق
 */

export const Schema = {
  // مخططات قاعدة البيانات
  schemas: {
    settings: 'settings',
    inventory: 'inventory',
    sales: 'sales',
    accounting: 'accounting',
  },
  
  // جداول قاعدة البيانات
  tables: {
    // جداول الإعدادات
    companies: 'settings.Companies',
    users: 'settings.Users',
    
    // جداول المخزون
    categories: 'inventory.Categories',
    products: 'inventory.Products',
    
    // جداول المبيعات
    customers: 'sales.Customers',
    invoices: 'sales.Invoices',
    invoiceItems: 'sales.InvoiceItems',
    
    // جداول المحاسبة
    chartOfAccounts: 'accounting.ChartOfAccounts',
    journalEntries: 'accounting.JournalEntries',
    journalEntryDetails: 'accounting.JournalEntryDetails',
  },
  
  // أعمدة الجداول
  columns: {
    // أعمدة جدول الشركات
    companies: {
      id: 'CompanyId',
      name: 'Name',
      taxNumber: 'TaxNumber',
      address: 'Address',
      phoneNumber: 'PhoneNumber',
      email: 'Email',
      currencyCode: 'CurrencyCode',
      currencySymbol: 'CurrencySymbol',
      logo: 'Logo',
      createdAt: 'CreatedAt',
      updatedAt: 'UpdatedAt',
      isActive: 'IsActive',
    },
    
    // أعمدة جدول المستخدمين
    users: {
      id: 'UserId',
      username: 'Username',
      passwordHash: 'PasswordHash',
      firstName: 'FirstName',
      lastName: 'LastName',
      email: 'Email',
      role: 'Role',
      companyId: 'CompanyId',
      createdAt: 'CreatedAt',
      updatedAt: 'UpdatedAt',
      lastLogin: 'LastLogin',
      isActive: 'IsActive',
    },
    
    // أعمدة جدول الفئات
    categories: {
      id: 'CategoryId',
      name: 'Name',
      description: 'Description',
      parentCategoryId: 'ParentCategoryId',
      companyId: 'CompanyId',
      createdAt: 'CreatedAt',
      updatedAt: 'UpdatedAt',
      createdBy: 'CreatedBy',
      isActive: 'IsActive',
    },
    
    // أعمدة جدول المنتجات
    products: {
      id: 'ProductId',
      name: 'Name',
      barcode: 'Barcode',
      description: 'Description',
      categoryId: 'CategoryId',
      purchasePrice: 'PurchasePrice',
      salePrice: 'SalePrice',
      quantity: 'Quantity',
      unitOfMeasure: 'UnitOfMeasure',
      minimumQuantity: 'MinimumQuantity',
      imageUrl: 'ImageUrl',
      companyId: 'CompanyId',
      createdAt: 'CreatedAt',
      updatedAt: 'UpdatedAt',
      createdBy: 'CreatedBy',
      isActive: 'IsActive',
    },
    
    // أعمدة جدول العملاء
    customers: {
      id: 'CustomerId',
      name: 'Name',
      contactPerson: 'ContactPerson',
      phoneNumber: 'PhoneNumber',
      email: 'Email',
      address: 'Address',
      taxNumber: 'TaxNumber',
      creditLimit: 'CreditLimit',
      balance: 'Balance',
      companyId: 'CompanyId',
      createdAt: 'CreatedAt',
      updatedAt: 'UpdatedAt',
      createdBy: 'CreatedBy',
      isActive: 'IsActive',
    },
    
    // أعمدة جدول الفواتير
    invoices: {
      id: 'InvoiceId',
      invoiceNumber: 'InvoiceNumber',
      invoiceDate: 'InvoiceDate',
      customerId: 'CustomerId',
      paymentMethod: 'PaymentMethod',
      subTotal: 'SubTotal',
      discountPercent: 'DiscountPercent',
      discountAmount: 'DiscountAmount',
      taxPercent: 'TaxPercent',
      taxAmount: 'TaxAmount',
      totalAmount: 'TotalAmount',
      amountPaid: 'AmountPaid',
      amountDue: 'AmountDue',
      status: 'Status',
      notes: 'Notes',
      companyId: 'CompanyId',
      createdAt: 'CreatedAt',
      updatedAt: 'UpdatedAt',
      createdBy: 'CreatedBy',
    },
    
    // أعمدة جدول بنود الفواتير
    invoiceItems: {
      id: 'InvoiceItemId',
      invoiceId: 'InvoiceId',
      productId: 'ProductId',
      quantity: 'Quantity',
      unitPrice: 'UnitPrice',
      discountPercent: 'DiscountPercent',
      discountAmount: 'DiscountAmount',
      taxPercent: 'TaxPercent',
      taxAmount: 'TaxAmount',
      lineTotal: 'LineTotal',
    },
    
    // أعمدة جدول الحسابات المحاسبية
    chartOfAccounts: {
      id: 'AccountId',
      accountCode: 'AccountCode',
      accountName: 'AccountName',
      accountType: 'AccountType',
      parentAccountId: 'ParentAccountId',
      balance: 'Balance',
      companyId: 'CompanyId',
      createdAt: 'CreatedAt',
      updatedAt: 'UpdatedAt',
      createdBy: 'CreatedBy',
      isActive: 'IsActive',
    },
    
    // أعمدة جدول القيود المحاسبية
    journalEntries: {
      id: 'EntryId',
      entryNumber: 'EntryNumber',
      entryDate: 'EntryDate',
      description: 'Description',
      referenceType: 'ReferenceType',
      referenceId: 'ReferenceId',
      companyId: 'CompanyId',
      createdAt: 'CreatedAt',
      updatedAt: 'UpdatedAt',
      createdBy: 'CreatedBy',
      isPosted: 'IsPosted',
    },
    
    // أعمدة جدول تفاصيل القيود المحاسبية
    journalEntryDetails: {
      id: 'EntryDetailId',
      entryId: 'EntryId',
      accountId: 'AccountId',
      debitAmount: 'DebitAmount',
      creditAmount: 'CreditAmount',
      notes: 'Notes',
    },
  },
};

// استعلامات مشتركة
export const CommonQueries = {
  // استعلام للتحقق من وجود عميل
  checkCustomerExists: `
    SELECT ${Schema.columns.customers.id} 
    FROM ${Schema.tables.customers} 
    WHERE ${Schema.columns.customers.id} = @customerId
  `,
  
  // استعلام للتحقق من وجود منتج
  checkProductExists: `
    SELECT ${Schema.columns.products.id} 
    FROM ${Schema.tables.products} 
    WHERE ${Schema.columns.products.id} = @productId
  `,
  
  // استعلام لتحديث كمية المنتج
  updateProductQuantity: `
    UPDATE ${Schema.tables.products}
    SET ${Schema.columns.products.quantity} = ${Schema.columns.products.quantity} - @quantity,
        ${Schema.columns.products.updatedAt} = GETDATE()
    WHERE ${Schema.columns.products.id} = @productId
  `,
  
  // استعلام لإنشاء فاتورة جديدة
  createInvoice: `
    INSERT INTO ${Schema.tables.invoices} (
      ${Schema.columns.invoices.invoiceNumber}, 
      ${Schema.columns.invoices.invoiceDate}, 
      ${Schema.columns.invoices.customerId}, 
      ${Schema.columns.invoices.paymentMethod},
      ${Schema.columns.invoices.subTotal}, 
      ${Schema.columns.invoices.discountPercent}, 
      ${Schema.columns.invoices.discountAmount}, 
      ${Schema.columns.invoices.taxPercent},
      ${Schema.columns.invoices.taxAmount}, 
      ${Schema.columns.invoices.totalAmount}, 
      ${Schema.columns.invoices.amountPaid}, 
      ${Schema.columns.invoices.amountDue},
      ${Schema.columns.invoices.status}, 
      ${Schema.columns.invoices.notes}, 
      ${Schema.columns.invoices.companyId}, 
      ${Schema.columns.invoices.createdBy}
    )
    OUTPUT INSERTED.${Schema.columns.invoices.id} as invoiceId, 
           INSERTED.${Schema.columns.invoices.invoiceNumber} as invoiceNumber
    VALUES (
      @invoiceNumber, @invoiceDate, @customerId, @paymentMethod,
      @subTotal, @discountPercent, @discountAmount, @taxPercent,
      @taxAmount, @totalAmount, @amountPaid, @amountDue,
      @status, @notes, @companyId, @createdBy
    )
  `,
  
  // استعلام لإضافة بند فاتورة
  addInvoiceItem: `
    INSERT INTO ${Schema.tables.invoiceItems} (
      ${Schema.columns.invoiceItems.invoiceId}, 
      ${Schema.columns.invoiceItems.productId}, 
      ${Schema.columns.invoiceItems.quantity}, 
      ${Schema.columns.invoiceItems.unitPrice},
      ${Schema.columns.invoiceItems.discountPercent}, 
      ${Schema.columns.invoiceItems.discountAmount}, 
      ${Schema.columns.invoiceItems.taxPercent},
      ${Schema.columns.invoiceItems.taxAmount}, 
      ${Schema.columns.invoiceItems.lineTotal}
    )
    VALUES (
      @invoiceId, @productId, @quantity, @unitPrice,
      @discountPercent, @discountAmount, @taxPercent,
      @taxAmount, @lineTotal
    )
  `,
  
  // استعلام للحصول على فاتورة مع بياناتها الكاملة
  getInvoiceWithDetails: `
    SELECT 
      i.${Schema.columns.invoices.id} as invoiceId,
      i.${Schema.columns.invoices.invoiceNumber} as invoiceNumber,
      i.${Schema.columns.invoices.invoiceDate} as invoiceDate,
      i.${Schema.columns.invoices.customerId} as customerId,
      c.${Schema.columns.customers.name} as customerName,
      c.${Schema.columns.customers.phoneNumber} as customerPhone,
      c.${Schema.columns.customers.email} as customerEmail,
      c.${Schema.columns.customers.address} as customerAddress,
      c.${Schema.columns.customers.taxNumber} as customerTaxNumber,
      i.${Schema.columns.invoices.paymentMethod} as paymentMethod,
      i.${Schema.columns.invoices.subTotal} as subTotal,
      i.${Schema.columns.invoices.discountPercent} as discountPercent,
      i.${Schema.columns.invoices.discountAmount} as discountAmount,
      i.${Schema.columns.invoices.taxPercent} as taxPercent,
      i.${Schema.columns.invoices.taxAmount} as taxAmount,
      i.${Schema.columns.invoices.totalAmount} as totalAmount,
      i.${Schema.columns.invoices.amountPaid} as amountPaid,
      i.${Schema.columns.invoices.amountDue} as amountDue,
      i.${Schema.columns.invoices.status} as status,
      i.${Schema.columns.invoices.notes} as notes,
      i.${Schema.columns.invoices.companyId} as companyId,
      i.${Schema.columns.invoices.createdAt} as createdAt,
      i.${Schema.columns.invoices.updatedAt} as updatedAt,
      i.${Schema.columns.invoices.createdBy} as createdBy,
      u.${Schema.columns.users.username} as createdByUsername,
      u.${Schema.columns.users.firstName} as createdByFirstName,
      u.${Schema.columns.users.lastName} as createdByLastName,
      co.${Schema.columns.companies.name} as companyName,
      co.${Schema.columns.companies.address} as companyAddress,
      co.${Schema.columns.companies.phoneNumber} as companyPhone,
      co.${Schema.columns.companies.email} as companyEmail,
      co.${Schema.columns.companies.taxNumber} as companyTaxNumber
    FROM ${Schema.tables.invoices} i
    LEFT JOIN ${Schema.tables.customers} c ON i.${Schema.columns.invoices.customerId} = c.${Schema.columns.customers.id}
    LEFT JOIN ${Schema.tables.users} u ON i.${Schema.columns.invoices.createdBy} = u.${Schema.columns.users.id}
    LEFT JOIN ${Schema.tables.companies} co ON i.${Schema.columns.invoices.companyId} = co.${Schema.columns.companies.id}
    WHERE i.${Schema.columns.invoices.id} = @invoiceId
  `,
  
  // استعلام للحصول على بنود فاتورة
  getInvoiceItems: `
    SELECT 
      ii.${Schema.columns.invoiceItems.id} as invoiceItemId,
      ii.${Schema.columns.invoiceItems.invoiceId} as invoiceId,
      ii.${Schema.columns.invoiceItems.productId} as productId,
      p.${Schema.columns.products.name} as productName,
      p.${Schema.columns.products.barcode} as productBarcode,
      ii.${Schema.columns.invoiceItems.quantity} as quantity,
      p.${Schema.columns.products.unitOfMeasure} as unitOfMeasure,
      ii.${Schema.columns.invoiceItems.unitPrice} as unitPrice,
      ii.${Schema.columns.invoiceItems.discountPercent} as discountPercent,
      ii.${Schema.columns.invoiceItems.discountAmount} as discountAmount,
      ii.${Schema.columns.invoiceItems.taxPercent} as taxPercent,
      ii.${Schema.columns.invoiceItems.taxAmount} as taxAmount,
      ii.${Schema.columns.invoiceItems.lineTotal} as lineTotal
    FROM ${Schema.tables.invoiceItems} ii
    LEFT JOIN ${Schema.tables.products} p ON ii.${Schema.columns.invoiceItems.productId} = p.${Schema.columns.products.id}
    WHERE ii.${Schema.columns.invoiceItems.invoiceId} = @invoiceId
  `,
};