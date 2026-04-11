import api from '../../../api/client'
import { WishlistItem } from '../../../types'

const asItems = <T,>(data: T[] | { items: T[] }) => (Array.isArray(data) ? data : data.items)

export async function fetchWishlist() {
  const response = await api.get<WishlistItem[] | { items: WishlistItem[] }>('/wishlist')
  return asItems(response.data)
}

export async function addWishlistItem(payload: {
  title: string
  author: string
  expectedPrice?: number | null
  notes?: string | null
}) {
  await api.post('/wishlist', payload)
}

export async function addWishlistLink(itemId: string, payload: { label?: string | null; url: string }) {
  await api.post(`/wishlist/${itemId}/links`, payload)
}
