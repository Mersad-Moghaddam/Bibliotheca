export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const
  },
  books: {
    all: ['books'] as const,
    list: (params?: { search?: string; status?: string }) => ['books', 'list', params] as const,
    detail: (id: string) => ['books', 'detail', id] as const
  },
  wishlist: {
    list: ['wishlist', 'list'] as const
  },
  dashboard: {
    analytics: ['dashboard', 'analytics'] as const,
    insights: ['dashboard', 'insights'] as const,
    reminder: ['dashboard', 'reminder'] as const
  },
  profile: {
    reminder: ['profile', 'reminder'] as const
  }
}
