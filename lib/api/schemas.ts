import { z } from "zod";
import {
  isValidEmail,
  isValidPhilippinePhone,
  normalizePhilippinePhone,
} from "@/lib/validation/form-validators";

const nonEmptyString = z.string().trim().min(1);
const optionalDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable()
  .optional();

export const supplierIdSchema = z.object({
  id: z.string().uuid("Invalid supplier id"),
});

export const createSupplierSchema = z.object({
  name: nonEmptyString.max(160),
  contactPerson: nonEmptyString.max(160),
  email: z
    .string()
    .trim()
    .max(200)
    .refine(isValidEmail, "Enter a valid email address"),
  phone: nonEmptyString
    .max(80)
    .transform(normalizePhilippinePhone)
    .refine(isValidPhilippinePhone, "Use +639XXXXXXXXX or 09XXXXXXXXX"),
});

export const updateSupplierSchema = createSupplierSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "Provide at least one field to update",
  });

export const supplierProductIdSchema = z.object({
  id: z.string().uuid("Invalid supplier product id"),
});

export const createSupplierProductSchema = z.object({
  supplierId: z.string().uuid("Invalid supplier id"),
  name: nonEmptyString.max(180),
  sku: nonEmptyString.max(50),
  category: z.string().trim().max(120).optional().nullable(),
  unit: z.string().trim().max(60).optional().nullable(),
  price: z.coerce.number().positive().max(9999999),
});

export const updateSupplierProductSchema = createSupplierProductSchema
  .omit({ supplierId: true })
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "Provide at least one field to update",
  });

export const inventoryStockIdSchema = z.object({
  id: z.string().uuid("Invalid inventory id"),
});

export const createInventoryStockSchema = z.object({
  supplierProductId: z.string().uuid("Invalid supplier product id"),
  quantity: z.coerce.number().int().min(0),
  batchId: nonEmptyString.max(80),
  expiration: optionalDateString,
  reorderLevel: z.coerce.number().int().min(0).default(10),
});

export const updateInventoryStockSchema = createInventoryStockSchema
  .omit({ supplierProductId: true })
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "Provide at least one field to update",
  });

export const updateInventoryArchiveSchema = z.object({
  archived: z.boolean(),
});

export const checkoutLineSchema = z.object({
  inventoryId: z.string().uuid("Invalid inventory id"),
  quantity: z.coerce.number().int().min(1),
});

export const checkoutConfirmSchema = z.object({
  items: z.array(checkoutLineSchema).min(1),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type CreateSupplierProductInput = z.infer<
  typeof createSupplierProductSchema
>;
export type UpdateSupplierProductInput = z.infer<
  typeof updateSupplierProductSchema
>;
export type CreateInventoryStockInput = z.infer<
  typeof createInventoryStockSchema
>;
export type UpdateInventoryStockInput = z.infer<
  typeof updateInventoryStockSchema
>;
export type UpdateInventoryArchiveInput = z.infer<
  typeof updateInventoryArchiveSchema
>;
export type CheckoutConfirmInput = z.infer<typeof checkoutConfirmSchema>;
