import api from '../../../api/client'
import { extractData } from '../../../api/http'
import { Book, BookNote, BookStatus } from '../../../types'

const asItems = <T,>(data: T[] | { items: T[] }) => (Array.isArray(data) ? data : data.items)

export async function fetchBooks(params?: {
  search?: string
  status?: string
  genre?: string
  sortBy?: string
  order?: 'asc' | 'desc'
}) {
  const response = await api.get<Book[] | { items: Book[] }>('/books', { params })
  return asItems(extractData(response))
}

export async function fetchBook(id: string) {
  const response = await api.get<Book>(`/books/${id}`)
  return extractData(response)
}

export async function createBook(payload: {
  title: string
  author: string
  totalPages: number
  status: BookStatus
  coverUrl?: string
  genre?: string
  isbn?: string
}) {
  await api.post('/books', payload)
}

export async function updateBook(
  id: string,
  payload: { title: string; author: string; totalPages: number; status: BookStatus; coverUrl?: string; genre?: string; isbn?: string }
) {
  await api.put(`/books/${id}`, payload)
}

export async function updateBookStatus(id: string, status: BookStatus) {
  await api.patch(`/books/${id}/status`, { status })
}

export async function updateBookProgress(id: string, currentPage: number) {
  await api.patch(`/books/${id}/progress`, { currentPage })
}

export async function fetchBookNotes(id: string) {
  const response = await api.get<{ items: BookNote[] }>(`/books/${id}/notes`)
  return extractData(response).items
}

export async function createBookNote(id: string, payload: { note: string; highlight?: string }) {
  await api.post(`/books/${id}/notes`, payload)
}

export async function deleteBookNote(id: string, noteId: string) {
  await api.delete(`/books/${id}/notes/${noteId}`)
}

export async function deleteBook(id: string) {
  await api.delete(`/books/${id}`)
}
