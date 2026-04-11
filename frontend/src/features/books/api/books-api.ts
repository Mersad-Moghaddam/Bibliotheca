import api from '../../../api/client'
import { Book, BookStatus } from '../../../types'

const asItems = <T,>(data: T[] | { items: T[] }) => (Array.isArray(data) ? data : data.items)

export async function fetchBooks(params?: { search?: string; status?: string }) {
  const response = await api.get<Book[] | { items: Book[] }>('/books', { params })
  return asItems(response.data)
}

export async function fetchBook(id: string) {
  const response = await api.get<Book>(`/books/${id}`)
  return response.data
}

export async function createBook(payload: {
  title: string
  author: string
  totalPages: number
  status: BookStatus
}) {
  await api.post('/books', payload)
}

export async function updateBookStatus(id: string, status: BookStatus) {
  await api.patch(`/books/${id}/status`, { status })
}

export async function updateBookProgress(id: string, currentPage: number) {
  await api.patch(`/books/${id}/progress`, { currentPage })
}

export async function deleteBook(id: string) {
  await api.delete(`/books/${id}`)
}
