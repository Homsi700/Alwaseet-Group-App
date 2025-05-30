import { z } from "zod";

export const productSchema = z.object({
  name: z.string()
    .min(1, "اسم المنتج مطلوب")
    .max(255, "اسم المنتج يجب أن لا يتجاوز 255 حرف"),
  barcode: z.string()
    .optional(),
  description: z.string()
    .optional(),
  categoryId: z.number()
    .optional(),
  purchasePrice: z.number()
    .min(0, "سعر الشراء يجب أن يكون أكبر من أو يساوي 0"),
  salePrice: z.number()
    .min(0, "سعر البيع يجب أن يكون أكبر من أو يساوي 0"),
  quantity: z.number()
    .default(0),
  unitOfMeasure: z.string()
    .optional(),
  minimumQuantity: z.number()
    .optional(),
  imageUrl: z.string()
    .optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
