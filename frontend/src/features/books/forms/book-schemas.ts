import { z } from 'zod'

export const addBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  totalPages: z.number().int().min(1, 'Total pages must be at least 1'),
  status: z.enum(['inLibrary', 'currentlyReading', 'finished', 'nextToRead'])
})

export const progressSchema = z.object({
  currentPage: z.number().int().min(0, 'Page cannot be negative')
})

export type AddBookValues = z.infer<typeof addBookSchema>
export type ProgressValues = z.infer<typeof progressSchema>
