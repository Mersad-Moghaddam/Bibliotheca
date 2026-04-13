import { z } from 'zod'

export const addBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  totalPages: z.number().int().min(1, 'Total pages must be at least 1'),
  status: z.enum(['inLibrary', 'currentlyReading', 'finished', 'nextToRead']),
  coverUrl: z.string().url().optional().or(z.literal('')),
  genre: z.string().max(120).optional(),
  isbn: z.string().max(40).optional()
})

export const progressSchema = z.object({
  currentPage: z.number().int().min(0, 'Page cannot be negative')
})

export const editBookDetailsSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    author: z.string().min(1, 'Author is required'),
    totalPages: z.number().int().min(1, 'Total pages must be at least 1'),
    currentPage: z.number().int().min(0, 'Page cannot be negative'),
    status: z.enum(['inLibrary', 'currentlyReading', 'finished', 'nextToRead']),
    coverUrl: z.string().url('Cover URL must be a valid URL').optional().or(z.literal('')),
    genre: z.string().max(120).optional(),
    isbn: z.string().max(40).optional()
  })
  .refine((value) => value.currentPage <= value.totalPages, {
    message: 'Current page cannot exceed total pages',
    path: ['currentPage']
  })

export type AddBookValues = z.infer<typeof addBookSchema>
export type ProgressValues = z.infer<typeof progressSchema>
export type EditBookDetailsValues = z.infer<typeof editBookDetailsSchema>
