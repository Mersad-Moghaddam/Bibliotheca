export type BookStatus = 'inLibrary' | 'currentlyReading' | 'finished' | 'nextToRead'

export type User = { id: string; name: string; email: string }

export type Book = {
  id: string
  title: string
  author: string
  totalPages: number
  status: BookStatus
  currentPage: number
  remainingPages: number
  progressPercentage: number
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export type PurchaseLink = {
  id: string
  label: string
  alias: string
  url: string
  createdAt: string
  updatedAt: string
}

export type WishlistItem = {
  id: string
  title: string
  author: string
  expectedPrice: number | null
  notes: string | null
  purchaseLinks: PurchaseLink[]
  createdAt: string
  updatedAt: string
}

export type ListResponse<T> = {
  items: T[]
  total: number
}
