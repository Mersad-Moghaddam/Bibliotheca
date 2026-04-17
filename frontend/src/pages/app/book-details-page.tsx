import { zodResolver } from '@hookform/resolvers/zod'
import { BookCheck, ChevronDown, Clock3, NotebookPen } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import { buildBookTimeline } from '../../features/books/timeline/book-timeline'
import { useBookSessions } from '../../features/dashboard/queries/use-dashboard'
import { useI18n } from '../../shared/i18n/i18n-provider'
import { useToast } from '../../shared/toast/toast-provider'
import { BookStatus } from '../../types'

import { BookCover, FieldBlock, FieldError, statusOptions } from './shared/page-primitives'

export function BookDetails({ id }: { id: string }) {
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
  const [recentlyClickedStatus, setRecentlyClickedStatus] = useState<BookStatus | null>(null)

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

  if (!query.data) return <Card className="p-6">{t('common.loading')}</Card>
  const book = query.data

  const sessionsForBook = sessionsQuery.data ?? []
  const timeline = buildBookTimeline(sessionsForBook, book.currentPage ?? 0, book.totalPages)
  const recentTimeline = timeline.items.slice(0, 6)
  const notes = notesQuery.data ?? []

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

  const handleMoveStatus = async (status: BookStatus) => {
    setRecentlyClickedStatus(status)
    window.setTimeout(() => {
      setRecentlyClickedStatus((current) => (current === status ? null : current))
    }, 500)
    await updateStatus.mutateAsync({ id: book.id, status })
  }

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
              {numberFormatter.format(book.currentPage ?? 0)} / {numberFormatter.format(book.totalPages)}{' '}
              {t('books.pagesLabel')}
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
            <MiniStat label={t('books.notesCountLabel')} value={numberFormatter.format(notes.length)} />
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
            <span className="font-medium text-foreground">{t('books.timelineNextActionLabel')}:</span>{' '}
            {t(`books.timelineNextAction.${timeline.summary.nextActionKey}`)}
          </div>

          <div className="space-y-2">
            {recentTimeline.map((session) => (
              <div key={session.id} className="rounded-xl border border-border bg-surface p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{formatCalendarDate(session.date)}</p>
                  <p className="text-mutedForeground">
                    +{numberFormatter.format(session.progressDelta)} {t('books.pagesShortLabel')}
                  </p>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-border/70">
                  <div
                    className="h-full rounded-full bg-primary/50"
                    style={{
                      width: `${Math.max(6, Math.min(100, (session.progressAfter / Math.max(1, book.totalPages)) * 100))}%`
                    }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-mutedForeground">
                  <p>
                    {numberFormatter.format(session.progressAfter)} /{' '}
                    {numberFormatter.format(book.totalPages)} {t('books.pagesLabel')}
                  </p>
                  <p>
                    {numberFormatter.format(session.duration)} {t('books.minutesLabel')}
                    {session.daysSincePrevious
                      ? ` · ${t('books.timelineGapDays', { count: numberFormatter.format(session.daysSincePrevious) })}`
                      : ''}
                  </p>
                </div>
              </div>
            ))}
            {!recentTimeline.length ? (
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
          {notes.slice(0, 2).map((n) => (
            <div key={n.id} className="rounded-xl border border-border bg-surface p-3 text-sm">
              <p>{n.note}</p>
              {n.highlight ? <p className="mt-1 text-mutedForeground">“{n.highlight}”</p> : null}
            </div>
          ))}
          {!notes.length ? <p className="text-sm text-mutedForeground">{t('books.notesEmpty')}</p> : null}
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
                await addNote.mutateAsync(values)
                noteForm.reset()
              })}
            >
              <FieldBlock label={t('books.noteLabel')}>
                <Textarea placeholder={t('books.notePlaceholder')} {...noteForm.register('note')} />
              </FieldBlock>
              <FieldBlock label={t('books.highlightLabel')}>
                <Input
                  placeholder={t('books.highlightPlaceholder')}
                  {...noteForm.register('highlight')}
                />
              </FieldBlock>
              <Button type="submit" size="sm" className="w-full sm:w-auto">
                {t('books.saveNote')}
              </Button>
            </form>

            {notes.slice(2).map((n) => (
              <div key={n.id} className="rounded-xl border border-border bg-background p-3 text-sm">
                <p>{n.note}</p>
                {n.highlight ? <p className="mt-1 text-mutedForeground">“{n.highlight}”</p> : null}
              </div>
            ))}
          </div>
        </details>
      </SectionCard>

      {book.status === 'finished' ? (
        <SectionCard>
          <SectionHeader
            title={t('books.finishSummaryTitle')}
            description={t('books.finishSummaryDescription')}
            icon={<BookCheck className="h-4 w-4" />}
          />
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
            <MiniStat label={t('books.notesCountLabel')} value={numberFormatter.format(notes.length)} />
          </div>
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
                      await updateProgress.mutateAsync({ id: book.id, currentPage: values.currentPage })
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
                    <Input placeholder={t('library.titlePlaceholder')} {...editForm.register('title')} />
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
                    <Input placeholder={t('library.genreOptional')} {...editForm.register('genre')} />
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
              <SectionHeader title={t('books.actions')} description={t('books.actionsDescription')} />
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
