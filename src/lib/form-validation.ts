import { z } from 'zod';

// رسائل خطأ مخصصة باللغة العربية
export const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === 'string') {
      return { message: 'يجب أن يكون هذا الحقل نصاً' };
    }
    if (issue.expected === 'number') {
      return { message: 'يجب أن يكون هذا الحقل رقماً' };
    }
  }
  
  if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.type === 'string') {
      return { message: `يجب أن يحتوي هذا الحقل على ${issue.minimum} حرف على الأقل` };
    }
    if (issue.type === 'number') {
      return { message: `يجب أن يكون هذا الرقم ${issue.minimum} أو أكبر` };
    }
    if (issue.type === 'array') {
      return { message: `يجب أن يحتوي هذا الحقل على ${issue.minimum} عنصر على الأقل` };
    }
  }
  
  if (issue.code === z.ZodIssueCode.too_big) {
    if (issue.type === 'string') {
      return { message: `يجب أن يحتوي هذا الحقل على ${issue.maximum} حرف كحد أقصى` };
    }
    if (issue.type === 'number') {
      return { message: `يجب أن يكون هذا الرقم ${issue.maximum} أو أصغر` };
    }
    if (issue.type === 'array') {
      return { message: `يجب أن يحتوي هذا الحقل على ${issue.maximum} عنصر كحد أقصى` };
    }
  }
  
  if (issue.code === z.ZodIssueCode.invalid_string) {
    if (issue.validation === 'email') {
      return { message: 'يجب إدخال بريد إلكتروني صحيح' };
    }
    if (issue.validation === 'url') {
      return { message: 'يجب إدخال رابط صحيح' };
    }
    if (issue.validation === 'uuid') {
      return { message: 'يجب إدخال معرف UUID صحيح' };
    }
    if (issue.validation === 'regex') {
      return { message: 'يجب أن يتطابق هذا الحقل مع التنسيق المطلوب' };
    }
  }
  
  return { message: ctx.defaultError };
};

// تعيين رسائل الخطأ المخصصة
z.setErrorMap(customErrorMap);

// مخططات التحقق الشائعة
export const validationSchemas = {
  // التحقق من البريد الإلكتروني
  email: z.string().email(),
  
  // التحقق من كلمة المرور (8 أحرف على الأقل، حرف كبير، حرف صغير، رقم)
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
  
  // التحقق من رقم الهاتف السعودي
  saudiPhoneNumber: z.string().regex(/^(05)[0-9]{8}$/),
  
  // التحقق من الاسم (حروف فقط)
  name: z.string().min(2).regex(/^[\u0600-\u06FFa-zA-Z\s]+$/),
  
  // التحقق من الرقم الإيجابي
  positiveNumber: z.number().positive(),
  
  // التحقق من التاريخ
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  
  // التحقق من الرقم الضريبي السعودي
  vatNumber: z.string().regex(/^3\d{14}$/),
};

// مخططات نماذج شائعة
export const formSchemas = {
  // نموذج تسجيل الدخول
  login: z.object({
    email: validationSchemas.email,
    password: z.string().min(1, { message: 'كلمة المرور مطلوبة' }),
    rememberMe: z.boolean().optional(),
  }),
  
  // نموذج إنشاء حساب
  register: z.object({
    name: validationSchemas.name,
    email: validationSchemas.email,
    password: validationSchemas.password,
    confirmPassword: z.string(),
    terms: z.boolean().refine(val => val === true, {
      message: 'يجب الموافقة على الشروط والأحكام',
    }),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  }),
  
  // نموذج إضافة منتج
  product: z.object({
    name: z.string().min(2, { message: 'اسم المنتج مطلوب' }),
    description: z.string().optional(),
    price: z.number().positive({ message: 'يجب أن يكون السعر رقماً موجباً' }),
    quantity: z.number().int().nonnegative({ message: 'يجب أن تكون الكمية رقماً صحيحاً غير سالب' }),
    categoryId: z.number().int().positive({ message: 'يجب اختيار فئة' }),
    barcode: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
  }),
  
  // نموذج إضافة عميل
  customer: z.object({
    name: validationSchemas.name,
    email: validationSchemas.email.optional().or(z.literal('')),
    phone: validationSchemas.saudiPhoneNumber,
    address: z.string().optional(),
    vatNumber: z.string().optional(),
    notes: z.string().optional(),
  }),
};

// دالة مساعدة للتحقق من صحة البيانات
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}