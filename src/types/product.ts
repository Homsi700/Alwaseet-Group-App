export interface Product {
  productId: number;
  name: string;
  barcode?: string;
  description?: string;
  categoryId?: number;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  unitOfMeasure?: string;
  minimumQuantity?: number;
  imageUrl?: string;
  companyId: number;
  createdAt: string;
  updatedAt?: string;
  createdBy: number;
  isActive: boolean;
}

export interface ProductFormData extends Omit<Product, 'productId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'companyId'> {
  categoryId: number;
}

export interface Category {
  categoryId: number;
  name: string;
  description?: string;
  parentCategoryId?: number;
  companyId: number;
  isActive: boolean;
}
