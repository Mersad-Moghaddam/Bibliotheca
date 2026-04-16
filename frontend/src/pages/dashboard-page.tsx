import { BookPlus, Compass, LibraryBig, LineChart, ListChecks, Target, Timer } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { Progress } from '../components/UI'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { SectionCard } from '../components/ui/card'
import { ContextActionCard } from '../components/ui/context-action-card'
import { EmptyState } from '../components/ui/empty-state'
import { SectionHeader } from '../components/ui/section-header'
import {
  useBooksQuery,
  useUpdateBookProgressMutation
} from '../features/books/queries/use-books'
import { ReadingGoalsCard } from '../features/dashboard/components/reading-goals-card'
import { ReadingInsightsCard } from '../features/dashboard/components/reading-insights-card'
import { buildReadingInsight } from '../features/dashboard/insights/insight-engine'
import {
  useCreateSessionMutation,
  useDashboardAnalytics,
  useDashboardReminder,
  useGoalProgress,
  useSaveGoalMutation,
  useSessions
} from '../features/dashboard/queries/use-dashboard'
import { QueryState } from '../shared/components/query-state'
import { useI18n } from '../shared/i18n/i18n-provider'
import { BookStatus } from '../types'

import { BookCover, PageHeading, StatCard } from './modules/page-primitives'

export function DashboardPage() {
  const { t, locale } = useI18n()
  const nav = useNavigate()
  const booksQuery = useBooksQuery()
  const analyticsQuery = useDashboardAnalytics()
  const reminderQuery = useDashboardReminder()
  const goalsQuery = useGoalProgress()
  const sessionsQuery = useSessions()
  const saveGoal = useSaveGoalMutation()
  const createSession = useCreateSessionMutation()
  const updateProgress = useUpdateBookProgressMutation()

  const books = useMemo(() => booksQuery.data ?? [], [booksQuery.data])
  const analytics = analyticsQuery.data
  const reminder = reminderQuery.data
  const goals = goalsQuery.data
  const sessions = useMemo(() => sessionsQuery.data ?? [], [sessionsQuery.data])

  const goalSignals = useMemo(() => {
    if (!goals) return []
    return [
      {
        period: 'weekly' as const,
        pagesGoal: goals.weekly.targetPages ?? 0,
        booksGoal: goals.weekly.targetBooks ?? 0,
        pagesRead: goals.weekly.pagesRead,
        booksRead: goals.weekly.booksRead,
        pagesPercent: goals.weekly.targetPages ? Math.round((goals.weekly.pagesRead / goals.weekly.targetPages) * 100) : 0,
        booksPercent: goals.weekly.targetBooks ? Math.round((goals.weekly.booksRead / goals.weekly.targetBooks) * 100) : 0
      },
      {
        period: 'monthly' as const,
        pagesGoal: goals.monthly.targetPages ?? 0,
        booksGoal: goals.monthly.targetBooks ?? 0,
        pagesRead: goals.monthly.pagesRead,
        booksRead: goals.monthly.booksRead,
        pagesPercent: goals.monthly.targetPages ? Math.round((goals.monthly.pagesRead / goals.monthly.targetPages) * 100) : 0,
        booksPercent: goals.monthly.targetBooks ? Math.round((goals.monthly.booksRead / goals.monthly.targetBooks) * 100) : 0
      }
    ]
  }, [goals])

  const readingInsight = useMemo(
    () =>
      buildReadingInsight({
        books,
        analytics,
        goals: goalSignals,
        sessions
      }),
    [analytics, books, goalSignals, sessions]
  )

  const counts = useMemo(() => {
    const base: Record<BookStatus, number> = { inLibrary: 0, currentlyReading: 0, finished: 0, nextToRead: 0 }
    books.forEach((book) => (base[book.status] += 1))
    return base
  }, [books])

  const activeBook = books.find((book) => book.status === 'currentlyReading')
  const hasGoals = Boolean(goals?.weekly.targetPages || goals?.weekly.targetBooks || goals?.monthly.targetPages || goals?.monthly.targetBooks)
  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US'), [locale])

  const actions = useMemo(
    () => [
      {
        key: 'add-book',
        title: t('journey.actions.addBook.title'),
        description: t('journey.actions.addBook.description'),
        label: t('journey.actions.addBook.cta'),
        icon: <BookPlus className="h-4 w-4" />,
        onAction: () => nav('/library')
      },
      {
        key: 'resume-reading',
        title: t('journey.actions.resumeReading.title'),
        description: activeBook ? t('journey.actions.resumeReading.withBook', { title: activeBook.title }) : t('journey.actions.resumeReading.description'),
        label: t('journey.actions.resumeReading.cta'),
        icon: <Compass className="h-4 w-4" />,
        onAction: () => nav(activeBook ? `/books/${activeBook.id}` : '/reading')
      },
      {
        key: 'set-goal',
        title: t('journey.actions.setGoal.title'),
        description: hasGoals ? t('journey.actions.setGoal.configured') : t('journey.actions.setGoal.description'),
        label: t('journey.actions.setGoal.cta'),
        icon: <Target className="h-4 w-4" />,
        onAction: () => nav('/dashboard')
      }
    ],
    [activeBook, hasGoals, nav, t]
  )

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeading title={t('dashboard.title')} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title={t('status.currentlyReading')} value={numberFormatter.format(counts.currentlyReading)} icon={BookPlus} />
        <StatCard title={t('status.inLibrary')} value={numberFormatter.format(counts.inLibrary)} icon={LibraryBig} />
        <StatCard title={t('status.finished')} value={numberFormatter.format(counts.finished)} icon={ListChecks} />
        <StatCard title={t('dashboard.readingPace')} value={numberFormatter.format(analytics?.base.readingPacePerMonth ?? 0)} icon={LineChart} />
      </div>

      {!books.length ? (
        <EmptyState
          title={t('journey.dashboardEmptyTitle')}
          description={t('journey.dashboardEmptyDescription')}
          action={<Button onClick={() => nav('/library')}>{t('journey.dashboardEmptyAction')}</Button>}
        />
      ) : null}

      <SectionCard>
        <SectionHeader title={t('journey.nextBestActionTitle')} description={t('journey.nextBestActionDescription')} />
        <div className="grid gap-3 md:grid-cols-3">
          {actions.map((action) => (
            <ContextActionCard
              key={action.key}
              title={action.title}
              description={action.description}
              actionLabel={action.label}
              icon={action.icon}
              onAction={action.onAction}
            />
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-3 xl:grid-cols-[1.45fr_1fr]">
        <SectionCard>
          <SectionHeader title={t('dashboard.currentSnapshot')} description={t('dashboard.currentSnapshotDesc')} />
          {activeBook ? (
            <div className="space-y-3 rounded-xl border border-border bg-surface p-3.5 sm:p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <BookCover title={activeBook.title} coverUrl={activeBook.coverUrl} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{activeBook.title}</p>
                    <p className="truncate text-small text-mutedForeground">{activeBook.author}</p>
                    <p className="mt-1 text-xs text-mutedForeground">{t('dashboard.keepMomentum')}</p>
                  </div>
                </div>
                <Badge className="border-primary/20 bg-primary/10 text-foreground">{Math.round(activeBook.progressPercentage)}%</Badge>
              </div>
              <Progress value={activeBook.progressPercentage} />
              <div className="flex items-center justify-between">
                <p className="text-xs text-mutedForeground">
                  {numberFormatter.format(activeBook.currentPage)} / {numberFormatter.format(activeBook.totalPages)}
                </p>
                <Button
                  size="sm"
                  disabled={createSession.isPending || updateProgress.isPending}
                  onClick={async () => {
                    const quickSessionPages = 12
                    await createSession.mutateAsync({
                      bookId: activeBook.id,
                      date: new Date().toISOString().slice(0, 10),
                      duration: 25,
                      pages: quickSessionPages
                    })

                    const nextPage = Math.min(activeBook.totalPages, activeBook.currentPage + quickSessionPages)
                    if (nextPage > activeBook.currentPage) {
                      await updateProgress.mutateAsync({ id: activeBook.id, currentPage: nextPage })
                    }
                  }}
                >
                  {t('dashboard.logSession')}
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              title={t('journey.readingEmptyTitle')}
              description={t('journey.readingEmptyDescription')}
              action={<Button onClick={() => nav('/next')}>{t('journey.readingEmptyAction')}</Button>}
            />
          )}
        </SectionCard>

        <SectionCard>
          <SectionHeader title={t('dashboard.intelligenceTitle')} description={t('dashboard.intelligenceDesc')} />
          <ReadingInsightsCard
            insight={readingInsight}
            isLoading={booksQuery.isLoading || analyticsQuery.isLoading || goalsQuery.isLoading || sessionsQuery.isLoading}
            isError={booksQuery.isError || analyticsQuery.isError || goalsQuery.isError || sessionsQuery.isError}
            onRetry={() => {
              void booksQuery.refetch()
              void analyticsQuery.refetch()
              void goalsQuery.refetch()
              void sessionsQuery.refetch()
            }}
          />
          {reminder ? <p className="text-small text-mutedForeground">{reminder.enabled ? t('dashboard.reminderOn', { time: reminder.time }) : t('dashboard.reminderOff')}</p> : null}
          <p className="text-small text-mutedForeground">{t('dashboard.sessionsCount', { count: sessions.length })}</p>
        </SectionCard>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <SectionCard>
          <SectionHeader title={t('dashboard.analyticsTitle')} description={t('dashboard.analyticsDesc')} />
          <QueryState isLoading={analyticsQuery.isLoading} isError={analyticsQuery.isError} isEmpty={!analytics} emptyTitle={t('dashboard.emptyAnalyticsTitle')} emptyDescription={t('dashboard.emptyAnalyticsDescription')} onRetry={() => void analyticsQuery.refetch()}>
            {analytics ? <div className="grid gap-3 sm:grid-cols-2">
              <div className="metric-tile"><p>{t('dashboard.totalPagesRead')}</p><p>{numberFormatter.format(analytics.base.totalPagesRead)}</p></div>
              <div className="metric-tile"><p>{t('dashboard.completionRate')}</p><p>{analytics.base.completionRate}%</p></div>
              <div className="metric-tile"><p>{t('dashboard.readingPace')}</p><p>{numberFormatter.format(analytics.base.readingPacePerMonth)}</p></div>
              <div className="metric-tile"><p>{t('dashboard.consistency')}</p><p>{analytics.consistencyScore}%</p></div>
            </div> : null}
          </QueryState>
        </SectionCard>

        <SectionCard>
          <SectionHeader title={t('dashboard.goalsTitle')} description={t('dashboard.goalsDesc')} icon={<Timer className="h-4 w-4" />} />
          <ReadingGoalsCard
            goals={goals}
            isSaving={saveGoal.isPending}
            onSave={async (payload) => {
              await saveGoal.mutateAsync(payload)
            }}
          />
        </SectionCard>
      </div>
    </div>
  )
}
