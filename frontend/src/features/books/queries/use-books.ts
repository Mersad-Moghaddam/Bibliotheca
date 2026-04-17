import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/query/query-keys'
import { BookStatus } from '../../../types'
import {
  createBook,
  createBookNote,
  deleteBook,
  fetchBook,
  fetchBookNotes,
  fetchBooks,
  updateBook,
  updateBookProgress,
  updateBookStatus
} from '../api/books-api'

async function invalidateReadingDerivedQueries(queryClient: ReturnType<typeof useQueryClient>, bookId?: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.books.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.analytics }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.goals }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.sessions }),
    bookId ? queryClient.invalidateQueries({ queryKey: queryKeys.books.detail(bookId) }) : Promise.resolve()
  ])
}

export function useBooksQuery(params?: { search?: string; status?: string; genre?: string; sortBy?: string; order?: 'asc' | 'desc' }) {
  return useQuery({
    queryKey: queryKeys.books.list(params),
    queryFn: () => fetchBooks(params)
  })
}

export function useBookQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.books.detail(id),
    queryFn: () => fetchBook(id),
    enabled: Boolean(id)
  })
}

export function useBookNotesQuery(id: string) {
  return useQuery({ queryKey: [...queryKeys.books.detail(id), 'notes'], queryFn: () => fetchBookNotes(id), enabled: Boolean(id) })
}

export function useCreateBookNoteMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { note: string; highlight?: string }) => createBookNote(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...queryKeys.books.detail(id), 'notes'] })
    }
  })
}

export function useCreateBookMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      void invalidateReadingDerivedQueries(queryClient)
    }
  })
}

export function useUpdateBookMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: {
      id: string
      payload: {
        title: string
        author: string
        totalPages: number
        status: BookStatus
        coverUrl?: string
        genre?: string
        isbn?: string
      }
    }) => updateBook(id, payload),
    onSuccess: (_data, variables) => {
      void invalidateReadingDerivedQueries(queryClient, variables.id)
    }
  })
}

export function useDeleteBookMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBook,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.books.all })
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.books.all })

      queryClient.setQueriesData({ queryKey: queryKeys.books.all }, (old: unknown) => {
        if (!Array.isArray(old)) return old
        return old.filter((book: { id: string }) => book.id !== id)
      })

      return { previous }
    },
    onError: (_error, _variables, context) => {
      context?.previous?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSettled: () => {
      void invalidateReadingDerivedQueries(queryClient)
    }
  })
}

export function useUpdateBookStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookStatus }) => updateBookStatus(id, status),
    onSuccess: (_data, variables) => {
      void invalidateReadingDerivedQueries(queryClient, variables.id)
    }
  })
}

export function useUpdateBookProgressMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, currentPage }: { id: string; currentPage: number }) =>
      updateBookProgress(id, currentPage),
    onSuccess: (_data, variables) => {
      void invalidateReadingDerivedQueries(queryClient, variables.id)
    }
  })
}
