import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { ReadingSession } from '../../../../types'
import { buildBookTimeline } from '../book-timeline'

let sessionCounter = 0

function makeSession(overrides: Partial<ReadingSession>): ReadingSession {
  sessionCounter += 1
  return {
    id: overrides.id ?? `session-${sessionCounter}`,
    bookId: overrides.bookId ?? 'book-1',
    date: overrides.date ?? '2026-04-10',
    duration: overrides.duration ?? 25,
    pagesRead: overrides.pagesRead ?? 12
  }
}

describe('buildBookTimeline', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-17T00:00:00.000Z'))
    sessionCounter = 0
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('orders sessions and backfills progress deltas from current page', () => {
    const model = buildBookTimeline(
      [
        makeSession({ id: 'a', date: '2026-04-15', pagesRead: 20 }),
        makeSession({ id: 'b', date: '2026-04-10', pagesRead: 30 })
      ],
      120,
      300
    )

    expect(model.items.map((item) => item.id)).toEqual(['a', 'b'])
    expect(model.items[0]).toMatchObject({ progressBefore: 100, progressAfter: 120, progressDelta: 20 })
    expect(model.items[1]).toMatchObject({ progressBefore: 70, progressAfter: 100, progressDelta: 30 })
  })

  it('sets paused momentum and recover action after long gap', () => {
    const model = buildBookTimeline([makeSession({ date: '2026-04-01', pagesRead: 15 })], 40, 220)

    expect(model.summary.momentum).toBe('paused')
    expect(model.summary.nextActionKey).toBe('recover')
    expect(model.summary.lastReadDaysAgo).toBe(16)
  })

  it('surfaces finish action when reader is near completion', () => {
    const model = buildBookTimeline(
      [
        makeSession({ date: '2026-04-16', pagesRead: 12 }),
        makeSession({ date: '2026-04-15', pagesRead: 10 })
      ],
      188,
      200
    )

    expect(model.summary.momentum).toBe('active')
    expect(model.summary.nextActionKey).toBe('finish')
  })
})
