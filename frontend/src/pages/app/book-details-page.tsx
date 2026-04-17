import { zodResolver } from '@hookform/resolvers/zod'
import { BookCheck, ChevronDown, ChevronRight, Clock3, NotebookPen, Quote } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { Progress, StatusBadge } from '../../components/UI'
import { Button } from '../../components/ui/button'
import { Card, SectionCard } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { PageHeader } from '../../components/ui/page-header'
import { SectionHeader } from '../../components/ui/section-header'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import {
  editBookDetailsSchema,
  EditBookDetailsValues,
  progressSchema,
  ProgressValues
} from '../../features/books/forms/book-schemas'
import {
  useBookNotesQuery,
  useBookQuery,
  useCreateBookNoteMutation,
  useDeleteBookMutation,
  useUpdateBookMutation,
  useUpdateBookProgressMutation,
  useUpdateBookStatusMutation
} from '../../features/books/queries/use-books'
import { buildBookTimeline, groupTimelineByDay } from '../../features/books/timeline/book-timeline'
import { useBookSessions } from '../../features/dashboard/queries/use-dashboard'
import { useI18n } from '../../shared/i18n/i18n-provider'
import { useToast } from '../../shared/toast/toast-provider'
import { BookStatus } from '../../types'

import { BookCover, FieldBlock, FieldError, statusOptions } from './shared/page-primitives'

export function BookDetails({ id }: { id: string }) {
  const TIMELINE_VISIBLE_STEP = 7
  const TIMELINE_DEFAULT_EXPANDED_DAYS = 3
  const { t, locale } = useI18n()
  const toast = useToast()
  const nav = useNavigate()
  const query = useBookQuery(id)
  const updateBook = useUpdateBookMutation()
  const updateStatus = useUpdateBookStatusMutation()
  const updateProgress = useUpdateBookProgressMutation()
  const deleteBook = useDeleteBookMutation()
  const notesQuery = useBookNotesQuery(id)
  const sessionsQuery = useBookSessions(id)
  const addNote = useCreateBookNoteMutation(id)

  const form = useForm<ProgressValues>({
    resolver: zodResolver(progressSchema),
    defaultValues: { currentPage: 0 }
  })
  const editForm = useForm<EditBookDetailsValues>({
    resolver: zodResolver(editBookDetailsSchema),
    defaultValues: {
      title: '',
      author: '',
      totalPages: 1,
      currentPage: 0,
      status: 'inLibrary',
      coverUrl: '',
      genre: '',
      isbn: ''
    }
  })
  const noteForm = useForm<{ note: string; highlight: string }>({
    defaultValues: { note: '', highlight: '' }
  })
  const [captureHighlight, setCaptureHighlight] = useState(false)
  const [recentlyClickedStatus, setRecentlyClickedStatus] = useState<BookStatus | null>(null)
  const [visibleTimelineDays, setVisibleTimelineDays] = useState(TIMELINE_VISIBLE_STEP)
  const [expandedTimelineDays, setExpandedTimelineDays] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!query.data) return
    editForm.reset({
      title: query.data.title,
      author: query.data.author,
      totalPages: query.data.totalPages,
      currentPage: query.data.currentPage ?? 0,
      status: query.data.status,
      coverUrl: query.data.coverUrl ?? '',
      genre: query.data.genre ?? '',
      isbn: query.data.isbn ?? ''
    })
    form.reset({ currentPage: query.data.currentPage ?? 0 })
  }, [query.data, editForm, form])

  const book = query.data
  const sessionsForBook = useMemo(() => sessionsQuery.data ?? [], [sessionsQuery.data])
  const timeline = useMemo(
    () => buildBookTimeline(sessionsForBook, book?.currentPage ?? 0, book?.totalPages ?? 0),
    [sessionsForBook, book?.currentPage, book?.totalPages]
  )
  const timelineDayGroups = useMemo(() => groupTimelineByDay(timeline.items), [timeline.items])
  const timelineDayGroupKey = useMemo(
    () => timelineDayGroups.map((group) => group.dayKey).join('|'),
    [timelineDayGroups]
  )
  const defaultExpandedTimelineDays = useMemo(
    () => timelineDayGroups.slice(0, TIMELINE_DEFAULT_EXPANDED_DAYS).map((group) => group.dayKey),
    [timelineDayGroups]
  )
  const defaultExpandedTimelineDayKey = useMemo(
    () => defaultExpandedTimelineDays.join('|'),
    [defaultExpandedTimelineDays]
  )
  const notes = notesQuery.data ?? []
  const notesWithHighlights = notes.filter((note) => Boolean(note.highlight?.trim()))
  const notesWithoutHighlights = notes.filter((note) => !note.highlight?.trim())

  const loggedPages = sessionsForBook.reduce((sum, session) => sum + session.pagesRead, 0)
  const totalMinutes = sessionsForBook.reduce((sum, session) => sum + session.duration, 0)

  const numberFormatter = new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US')
  const dateFormatter = new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
  const calendarDateFormatter = new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  })
  const timeFormatter = new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })

  useEffect(() => {
    setVisibleTimelineDays((current) => (current === TIMELINE_VISIBLE_STEP ? current : TIMELINE_VISIBLE_STEP))
    setExpandedTimelineDays((current) => {
      const currentKey = [...current].join('|')
      if (currentKey === defaultExpandedTimelineDayKey) return current
      return new Set(defaultExpandedTimelineDays)
    })
  }, [timelineDayGroupKey, defaultExpandedTimelineDayKey, defaultExpandedTimelineDays])

  const formatDate = (value: string | null) => {
    if (!value) return '—'
    return dateFormatter.format(new Date(value))
  }
  const formatCalendarDate = (value: string | null) => {
    if (!value) return '—'
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return calendarDateFormatter.format(new Date(`${value}T00:00:00Z`))
    }
    if (/T00:00:00(?:\\.\\d+)?Z$/.test(value)) {
      return calendarDateFormatter.format(new Date(value))
    }
    return dateFormatter.format(new Date(value))
  }
  const formatTimelineDayLabel = (dayKey: string) => {
    const now = new Date()
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const dayDate = new Date(`${dayKey}T00:00:00Z`)
    const daysAgo = Math.floor((todayUtc.getTime() - dayDate.getTime()) / (24 * 60 * 60 * 1000))

    if (daysAgo === 0) return t('books.timelineDayToday')
    if (daysAgo === 1) return t('books.timelineDayYesterday')
    return formatCalendarDate(dayKey)
  }
  const formatSessionTime = (value: string) => {
    if (!value.includes('T')) return null
    const parsed = new Date(value)
    if (!Number.isFinite(parsed.getTime())) return null
    const utcTime =
      `${parsed.getUTCHours()}`.padStart(2, '0') +
      ':' +
      `${parsed.getUTCMinutes()}`.padStart(2, '0')
    if (utcTime === '00:00') return null
    return timeFormatter.format(parsed)
  }

  const visibleTimelineGroups = useMemo(
    () => timelineDayGroups.slice(0, Math.min(visibleTimelineDays, timelineDayGroups.length)),
    [timelineDayGroups, visibleTimelineDays]
  )
  const hasOlderTimeline = visibleTimelineDays < timelineDayGroups.length

  const toggleTimelineDay = (dayKey: string) => {
    setExpandedTimelineDays((current) => {
      const next = new Set(current)
      if (next.has(dayKey)) {
        next.delete(dayKey)
      } else {
        next.add(dayKey)
      }
      return next
    })
  }

  const handleMoveStatus = async (status: BookStatus) => {
    if (!book) return
    setRecentlyClickedStatus(status)
    window.setTimeout(() => {
      setRecentlyClickedStatus((current) => (current === status ? null : current))
    }, 500)
    await updateStatus.mutateAsync({ id: book.id, status })
  }

  if (!book) return <Card className="p-6">{t('common.loading')}</Card>

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        title={book.title}
        description={book.author}
        action={<StatusBadge status={book.status} />}
        eyebrow={t('books.readingHub')}
      />

      <SectionCard className="space-y-5 overflow-hidden">
        <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <BookCover title={book.title} coverUrl={book.coverUrl} />
          <div className="min-w-0 space-y-3">
            <div>
              <p className="text-sm text-mutedForeground">{t('books.readingProgress')}</p>
              <p className="text-2xl font-semibold">
                {numberFormatter.format(Math.round(book.progressPercentage))}%
              </p>
            </div>
            <Progress value={book.progressPercentage} />
            <p className="text-sm text-mutedForeground">
              {numberFormatter.format(book.currentPage ?? 0)} /{' '}
              {numberFormatter.format(book.totalPages)} {t('books.pagesLabel')}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HubMeta label={t('books.genreLabel')} value={book.genre || t('library.genreFallback')} />
          <HubMeta label={t('books.isbnLabel')} value={book.isbn || '—'} />
          <HubMeta label={t('books.lastUpdated')} value={formatDate(book.updatedAt)} />
          <HubMeta
            label={t('books.completedOn')}
            value={book.completedAt ? formatDate(book.completedAt) : t('books.notFinished')}
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader
          title={t('books.progressSnapshotTitle')}
          description={t('books.progressSnapshotDescription')}
        />
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat
              label={t('books.remainingPagesLabel')}
              value={numberFormatter.format(book.remainingPages)}
            />
            <MiniStat
              label={t('books.recentSessionsCountLabel')}
              value={numberFormatter.format(sessionsForBook.length)}
            />
            <MiniStat
              label={t('books.notesCountLabel')}
              value={numberFormatter.format(notes.length)}
            />
          </div>

          {book.status === 'currentlyReading' ? (
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={form.handleSubmit(async (values) =>
                updateProgress.mutateAsync({ id: book.id, currentPage: values.currentPage })
              )}
            >
              <Input
                className="sm:min-w-[180px] sm:flex-1"
                type="number"
                min={0}
                max={book.totalPages}
                {...form.register('currentPage', { valueAsNumber: true })}
              />
              <Button type="submit" className="w-full sm:w-auto">
                {t('books.updateProgress')}
              </Button>
            </form>
          ) : (
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                void handleMoveStatus('currentlyReading')
              }}
            >
              {t('books.startReading')}
            </Button>
          )}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader
          title={t('books.timelineTitle')}
          description={t('books.timelineDescription')}
          icon={<Clock3 className="h-4 w-4" />}
        />
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat
              label={t('books.timelineMomentumLabel')}
              value={t(`books.timelineMomentum.${timeline.summary.momentum}`)}
            />
            <MiniStat
              label={t('books.timelineLastReadLabel')}
              value={
                timeline.summary.lastReadDaysAgo === null
                  ? t('books.timelineNever')
                  : timeline.summary.lastReadDaysAgo === 0
                    ? t('books.timelineToday')
                    : t('books.timelineDaysAgo', {
                        count: numberFormatter.format(timeline.summary.lastReadDaysAgo)
                      })
              }
            />
            <MiniStat
              label={t('books.timelineRecentPagesLabel')}
              value={`${numberFormatter.format(timeline.summary.recentPages)} ${t('books.pagesLabel')}`}
            />
          </div>

          <div className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-mutedForeground">
            <span className="font-medium text-foreground">
              {t('books.timelineNextActionLabel')}:
            </span>{' '}
            {t(`books.timelineNextAction.${timeline.summary.nextActionKey}`)}
          </div>

          <div className="space-y-2">
            {visibleTimelineGroups.map((group) => {
              const isExpanded = expandedTimelineDays.has(group.dayKey)
              return (
                <div key={group.dayKey} className="rounded-xl border border-border bg-surface/80">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                    onClick={() => {
                      toggleTimelineDay(group.dayKey)
                    }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {formatTimelineDayLabel(group.dayKey)}
                      </p>
                      <p className="mt-0.5 text-xs text-mutedForeground">
                        {t('books.timelineDaySummary', {
                          count: numberFormatter.format(group.sessionCount),
                          pages: numberFormatter.format(group.totalProgressDelta)
                        })}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-mutedForeground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-mutedForeground" />
                    )}
                  </button>
                  {isExpanded ? (
                    <div className="border-t border-border/80 px-3 py-1.5">
                      {group.items.map((session) => {
                        const sessionTime = formatSessionTime(session.date)
                        return (
                          <div
                            key={session.id}
                            className="flex items-center justify-between gap-3 border-b border-border/70 py-2 text-sm last:border-b-0"
                          >
                            <div className="min-w-0">
                              <p className="text-xs text-mutedForeground">
                                {sessionTime ?? formatCalendarDate(session.date)}
                              </p>
                              <p className="text-xs text-mutedForeground">
                                {numberFormatter.format(session.progressBefore)} →{' '}
                                {numberFormatter.format(session.progressAfter)}{' '}
                                {t('books.pagesShortLabel')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-foreground">
                                +{numberFormatter.format(session.progressDelta)}{' '}
                                {t('books.pagesShortLabel')}
                              </p>
                              <p className="text-xs text-mutedForeground">
                                {numberFormatter.format(session.duration)} {t('books.minutesLabel')}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              )
            })}
            {hasOlderTimeline ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setVisibleTimelineDays((current) =>
                    Math.min(current + TIMELINE_VISIBLE_STEP, timelineDayGroups.length)
                  )
                }}
              >
                {t('books.timelineLoadOlder')}
              </Button>
            ) : null}
            {!visibleTimelineGroups.length ? (
              <p className="text-sm text-mutedForeground">{t('books.sessionsEmpty')}</p>
            ) : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader
          title={t('books.notesSummaryTitle')}
          description={t('books.notesSummaryDescription')}
          icon={<NotebookPen className="h-4 w-4" />}
        />
        <div className="space-y-2">
          {notes.slice(0, 3).map((n) => (
            <div key={n.id} className="rounded-xl border border-border bg-surface p-3 text-sm">
              <div className="mb-1 flex items-center gap-2 text-xs text-mutedForeground">
                <span className="rounded-full border border-border px-2 py-0.5">
                  {n.highlight ? t('books.noteTypeHighlight') : t('books.noteTypeNote')}
                </span>
                <span>{formatDate(n.createdAt)}</span>
              </div>
              <p>{n.note}</p>
              {n.highlight ? <p className="mt-1 text-mutedForeground">“{n.highlight}”</p> : null}
            </div>
          ))}
          {!notes.length ? (
            <div className="rounded-xl border border-dashed border-border bg-surface p-4 text-sm text-mutedForeground">
              <p className="font-medium text-foreground">{t('books.notesEmptyTitle')}</p>
              <p className="mt-1">{t('books.notesEmpty')}</p>
            </div>
          ) : null}
        </div>

        <details className="group rounded-xl border border-border bg-surface p-3">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium">
            {t('books.manageNotes')}
            <ChevronDown className="h-4 w-4 text-mutedForeground transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 space-y-3">
            <form
              className="space-y-2"
              onSubmit={noteForm.handleSubmit(async (values) => {
                const note = values.note.trim()
                const highlight = values.highlight.trim()
                if (!note) return
                await addNote.mutateAsync({ note, highlight: highlight || undefined })
                noteForm.reset()
                setCaptureHighlight(false)
              })}
            >
              <FieldBlock label={t('books.noteLabel')}>
                <Textarea placeholder={t('books.notePlaceholder')} {...noteForm.register('note')} />
              </FieldBlock>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-xs font-medium text-mutedForeground hover:text-foreground"
                onClick={() => {
                  setCaptureHighlight((value) => !value)
                  if (captureHighlight) noteForm.setValue('highlight', '')
                }}
              >
                <Quote className="h-3.5 w-3.5" />
                {captureHighlight ? t('books.removeHighlightField') : t('books.addHighlightField')}
              </button>
              {captureHighlight ? (
                <FieldBlock label={t('books.highlightLabel')}>
                  <Input
                    placeholder={t('books.highlightPlaceholder')}
                    {...noteForm.register('highlight')}
                  />
                </FieldBlock>
              ) : null}
              <Button type="submit" size="sm" className="w-full sm:w-auto">
                {t('books.saveNote')}
              </Button>
            </form>

            {notes.length ? (
              <div className="space-y-3">
                {notesWithHighlights.length ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-mutedForeground">
                      {t('books.highlightsGroupLabel', {
                        count: numberFormatter.format(notesWithHighlights.length)
                      })}
                    </p>
                    {notesWithHighlights.map((n) => (
                      <div
                        key={n.id}
                        className="rounded-xl border border-border bg-background p-3 text-sm"
                      >
                        <p>{n.note}</p>
                        <p className="mt-1 text-mutedForeground">“{n.highlight}”</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                {notesWithoutHighlights.length ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-mutedForeground">
                      {t('books.notesGroupLabel', {
                        count: numberFormatter.format(notesWithoutHighlights.length)
                      })}
                    </p>
                    {notesWithoutHighlights.map((n) => (
                      <div
                        key={n.id}
                        className="rounded-xl border border-border bg-background p-3 text-sm"
                      >
                        <p>{n.note}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-mutedForeground">{t('books.notesCaptureHint')}</p>
            )}
          </div>
        </details>
      </SectionCard>

      {book.status === 'finished' ? (
        <SectionCard className="space-y-4">
          <SectionHeader
            title={t('books.finishSummaryTitle')}
            description={t('books.finishSummaryDescription')}
            icon={<BookCheck className="h-4 w-4" />}
          />
          <div className="rounded-xl border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">
            {t('books.finishConfirmation')}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MiniStat label={t('books.completedOn')} value={formatDate(book.completedAt)} />
            <MiniStat
              label={t('books.recentLoggedPagesLabel')}
              value={numberFormatter.format(loggedPages || book.totalPages)}
            />
            <MiniStat
              label={t('books.recentReadingTimeLabel')}
              value={`${numberFormatter.format(totalMinutes)} ${t('books.minutesLabel')}`}
            />
            <MiniStat
              label={t('books.notesCountLabel')}
              value={numberFormatter.format(notes.length)}
            />
          </div>
          {book.finishRating || book.finishReflection || book.finishHighlight ? (
            <div className="grid gap-3 md:grid-cols-3">
              {book.finishRating ? (
                <MiniStat
                  label={t('books.finishRatingSummaryLabel')}
                  value={`${numberFormatter.format(book.finishRating)}/5`}
                />
              ) : null}
              {book.finishReflection ? (
                <div className="rounded-xl border border-border bg-surface px-3 py-2 md:col-span-2">
                  <p className="text-xs text-mutedForeground">{t('books.finishReflectionLabel')}</p>
                  <p className="mt-1 text-sm">{book.finishReflection}</p>
                </div>
              ) : null}
              {book.finishHighlight ? (
                <div className="rounded-xl border border-border bg-surface px-3 py-2 md:col-span-3">
                  <p className="text-xs text-mutedForeground">{t('books.finishHighlightLabel')}</p>
                  <p className="mt-1 text-sm text-mutedForeground">“{book.finishHighlight}”</p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-mutedForeground">{t('books.finishSummaryEmptyHint')}</p>
          )}
        </SectionCard>
      ) : null}

      <SectionCard>
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium">
            {t('books.manageBook')}
            <ChevronDown className="h-4 w-4 text-mutedForeground transition-transform group-open:rotate-180" />
          </summary>

          <div className="mt-4 space-y-4">
            <div>
              <SectionHeader
                title={t('books.editDetailsTitle')}
                description={t('books.editDetailsDescription')}
              />
              <form
                className="mt-4 grid gap-3 md:grid-cols-2"
                onSubmit={editForm.handleSubmit(async (values) => {
                  try {
                    const initialCurrentPage = book.currentPage ?? 0
                    await updateBook.mutateAsync({
                      id: book.id,
                      payload: {
                        title: values.title,
                        author: values.author,
                        totalPages: values.totalPages,
                        status: values.status,
                        coverUrl: values.coverUrl || undefined,
                        genre: values.genre || undefined,
                        isbn: values.isbn || undefined
                      }
                    })
                    if (values.currentPage !== initialCurrentPage) {
                      await updateProgress.mutateAsync({
                        id: book.id,
                        currentPage: values.currentPage
                      })
                      const statusAfterProgress: BookStatus =
                        values.currentPage === values.totalPages ? 'finished' : 'currentlyReading'
                      if (values.status !== statusAfterProgress) {
                        await updateStatus.mutateAsync({ id: book.id, status: values.status })
                      }
                    }
                    toast.success(t('books.bookUpdated'))
                  } catch {
                    toast.error(t('books.updateError'))
                  }
                })}
              >
                <div>
                  <FieldBlock label={t('library.titlePlaceholder')}>
                    <Input
                      placeholder={t('library.titlePlaceholder')}
                      {...editForm.register('title')}
                    />
                  </FieldBlock>
                  <FieldError message={editForm.formState.errors.title?.message} />
                </div>
                <div>
                  <FieldBlock label={t('library.authorPlaceholder')}>
                    <Input
                      placeholder={t('library.authorPlaceholder')}
                      {...editForm.register('author')}
                    />
                  </FieldBlock>
                  <FieldError message={editForm.formState.errors.author?.message} />
                </div>
                <div>
                  <FieldBlock label={t('library.totalPages')}>
                    <Input
                      type="number"
                      min={1}
                      {...editForm.register('totalPages', { valueAsNumber: true })}
                    />
                  </FieldBlock>
                  <FieldError message={editForm.formState.errors.totalPages?.message} />
                </div>
                <div>
                  <FieldBlock label={t('books.updateProgress')}>
                    <Input
                      type="number"
                      min={0}
                      max={editForm.watch('totalPages')}
                      {...editForm.register('currentPage', { valueAsNumber: true })}
                    />
                  </FieldBlock>
                  <FieldError message={editForm.formState.errors.currentPage?.message} />
                </div>
                <FieldBlock label={t('library.status')}>
                  <Select {...editForm.register('status')}>
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {t(`status.${s}`)}
                      </option>
                    ))}
                  </Select>
                </FieldBlock>
                <div>
                  <FieldBlock label={t('library.coverUrlOptional')}>
                    <Input
                      placeholder={t('library.coverUrlOptional')}
                      {...editForm.register('coverUrl')}
                    />
                  </FieldBlock>
                  <FieldError message={editForm.formState.errors.coverUrl?.message} />
                </div>
                <div>
                  <FieldBlock label={t('library.genreOptional')}>
                    <Input
                      placeholder={t('library.genreOptional')}
                      {...editForm.register('genre')}
                    />
                  </FieldBlock>
                  <FieldError message={editForm.formState.errors.genre?.message} />
                </div>
                <div>
                  <FieldBlock label={t('library.isbnOptional')}>
                    <Input placeholder={t('library.isbnOptional')} {...editForm.register('isbn')} />
                  </FieldBlock>
                  <FieldError message={editForm.formState.errors.isbn?.message} />
                </div>
                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={
                      updateBook.isPending || updateProgress.isPending || updateStatus.isPending
                    }
                  >
                    {updateBook.isPending || updateProgress.isPending || updateStatus.isPending
                      ? `${t('common.save')}...`
                      : t('common.save')}
                  </Button>
                </div>
              </form>
            </div>

            <div>
              <SectionHeader
                title={t('books.actions')}
                description={t('books.actionsDescription')}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {statusOptions.map((status) => {
                  const isClicked = recentlyClickedStatus === status
                  return (
                    <Button
                      key={status}
                      size="sm"
                      variant="secondary"
                      className={`w-full transition-colors duration-200 sm:w-auto ${isClicked ? 'border-primary/30 bg-primary/10' : ''}`}
                      onClick={() => {
                        void handleMoveStatus(status)
                      }}
                    >
                      {t('books.moveTo')} {t(`status.${status}`)}
                    </Button>
                  )
                })}
              </div>
              <Button
                className="mt-3 w-full sm:w-auto"
                variant="destructive"
                onClick={async () => {
                  await deleteBook.mutateAsync(book.id)
                  nav('/library')
                }}
              >
                {t('books.delete')}
              </Button>
            </div>
          </div>
        </details>
      </SectionCard>
    </div>
  )
}

function HubMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2">
      <p className="text-xs text-mutedForeground">{label}</p>
      <p className="truncate text-sm" title={value}>
        {value}
      </p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2">
      <p className="text-xs text-mutedForeground">{label}</p>
      <p className="text-base font-medium">{value}</p>
    </div>
  )
}
