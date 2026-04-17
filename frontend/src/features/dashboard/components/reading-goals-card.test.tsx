import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '../../../shared/i18n/i18n-provider'

import { ReadingGoalsCard } from './reading-goals-card'

const goals = {
  weekly: {
    period: 'weekly' as const,
    startDate: '2026-04-06',
    endDate: '2026-04-12',
    targetPages: 100,
    targetBooks: 1,
    pagesRead: 40,
    booksRead: 0,
    percent: 40,
    status: 'in_progress' as const,
    exceeded: false
  },
  monthly: {
    period: 'monthly' as const,
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    targetPages: 400,
    targetBooks: 2,
    pagesRead: 130,
    booksRead: 1,
    percent: 33,
    status: 'on_track' as const,
    exceeded: false
  },
  suggestions: [
    { period: 'weekly' as const, targetPages: 120, targetBooks: 1, reason: 'Based on your recent pace.', reasonKey: 'restart_pace' as const, confidence: 'high' as const, signals: { recentWeeklyPagesMedian: 110, recentMonthlyPagesMedian: 430, weeklySessions: 3, activeWeeks: 5, completedBooks30d: 1 } }
  ]
}

describe('ReadingGoalsCard', () => {
  it('renders localized Persian labels', () => {
    localStorage.setItem('negar.locale', 'fa')
    render(
      <I18nProvider>
        <ReadingGoalsCard goals={goals} isSaving={false} onSave={async () => {}} />
      </I18nProvider>
    )

    expect(screen.getByText('پیشنهاد برای شما')).toBeInTheDocument()
    expect(screen.getByText('با توجه به بازگشت اخیرت به مطالعه، این پیشنهاد را واقع‌بینانه تنظیم کردیم.')).toBeInTheDocument()
    expect(screen.queryByText('Based on your recent restart pace, we kept this realistic.')).not.toBeInTheDocument()
  })



  it('uses localized fallback reason when reasonKey is missing', () => {
    localStorage.setItem('negar.locale', 'fa')
    const noKeyGoals = {
      ...goals,
      suggestions: [{ ...goals.suggestions[0], reasonKey: undefined }]
    }

    render(
      <I18nProvider>
        <ReadingGoalsCard goals={noKeyGoals} isSaving={false} onSave={async () => {}} />
      </I18nProvider>
    )

    expect(screen.getByText('این پیشنهاد بر اساس فعالیت اخیرت ارائه شده است.')).toBeInTheDocument()
    expect(screen.queryByText('Based on your recent pace.')).not.toBeInTheDocument()
  })

  it('applies suggestion into editable form', async () => {
    localStorage.setItem('negar.locale', 'en')
    const onSave = vi.fn(async () => {})
    const user = userEvent.setup()
    render(
      <I18nProvider>
        <ReadingGoalsCard goals={goals} isSaving={false} onSave={onSave} />
      </I18nProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalled()
  })
})
