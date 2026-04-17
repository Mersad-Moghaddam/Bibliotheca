import { z } from 'zod'

export const addBookSchema = z.object({
  title: z.string().min(1, 'validation.titleRequired'),
  author: z.string().min(1, 'validation.authorRequired'),
  totalPages: z.number().int().min(1, 'validation.totalPagesMin'),
  status: z.enum(['inLibrary', 'currentlyReading', 'finished', 'nextToRead']),
  coverUrl: z.string().url('validation.coverUrlValid').optional().or(z.literal('')),
  genre: z.string().max(120).optional(),
  isbn: z.string().max(40).optional()
})

export const progressSchema = z.object({
  currentPage: z.number().int().min(0, 'validation.pageNonNegative')
})

export const editBookDetailsSchema = z
  .object({
    title: z.string().min(1, 'validation.titleRequired'),
    author: z.string().min(1, 'validation.authorRequired'),
    totalPages: z.number().int().min(1, 'validation.totalPagesMin'),
    currentPage: z.number().int().min(0, 'validation.pageNonNegative'),
    status: z.enum(['inLibrary', 'currentlyReading', 'finished', 'nextToRead']),
    coverUrl: z.string().url('validation.coverUrlValid').optional().or(z.literal('')),
    genre: z.string().max(120).optional(),
    isbn: z.string().max(40).optional()
  })
  .refine((value) => value.currentPage <= value.totalPages, {
    message: 'validation.currentPageMax',
    path: ['currentPage']
  })

export type AddBookValues = z.infer<typeof addBookSchema>
export type ProgressValues = z.infer<typeof progressSchema>
export type EditBookDetailsValues = z.infer<typeof editBookDetailsSchema>
