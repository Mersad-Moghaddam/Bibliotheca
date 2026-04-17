import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { I18nProvider, useI18n } from '../../../shared/i18n/i18n-provider'
import { ReadingInsightModel } from '../insights/insight-engine'

import { ReadingInsightsCard } from './reading-insights-card'

const readyInsight: ReadingInsightModel = {
  state: 'ready',
  variant: 'positive',
  priority: 90,
  titleKey: 'dashboard.insights.titles.nearCompletion',
  messageKey: 'dashboard.insights.messages.nearCompletion',
  recommendationKey: 'dashboard.insights.recommendations.finishClosestBook',
  signals: [
    { labelKey: 'dashboard.insights.signals.closestBookProgress', value: 92, format: 'percent' },
    { labelKey: 'dashboard.insights.signals.activeBooks', value: 1, format: 'number' }
  ]
}

function LocaleHarness() {
  const { setLocale } = useI18n()
  return (
    <div>
      <button onClick={() => setLocale('fa')}>fa</button>
      <button onClick={() => setLocale('en')}>en</button>
      <ReadingInsightsCard insight={readyInsight} isLoading={false} isError={false} onRetry={() => {}} />
    </div>
  )
}

describe('ReadingInsightsCard', () => {
  it('renders localized Persian copy without English leakage', () => {
    localStorage.setItem('negar.locale', 'fa')
    render(
      <I18nProvider>
        <ReadingInsightsCard insight={readyInsight} isLoading={false} isError={false} onRetry={() => {}} />
      </I18nProvider>
    )

    expect(screen.getByText('خیلی نزدیکِ تمام‌کردن یکی از کتاب‌ها هستی')).toBeInTheDocument()
    expect(screen.queryByText('You are very close to finishing a book')).not.toBeInTheDocument()
  })

  it('updates strings correctly when language changes after initial render', async () => {
    const user = userEvent.setup()
    localStorage.setItem('negar.locale', 'en')

    render(
      <I18nProvider>
        <LocaleHarness />
      </I18nProvider>
    )

    expect(screen.getByText('You are very close to finishing a book')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'fa' }))
    expect(screen.getByText('خیلی نزدیکِ تمام‌کردن یکی از کتاب‌ها هستی')).toBeInTheDocument()
    expect(screen.queryByText('You are very close to finishing a book')).not.toBeInTheDocument()
  })

  it('renders loading and error states', () => {
    localStorage.setItem('negar.locale', 'en')
    const { rerender } = render(
      <I18nProvider>
        <ReadingInsightsCard insight={{ ...readyInsight, state: 'loading' }} isLoading={true} isError={false} onRetry={() => {}} />
      </I18nProvider>
    )

    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)

    rerender(
      <I18nProvider>
        <ReadingInsightsCard insight={{ ...readyInsight, state: 'error' }} isLoading={false} isError={true} onRetry={() => {}} />
      </I18nProvider>
    )

    expect(screen.getByText('Could not load reading insights')).toBeInTheDocument()
  })
})
