/**
 * وظائف مساعدة لتحسين الصور وتحميلها
 */

// تحويل حجم الصورة
export function getImageSize(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  // حساب النسبة
  const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
  
  // حساب الأبعاد الجديدة
  const width = Math.round(originalWidth * ratio);
  const height = Math.round(originalHeight * ratio);
  
  return { width, height };
}

// الحصول على حجم الصورة المناسب للشاشة
export function getResponsiveImageSize(
  originalWidth: number,
  originalHeight: number,
  containerWidth: number
): { width: number; height: number } {
  const ratio = originalHeight / originalWidth;
  const width = Math.min(originalWidth, containerWidth);
  const height = Math.round(width * ratio);
  
  return { width, height };
}

// تحميل صورة مسبقاً
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// تحميل مجموعة من الصور مسبقاً
export async function preloadImages(srcs: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(srcs.map(preloadImage));
}

// تحويل صورة إلى Base64
export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// ضغط صورة
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // حساب الأبعاد الجديدة
        const { width, height } = getImageSize(img.width, img.height, maxWidth, maxHeight);
        
        // إنشاء canvas لضغط الصورة
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // رسم الصورة على canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('فشل إنشاء سياق canvas'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // تحويل canvas إلى blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('فشل ضغط الصورة'));
              return;
            }
            
            // إنشاء ملف جديد
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      img.onerror = () => {
        reject(new Error('فشل تحميل الصورة'));
      };
    };
    reader.onerror = () => {
      reject(new Error('فشل قراءة الملف'));
    };
  });
}

// التحقق من صحة الصورة
export function validateImage(
  file: File,
  options: {
    maxSizeInMB?: number;
    allowedTypes?: string[];
    minWidth?: number;
    minHeight?: number;
  } = {}
): Promise<{ valid: boolean; error?: string }> {
  const {
    maxSizeInMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    minWidth = 0,
    minHeight = 0,
  } = options;
  
  // التحقق من نوع الملف
  if (!allowedTypes.includes(file.type)) {
    return Promise.resolve({
      valid: false,
      error: `نوع الملف غير مدعوم. الأنواع المدعومة: ${allowedTypes.join(', ')}`,
    });
  }
  
  // التحقق من حجم الملف
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return Promise.resolve({
      valid: false,
      error: `حجم الملف يجب أن يكون أقل من ${maxSizeInMB} ميجابايت`,
    });
  }
  
  // التحقق من أبعاد الصورة
  if (minWidth > 0 || minHeight > 0) {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        
        if (img.width < minWidth) {
          resolve({
            valid: false,
            error: `عرض الصورة يجب أن يكون على الأقل ${minWidth} بكسل`,
          });
        } else if (img.height < minHeight) {
          resolve({
            valid: false,
            error: `ارتفاع الصورة يجب أن يكون على الأقل ${minHeight} بكسل`,
          });
        } else {
          resolve({ valid: true });
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          valid: false,
          error: 'فشل تحميل الصورة للتحقق من أبعادها',
        });
      };
      
      img.src = objectUrl;
    });
  }
  
  return Promise.resolve({ valid: true });
}