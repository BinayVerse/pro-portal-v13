import { z } from 'zod'

export const createCategoryValidation = z.object({
  name: z.string().min(1, 'Category name is required').max(255, 'Category name too long'),
  org_id: z.string().optional(), // Can be extracted from token
})

export const updateCategoryValidation = z.object({
  name: z.string().min(1, 'Category name is required').max(255, 'Category name too long'),
})

export type CreateCategoryData = z.infer<typeof createCategoryValidation>
export type UpdateCategoryData = z.infer<typeof updateCategoryValidation>
