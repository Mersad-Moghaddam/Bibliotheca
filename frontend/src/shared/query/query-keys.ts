export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const
  },
  books: {
    all: ['books'] as const,
    list: (params?: { search?: string; status?: string; genre?: string; sortBy?: string; order?: 'asc' | 'desc' }) => ['books', 'list', params] as const,
    detail: (id: string) => ['books', 'detail', id] as const
  },
  wishlist: {
    list: ['wishlist', 'list'] as const
  },
  dashboard: {
    summary: ['dashboard', 'summary'] as const,
    analytics: ['dashboard', 'analytics'] as const,
    goals: ['dashboard', 'goals'] as const,
    sessions: ['dashboard', 'sessions'] as const,
    sessionsByBook: (bookId: string) => ['dashboard', 'sessions', 'book', bookId] as const,
    insights: ['dashboard', 'insights'] as const,
    reminder: ['dashboard', 'reminder'] as const
  },
  profile: {
    reminder: ['profile', 'reminder'] as const
  }
}
