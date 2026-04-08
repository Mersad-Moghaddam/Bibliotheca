import api from '../../api/client'
import { Book } from '../../types'

export async function fetchBooks(params?: { search?: string; status?: string }) {
  const res = await api.get<Book[] | { items: Book[] }>('/books', { params })
  return Array.isArray(res.data) ? res.data : res.data.items
}

export async function deleteBook(id: string) {
  await api.delete(`/books/${id}`)
}
