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
  coverUrl?: string | null
  genre?: string | null
  isbn?: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export type BookNote = {
  id: string
  note: string
  highlight?: string | null
  createdAt: string
}

export type ReadingSession = {
  id: string
  bookId: string
  date: string
  duration: number
  pagesRead: number
}

export type GoalProgress = {
  period: 'weekly' | 'monthly'
  pagesGoal: number
  booksGoal: number
  pagesRead: number
  booksRead: number
  pagesPercent: number
  booksPercent: number
}


export type GoalStatus = 'no_goal' | 'not_started' | 'in_progress' | 'on_track' | 'completed' | 'exceeded' | 'behind'

export type GoalPeriodOverview = {
  period: 'weekly' | 'monthly'
  startDate: string
  endDate: string
  targetPages?: number
  targetBooks?: number
  source?: 'manual' | 'suggested' | 'applied_suggestion'
  pagesRead: number
  booksRead: number
  percent: number
  status: GoalStatus
  exceeded: boolean
}

export type GoalSuggestion = {
  period: 'weekly' | 'monthly'
  targetPages?: number
  targetBooks?: number
  reason: string
  reasonKey?: 'restart_pace' | 'consistency_stretch' | 'recent_pace'
  confidence: 'low' | 'medium' | 'high'
  signals: {
    recentWeeklyPagesMedian: number
    recentMonthlyPagesMedian: number
    weeklySessions: number
    activeWeeks: number
    completedBooks30d: number
  }
}

export type ReadingGoalsOverview = {
  weekly: GoalPeriodOverview
  monthly: GoalPeriodOverview
  suggestions: GoalSuggestion[]
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

export type AnalyticsPoint = { label: string; count: number }

export type ReadingAnalytics = {
  base: {
    booksCompleted: number
    activeReading: number
    totalBooks: number
    totalPagesRead: number
    completionRate: number
    readingPacePerMonth: number
    currentStreakWeeks: number
    statusDistribution: Record<BookStatus, number>
    monthlyActivity: AnalyticsPoint[]
    weeklyActivity: AnalyticsPoint[]
  }
  trend: { date: string; pages: number; duration: number }[]
  consistencyScore: number
  backlogHealth: 'light' | 'balanced' | 'heavy'
  sessionPages: number
}

export type ReadingInsight = { tone: string; message: string }

export type ReminderSettings = {
  enabled: boolean
  time: string
  frequency: 'daily' | 'weekdays' | 'weekends' | 'weekly'
  nextReminderAt?: string | null
}

export type ListResponse<T> = {
  items: T[]
  total: number
}
