import { BookPlus, LibraryBig, LineChart, ListChecks } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { Progress } from '../../components/UI'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { SectionCard } from '../../components/ui/card'
import { SectionHeader } from '../../components/ui/section-header'
import {
  useBooksQuery,
  useUpdateBookProgressMutation
} from '../../features/books/queries/use-books'
import {
  useCreateSessionMutation,
  useDashboardAnalytics,
  useDashboardSummary
} from '../../features/dashboard/queries/use-dashboard'
import { useI18n } from '../../shared/i18n/i18n-provider'
import { BookStatus } from '../../types'

import { BookCover, PageHeading, StatCard } from './shared/page-primitives'

export function Dashboard() {
  const { t, locale } = useI18n()
  const summaryQuery = useDashboardSummary()
  const analyticsQuery = useDashboardAnalytics()
  const booksQuery = useBooksQuery()
  const createSession = useCreateSessionMutation()
  const updateProgress = useUpdateBookProgressMutation()

  const books = useMemo(() => booksQuery.data ?? [], [booksQuery.data])

  const counts = useMemo(() => {
    const base: Record<BookStatus, number> = {
      inLibrary: 0,
      currentlyReading: 0,
      finished: 0,
      nextToRead: 0
    }
    books.forEach((book) => (base[book.status] += 1))
    return base
  }, [books])
  const totalLibraryCount = summaryQuery.data?.counts.total ?? books.length
  const currentlyReadingCount =
    summaryQuery.data?.counts.currentlyReading ?? counts.currentlyReading
  const finishedCount = summaryQuery.data?.counts.finished ?? counts.finished
  const readingPacePerMonth = analyticsQuery.data?.base.readingPacePerMonth ?? 0

  const activeBook = books.find((book) => book.status === 'currentlyReading')
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US'),
    [locale]
  )

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeading title={t('dashboard.title')} />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <StatCard
          title={t('status.currentlyReading')}
          value={numberFormatter.format(currentlyReadingCount)}
          icon={BookPlus}
        />
        <StatCard
          title={t('dashboard.libraryTotal')}
          value={numberFormatter.format(totalLibraryCount)}
          icon={LibraryBig}
        />
        <StatCard
          title={t('status.finished')}
          value={numberFormatter.format(finishedCount)}
          icon={ListChecks}
        />
        <StatCard
          title={t('dashboard.readingPace')}
          value={numberFormatter.format(readingPacePerMonth)}
          icon={LineChart}
        />
      </div>

      <SectionCard>
        <SectionHeader
          title={t('dashboard.currentSnapshot')}
          description={t('dashboard.currentSnapshotDesc')}
        />
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
              <Badge className="border-primary/20 bg-primary/10 text-foreground">
                {numberFormatter.format(Math.round(activeBook.progressPercentage))}%
              </Badge>
            </div>
            <Progress value={activeBook.progressPercentage} />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-mutedForeground">
                {numberFormatter.format(activeBook.currentPage)} /{' '}
                {numberFormatter.format(activeBook.totalPages)}
              </p>
              <Button
                size="sm"
                className="w-full sm:w-auto"
                disabled={createSession.isPending || updateProgress.isPending}
                onClick={async () => {
                  const quickSessionPages = 12
                  await createSession.mutateAsync({
                    bookId: activeBook.id,
                    date: new Date().toISOString().slice(0, 10),
                    duration: 25,
                    pages: quickSessionPages
                  })

                  const nextPage = Math.min(
                    activeBook.totalPages,
                    activeBook.currentPage + quickSessionPages
                  )
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
          <div className="rounded-xl border border-dashed border-border bg-surface p-5 text-sm text-mutedForeground">
            {t('dashboard.noActiveDescription')}
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeader
          title={t('dashboard.libraryHubTitle')}
          description={t('dashboard.libraryHubDesc')}
        />
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-mutedForeground">{t('dashboard.libraryHubBody')}</p>
          <div className="mt-4">
            <Link to="/library">
              <Button size="sm">{t('dashboard.openLibrary')}</Button>
            </Link>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
