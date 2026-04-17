import { z } from 'zod'

export const wishlistItemSchema = z.object({
  title: z.string().min(1, 'validation.titleRequired'),
  author: z.string().min(1, 'validation.authorRequired'),
  expectedPrice: z.number().min(0, 'validation.priceNonNegative').optional(),
  notes: z.string().optional()
})

export const wishlistLinkSchema = z.object({
  label: z.string().optional(),
  url: z.string().url('validation.validUrl')
})

export type WishlistItemValues = z.infer<typeof wishlistItemSchema>
export type WishlistLinkValues = z.infer<typeof wishlistLinkSchema>
