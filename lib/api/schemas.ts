import { z } from "zod";

export const listExamplesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const exampleIdSchema = z.object({
  id: z.string().uuid("Invalid example id"),
});

export const createExampleSchema = z.object({
  title: z.string().trim().min(1).max(120),
  details: z.string().trim().max(1000).optional(),
});

export const updateExampleSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    details: z.string().trim().max(1000).nullable().optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "Provide at least one field to update",
  });

export type CreateExampleInput = z.infer<typeof createExampleSchema>;
export type UpdateExampleInput = z.infer<typeof updateExampleSchema>;
