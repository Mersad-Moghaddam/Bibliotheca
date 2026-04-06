export type User = { id: string; name: string; email: string }
export type Book = {
  id: string
  title: string
  author: string
  total_pages: number
  status: string
  current_page: number | null
  remaining_pages: number
  progress_percentage: number
  completed_at: string | null
}
export type PurchaseLink = { id: string; label: string; url: string }
export type WishlistItem = {
  id: string
  title: string
  author: string
  expected_price: number | null
  notes: string | null
  purchase_links: PurchaseLink[]
}
