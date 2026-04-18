import { Book, GoalProgress, ReadingAnalytics, ReadingSession } from '../../../types'

export type InsightState = 'loading' | 'empty' | 'ready' | 'error'
export type InsightVariant = 'positive' | 'neutral' | 'warning' | 'inactive'

export type InsightSignal = {
  labelKey: string
  value: number
  format: 'number' | 'percent'
}

export type ReadingInsightModel = {
  state: InsightState
  variant: InsightVariant
  priority: number
  titleKey: string
  messageKey: string
  recommendationKey?: string
  signals: InsightSignal[]
}

type InsightCandidate = Omit<ReadingInsightModel, 'state'>

type InsightInput = {
  books: Book[]
  analytics?: ReadingAnalytics
  goals: GoalProgress[]
  sessions: ReadingSession[]
}

type SessionWithParsedDate = ReadingSession & { parsedDate: Date }

const DAY_MS = 24 * 60 * 60 * 1000

function daysBetween(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / DAY_MS)
}

function isValidDate(value: string) {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date : null
}

function inLastDays(date: Date, days: number, now: Date) {
  const age = daysBetween(date, now)
  return age >= 0 && age <= days
}

function sumPagesInRange(sessions: ReadingSession[], minDaysAgo: number, maxDaysAgo: number, now: Date) {
  return sessions.reduce((total, session) => {
    const date = isValidDate(session.date)
    if (!date) return total
    const age = daysBetween(date, now)
    if (age >= minDaysAgo && age <= maxDaysAgo) return total + (session.pagesRead ?? 0)
    return total
  }, 0)
}

export function buildReadingInsight(input: InsightInput): ReadingInsightModel {
  const now = new Date()
  const sessions = [...input.sessions]
    .map((session) => ({ ...session, parsedDate: isValidDate(session.date) }))
    .filter((session): session is SessionWithParsedDate => session.parsedDate instanceof Date && session.parsedDate <= now)
    .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime())

  const books = input.books
  const hasAnyActivity =
    sessions.length > 0 ||
    books.some((book) => book.currentPage > 0 || book.status === 'finished' || Boolean(book.completedAt)) ||
    (input.analytics?.base.totalPagesRead ?? 0) > 0
  const activeBooks = input.books.filter((book) => book.status === 'currentlyReading')
  const recentlyCompleted = books.filter((book) => {
    if (!book.completedAt) return false
    const completedAt = isValidDate(book.completedAt)
    return completedAt instanceof Date && inLastDays(completedAt, 6, now)
  }).length
  const nearCompletionBook = activeBooks
    .filter((book) => book.progressPercentage >= 85 && book.progressPercentage < 100)
    .sort((a, b) => b.progressPercentage - a.progressPercentage)[0]

  const recent7 = sessions.filter((session) => inLastDays(session.parsedDate, 6, now))
  const previous7 = sessions.filter((session) => {
    const age = daysBetween(session.parsedDate, now)
    return age >= 7 && age <= 13
  })
  const olderHistory = sessions.filter((session) => {
    const age = daysBetween(session.parsedDate, now)
    return age >= 14 && age <= 27
  })

  const activeDays7 = new Set(recent7.map((session) => session.parsedDate.toISOString().slice(0, 10))).size
  const bookActivityDates = books
    .map((book) => isValidDate(book.updatedAt))
    .filter((date): date is Date => date instanceof Date && date <= now)
    .sort((a, b) => b.getTime() - a.getTime())
  const lastSessionActivity = sessions[0] ? daysBetween(sessions[0].parsedDate, now) : null
  const lastBookActivity = bookActivityDates[0] ? daysBetween(bookActivityDates[0], now) : null
  const lastActivityDays = [lastSessionActivity, lastBookActivity].filter((value): value is number => value !== null).sort((a, b) => a - b)[0] ?? null
  const weeklyGoal = input.goals.find((goal) => goal.period === 'weekly')
  const pagesLast7 = sumPagesInRange(input.sessions, 0, 6, now)
  const pagesPrev7 = sumPagesInRange(input.sessions, 7, 13, now)

  const candidates: InsightCandidate[] = []

  if (!hasAnyActivity) {
    return {
      state: 'empty',
      variant: 'inactive',
      priority: 100,
      titleKey: 'dashboard.insights.empty.title',
      messageKey: 'dashboard.insights.empty.message',
      recommendationKey: 'dashboard.insights.recommendations.logFirstSession',
      signals: [
        { labelKey: 'dashboard.insights.signals.activeBooks', value: activeBooks.length, format: 'number' },
        { labelKey: 'dashboard.insights.signals.loggedSessions', value: 0, format: 'number' }
      ]
    }
  }

  if (lastActivityDays !== null && lastActivityDays >= 10) {
    candidates.push({
      variant: 'warning',
      priority: 95,
      titleKey: 'dashboard.insights.titles.inactive',
      messageKey: 'dashboard.insights.messages.inactive',
      recommendationKey: 'dashboard.insights.recommendations.rebuildMomentum',
      signals: [
        { labelKey: 'dashboard.insights.signals.daysSinceLastActivity', value: lastActivityDays, format: 'number' },
        { labelKey: 'dashboard.insights.signals.sessionsThisWeek', value: recent7.length, format: 'number' }
      ]
    })
  }

  if (lastActivityDays !== null && lastActivityDays >= 4 && recent7.length === 0 && activeBooks.length > 0) {
    const recommendationKey = nearCompletionBook
      ? 'dashboard.insights.recommendations.finishClosestBook'
      : activeBooks.length >= 3
        ? 'dashboard.insights.recommendations.focusOneBook'
        : 'dashboard.insights.recommendations.logProgressOnCurrent'

    candidates.push({
      variant: 'inactive',
      priority: 92,
      titleKey: 'dashboard.insights.titles.stuck',
      messageKey: 'dashboard.insights.messages.stuck',
      recommendationKey,
      signals: [
        { labelKey: 'dashboard.insights.signals.daysSinceLastActivity', value: lastActivityDays, format: 'number' },
        { labelKey: 'dashboard.insights.signals.activeBooks', value: activeBooks.length, format: 'number' }
      ]
    })
  }

  if (nearCompletionBook) {
    candidates.push({
      variant: 'positive',
      priority: 90,
      titleKey: 'dashboard.insights.titles.nearCompletion',
      messageKey: 'dashboard.insights.messages.nearCompletion',
      recommendationKey: 'dashboard.insights.recommendations.finishClosestBook',
      signals: [
        { labelKey: 'dashboard.insights.signals.closestBookProgress', value: Math.round(nearCompletionBook.progressPercentage), format: 'percent' },
        { labelKey: 'dashboard.insights.signals.activeBooks', value: activeBooks.length, format: 'number' }
      ]
    })
  }

  if (recentlyCompleted > 0) {
    candidates.push({
      variant: 'positive',
      priority: 88,
      titleKey: 'dashboard.insights.titles.goalAhead',
      messageKey: 'dashboard.insights.messages.momentum',
      recommendationKey: 'dashboard.insights.recommendations.maintainGoal',
      signals: [
        { labelKey: 'dashboard.insights.signals.sessionsThisWeek', value: recent7.length, format: 'number' },
        { labelKey: 'dashboard.insights.signals.activeBooks', value: activeBooks.length, format: 'number' }
      ]
    })
  }

  if (recent7.length > 0 && previous7.length === 0 && olderHistory.length > 0) {
    candidates.push({
      variant: 'positive',
      priority: 84,
      titleKey: 'dashboard.insights.titles.resumed',
      messageKey: 'dashboard.insights.messages.resumed',
      recommendationKey: 'dashboard.insights.recommendations.keepRhythm',
      signals: [
        { labelKey: 'dashboard.insights.signals.sessionsThisWeek', value: recent7.length, format: 'number' },
        { labelKey: 'dashboard.insights.signals.pagesThisWeek', value: pagesLast7, format: 'number' }
      ]
    })
  }

  if (activeDays7 >= 3) {
    candidates.push({
      variant: 'positive',
      priority: 80,
      titleKey: 'dashboard.insights.titles.consistency',
      messageKey: 'dashboard.insights.messages.consistency',
      recommendationKey: 'dashboard.insights.recommendations.keepRhythm',
      signals: [
        { labelKey: 'dashboard.insights.signals.activeDaysThisWeek', value: activeDays7, format: 'number' },
        { labelKey: 'dashboard.insights.signals.sessionsThisWeek', value: recent7.length, format: 'number' }
      ]
    })
  }

  if (pagesLast7 > pagesPrev7 && recent7.length >= 2) {
    candidates.push({
      variant: 'positive',
      priority: 74,
      titleKey: 'dashboard.insights.titles.momentum',
      messageKey: 'dashboard.insights.messages.momentum',
      recommendationKey: 'dashboard.insights.recommendations.keepRhythm',
      signals: [
        { labelKey: 'dashboard.insights.signals.pagesThisWeek', value: pagesLast7, format: 'number' },
        { labelKey: 'dashboard.insights.signals.pagesLastWeek', value: pagesPrev7, format: 'number' }
      ]
    })
  }

  if (weeklyGoal && weeklyGoal.pagesGoal > 0) {
    if (weeklyGoal.pagesPercent >= 100) {
      candidates.push({
        variant: 'positive',
        priority: 86,
        titleKey: 'dashboard.insights.titles.goalAhead',
        messageKey: 'dashboard.insights.messages.goalAhead',
        recommendationKey: 'dashboard.insights.recommendations.maintainGoal',
        signals: [
          { labelKey: 'dashboard.insights.signals.goalProgress', value: weeklyGoal.pagesPercent, format: 'percent' },
          { labelKey: 'dashboard.insights.signals.pagesThisWeek', value: weeklyGoal.pagesRead, format: 'number' }
        ]
      })
    } else if (weeklyGoal.pagesPercent < 60 && recent7.length > 0) {
      candidates.push({
        variant: 'warning',
        priority: 78,
        titleKey: 'dashboard.insights.titles.goalBehind',
        messageKey: 'dashboard.insights.messages.goalBehind',
        recommendationKey: 'dashboard.insights.recommendations.smallSessionToday',
        signals: [
          { labelKey: 'dashboard.insights.signals.goalProgress', value: weeklyGoal.pagesPercent, format: 'percent' },
          { labelKey: 'dashboard.insights.signals.sessionsThisWeek', value: recent7.length, format: 'number' }
        ]
      })
    }
  }

  if (activeBooks.length >= 3 && pagesLast7 < 80) {
    candidates.push({
      variant: 'neutral',
      priority: 70,
      titleKey: 'dashboard.insights.titles.focus',
      messageKey: 'dashboard.insights.messages.focus',
      recommendationKey: 'dashboard.insights.recommendations.focusOneBook',
      signals: [
        { labelKey: 'dashboard.insights.signals.activeBooks', value: activeBooks.length, format: 'number' },
        { labelKey: 'dashboard.insights.signals.pagesThisWeek', value: pagesLast7, format: 'number' }
      ]
    })
  }

  if (!candidates.length) {
    return {
      state: 'ready',
      variant: 'neutral',
      priority: 10,
      titleKey: 'dashboard.insights.titles.steady',
      messageKey: 'dashboard.insights.messages.steady',
      recommendationKey: 'dashboard.insights.recommendations.logProgressOnCurrent',
      signals: [
        { labelKey: 'dashboard.insights.signals.sessionsThisWeek', value: recent7.length, format: 'number' },
        { labelKey: 'dashboard.insights.signals.activeBooks', value: activeBooks.length, format: 'number' }
      ]
    }
  }

  const best = [...candidates].sort((a, b) => b.priority - a.priority)[0]
  return { ...best, state: 'ready' }
}
