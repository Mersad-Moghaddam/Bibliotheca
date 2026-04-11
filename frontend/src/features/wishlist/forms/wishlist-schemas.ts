import { z } from 'zod'

export const wishlistItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  expectedPrice: z.number().min(0).optional(),
  notes: z.string().optional()
})

export const wishlistLinkSchema = z.object({
  label: z.string().optional(),
  url: z.string().url('Enter a valid URL')
})

export type WishlistItemValues = z.infer<typeof wishlistItemSchema>
export type WishlistLinkValues = z.infer<typeof wishlistLinkSchema>
