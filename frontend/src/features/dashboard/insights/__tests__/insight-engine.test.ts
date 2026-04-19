import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Book, ReadingAnalytics, ReadingSession } from '../../../../types'
import { buildReadingInsight } from '../insight-engine'

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'book-1',
    title: 'Book',
    author: 'Author',
    totalPages: 300,
    status: 'currentlyReading',
    currentPage: 90,
    remainingPages: 210,
    progressPercentage: 30,
    coverUrl: null,
    genre: null,
    isbn: null,
    completedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
    ...overrides
  }
}

function makeAnalytics(totalPagesRead = 120): ReadingAnalytics {
  return {
    base: {
      booksCompleted: 2,
      activeReading: 1,
      totalBooks: 4,
      totalPagesRead,
      completionRate: 50,
      readingPacePerMonth: 1,
      currentStreakWeeks: 1,
      statusDistribution: { inLibrary: 1, currentlyReading: 1, finished: 2, nextToRead: 0 },
      monthlyActivity: [],
      weeklyActivity: []
    },
    trend: [],
    consistencyScore: 40,
    backlogHealth: 'balanced',
    sessionPages: 120
  }
}

function makeSession(date: string, pagesRead: number): ReadingSession {
  return { id: `${date}-${pagesRead}`, bookId: 'book-1', date, duration: 20, pagesRead }
}

describe('buildReadingInsight', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-12T10:00:00.000Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns empty state when there is no reading activity', () => {
    const insight = buildReadingInsight({ books: [], analytics: makeAnalytics(0), goals: [], sessions: [] })

    expect(insight.state).toBe('empty')
    expect(insight.titleKey).toBe('dashboard.insights.empty.title')
  })

  it('prioritizes inactivity over other lower-priority candidates', () => {
    const insight = buildReadingInsight({
      books: [makeBook()],
      analytics: makeAnalytics(),
      goals: [{ period: 'weekly', pagesGoal: 100, booksGoal: 1, pagesRead: 10, booksRead: 0, pagesPercent: 10, booksPercent: 0 }],
      sessions: [makeSession('2026-03-25T00:00:00.000Z', 20)]
    })

    expect(insight.titleKey).toBe('dashboard.insights.titles.inactive')
    expect(insight.recommendationKey).toBe('dashboard.insights.recommendations.rebuildMomentum')
  })

  it('selects near-completion insight when a book is close to completion', () => {
    const insight = buildReadingInsight({
      books: [makeBook({ progressPercentage: 92, currentPage: 276, remainingPages: 24 })],
      analytics: makeAnalytics(),
      goals: [],
      sessions: [makeSession('2026-04-11T00:00:00.000Z', 18), makeSession('2026-04-09T00:00:00.000Z', 14)]
    })

    expect(insight.titleKey).toBe('dashboard.insights.titles.nearCompletion')
    expect(insight.signals[0].format).toBe('percent')
  })

  it('returns goal alignment insight when weekly goal is completed', () => {
    const insight = buildReadingInsight({
      books: [makeBook()],
      analytics: makeAnalytics(),
      goals: [{ period: 'weekly', pagesGoal: 120, booksGoal: 1, pagesRead: 140, booksRead: 1, pagesPercent: 116, booksPercent: 100 }],
      sessions: [makeSession('2026-04-11T00:00:00.000Z', 30), makeSession('2026-04-10T00:00:00.000Z', 25)]
    })

    expect(insight.titleKey).toBe('dashboard.insights.titles.goalAhead')
    expect(insight.recommendationKey).toBe('dashboard.insights.recommendations.maintainGoal')
  })

  it('applies deterministic priority when multiple candidates are true', () => {
    const insight = buildReadingInsight({
      books: [makeBook({ progressPercentage: 91 }), makeBook({ id: 'book-2', progressPercentage: 45 })],
      analytics: makeAnalytics(),
      goals: [{ period: 'weekly', pagesGoal: 100, booksGoal: 1, pagesRead: 120, booksRead: 1, pagesPercent: 120, booksPercent: 100 }],
      sessions: [makeSession('2026-04-11T00:00:00.000Z', 30), makeSession('2026-04-10T00:00:00.000Z', 20), makeSession('2026-04-08T00:00:00.000Z', 18)]
    })

    expect(insight.titleKey).toBe('dashboard.insights.titles.nearCompletion')
  })

  it('ignores future-dated sessions when calculating recent windows', () => {
    const insight = buildReadingInsight({
      books: [makeBook()],
      analytics: makeAnalytics(),
      goals: [],
      sessions: [makeSession('2026-04-15T00:00:00.000Z', 40), makeSession('2026-03-20T00:00:00.000Z', 20)]
    })

    expect(insight.titleKey).toBe('dashboard.insights.titles.inactive')
  })

  it('does not mark new users as resumed without a real inactivity gap', () => {
    const insight = buildReadingInsight({
      books: [makeBook()],
      analytics: makeAnalytics(),
      goals: [],
      sessions: [makeSession('2026-04-11T00:00:00.000Z', 20), makeSession('2026-04-09T00:00:00.000Z', 15)]
    })

    expect(insight.titleKey).not.toBe('dashboard.insights.titles.resumed')
  })

  it('surfaces a stuck insight after a short quiet spell and picks a focused recommendation', () => {
    const insight = buildReadingInsight({
      books: [makeBook({ updatedAt: '2026-04-04T00:00:00.000Z' })],
      analytics: makeAnalytics(),
      goals: [],
      sessions: [makeSession('2026-04-04T00:00:00.000Z', 22), makeSession('2026-03-20T00:00:00.000Z', 15)]
    })

    expect(insight.titleKey).toBe('dashboard.insights.titles.stuck')
    expect(insight.recommendationKey).toBe('dashboard.insights.recommendations.logProgressOnCurrent')
  })

  it('uses finish recommendation for stuck state when a book is near completion', () => {
    const insight = buildReadingInsight({
      books: [
        makeBook({
          progressPercentage: 92,
          currentPage: 276,
          remainingPages: 24,
          updatedAt: '2026-04-04T00:00:00.000Z'
        })
      ],
      analytics: makeAnalytics(),
      goals: [],
      sessions: [makeSession('2026-04-04T00:00:00.000Z', 20), makeSession('2026-03-19T00:00:00.000Z', 10)]
    })

    expect(insight.titleKey).toBe('dashboard.insights.titles.stuck')
    expect(insight.recommendationKey).toBe('dashboard.insights.recommendations.finishClosestBook')
  })
})
