import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/query/query-keys'
import { addWishlistItem, addWishlistLink, fetchWishlist } from '../api/wishlist-api'

export function useWishlistQuery() {
  return useQuery({ queryKey: queryKeys.wishlist.list, queryFn: fetchWishlist })
}

export function useAddWishlistItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addWishlistItem,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.list })
    }
  })
}

export function useAddWishlistLinkMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, label, url }: { itemId: string; label?: string; url: string }) =>
      addWishlistLink(itemId, { label, url }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.list })
    }
  })
}
