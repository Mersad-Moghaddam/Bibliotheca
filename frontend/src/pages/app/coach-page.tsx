import { Link } from 'react-router-dom'

import { Button } from '../../components/ui/button'
import { SectionCard } from '../../components/ui/card'
import { SectionHeader } from '../../components/ui/section-header'
import { ReadingInsightsCard } from '../../features/dashboard/components/reading-insights-card'
import { buildReadingInsight } from '../../features/dashboard/insights/insight-engine'
import {
  useDashboardAnalytics,
  useDashboardReminder,
  useGoalProgress,
  useSessions
} from '../../features/dashboard/queries/use-dashboard'
import { useBooksQuery } from '../../features/books/queries/use-books'
import { useI18n } from '../../shared/i18n/i18n-provider'

import { PageHeading } from './shared/page-primitives'

export function Coach() {
  const { t } = useI18n()
  const booksQuery = useBooksQuery()
  const analyticsQuery = useDashboardAnalytics()
  const goalsQuery = useGoalProgress()
  const sessionsQuery = useSessions()
  const reminderQuery = useDashboardReminder()

  const readingInsight = buildReadingInsight({
    books: booksQuery.data ?? [],
    analytics: analyticsQuery.data,
    goals: goalsQuery.data
      ? [
          {
            period: 'weekly' as const,
            pagesGoal: goalsQuery.data.weekly.targetPages ?? 0,
            booksGoal: goalsQuery.data.weekly.targetBooks ?? 0,
            pagesRead: goalsQuery.data.weekly.pagesRead,
            booksRead: goalsQuery.data.weekly.booksRead,
            pagesPercent: goalsQuery.data.weekly.targetPages
              ? Math.round(
                  (goalsQuery.data.weekly.pagesRead / goalsQuery.data.weekly.targetPages) * 100
                )
              : 0,
            booksPercent: goalsQuery.data.weekly.targetBooks
              ? Math.round(
                  (goalsQuery.data.weekly.booksRead / goalsQuery.data.weekly.targetBooks) * 100
                )
              : 0
          }
        ]
      : [],
    sessions: sessionsQuery.data ?? []
  })

  const weeklyPagesRead = goalsQuery.data?.weekly.pagesRead ?? 0
  const weeklyPagesGoal = goalsQuery.data?.weekly.targetPages ?? 0

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeading title={t('coach.title')} />

      <SectionCard>
        <SectionHeader
          title={t('coach.primaryActionTitle')}
          description={t('coach.primaryActionDescription')}
        />
        <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-mutedForeground">{t('coach.primaryActionBody')}</p>
          <div>
            <Link to="/reading">
              <Button>{t('coach.openReading')}</Button>
            </Link>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader
          title={t('coach.insightTitle')}
          description={t('coach.insightDescription')}
        />
        <ReadingInsightsCard
          insight={readingInsight}
          isLoading={
            booksQuery.isLoading ||
            analyticsQuery.isLoading ||
            goalsQuery.isLoading ||
            sessionsQuery.isLoading
          }
          isError={
            booksQuery.isError ||
            analyticsQuery.isError ||
            goalsQuery.isError ||
            sessionsQuery.isError
          }
          onRetry={() => {
            void booksQuery.refetch()
            void analyticsQuery.refetch()
            void goalsQuery.refetch()
            void sessionsQuery.refetch()
          }}
        />
      </SectionCard>

      <SectionCard>
        <SectionHeader title={t('coach.rhythmTitle')} description={t('coach.rhythmDescription')} />
        <div className="space-y-2 text-sm text-mutedForeground">
          <p>{t('coach.weeklyPages', { current: weeklyPagesRead, target: weeklyPagesGoal })}</p>
          <p>{t('coach.weeklySessions', { count: sessionsQuery.data?.length ?? 0 })}</p>
          {reminderQuery.data ? (
            <p>
              {reminderQuery.data.enabled
                ? t('dashboard.reminderOn', { time: reminderQuery.data.time })
                : t('dashboard.reminderOff')}
            </p>
          ) : null}
        </div>
      </SectionCard>
    </div>
  )
}
