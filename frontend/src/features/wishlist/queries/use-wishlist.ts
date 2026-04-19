import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { analyticsEvents } from '../../../shared/analytics/events'
import { analytics } from '../../../shared/analytics/tracker'
import { queryKeys } from '../../../shared/query/query-keys'
import { addWishlistItem, addWishlistLink, deleteWishlistItem, fetchWishlist } from '../api/wishlist-api'

export function useWishlistQuery() {
  return useQuery({ queryKey: queryKeys.wishlist.list, queryFn: fetchWishlist })
}

export function useAddWishlistItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addWishlistItem,
    onSuccess: () => {
      analytics.track(analyticsEvents.wishlistItemCreated)
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
      analytics.track(analyticsEvents.wishlistLinkCreated)
      void queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.list })
    }
  })
}

export function useDeleteWishlistItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteWishlistItem,
    onSuccess: () => {
      analytics.track(analyticsEvents.wishlistItemDeleted)
      void queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.list })
    }
  })
}
