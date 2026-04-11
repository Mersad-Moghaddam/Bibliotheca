import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { Progress, StatusBadge } from '../components/UI'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, SectionCard } from '../components/ui/card'
import { DataToolbar } from '../components/ui/data-toolbar'
import { Input } from '../components/ui/input'
import { PageHeader } from '../components/ui/page-header'
import { Select } from '../components/ui/select'
import { Separator } from '../components/ui/separator'
import { Textarea } from '../components/ui/textarea'
import { addBookSchema, AddBookValues, progressSchema, ProgressValues } from '../features/books/forms/book-schemas'
import {
  useBookQuery,
  useBooksQuery,
  useCreateBookMutation,
  useCreateBookNoteMutation,
  useDeleteBookMutation,
  useBookNotesQuery,
  useUpdateBookProgressMutation,
  useUpdateBookStatusMutation
} from '../features/books/queries/use-books'
import { useCreateSessionMutation, useDashboardAnalytics, useDashboardInsights, useDashboardReminder, useGoalProgress, useSaveGoalMutation, useSessions } from '../features/dashboard/queries/use-dashboard'
import { passwordSchema, PasswordValues, reminderSchema, ReminderValues, nameSchema, NameValues } from '../features/profile/forms/profile-schemas'
import {
  useReminderSettingsQuery,
  useUpdatePasswordMutation,
  useUpdateProfileNameMutation,
  useUpdateReminderMutation
} from '../features/profile/queries/use-profile'
import { wishlistItemSchema, WishlistItemValues, wishlistLinkSchema, WishlistLinkValues } from '../features/wishlist/forms/wishlist-schemas'
import {
  useAddWishlistItemMutation,
  useAddWishlistLinkMutation,
  useWishlistQuery
} from '../features/wishlist/queries/use-wishlist'
import { QueryState } from '../shared/components/query-state'
import { useI18n } from '../shared/i18n/i18n-provider'
import { useToast } from '../shared/toast/toast-provider'
import { BookStatus } from '../types'

const statusOptions: BookStatus[] = ['inLibrary', 'currentlyReading', 'finished', 'nextToRead']

function LineChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1)
  const points = values
    .map((v, idx) => `${(idx / (values.length - 1 || 1)) * 100},${100 - (v / max) * 100}`)
    .join(' ')

  return (
    <svg viewBox="0 0 100 100" className="h-32 w-full">
      <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="3" points={points} />
      {values.map((v, idx) => (
        <circle
          key={`${idx}-${v}`}
          cx={(idx / (values.length - 1 || 1)) * 100}
          cy={100 - (v / max) * 100}
          r="1.8"
          fill="hsl(var(--primary))"
        />
      ))}
    </svg>
  )
}

function BarChart({ values }: { values: { label: string; value: number }[] }) {
  const max = Math.max(...values.map((v) => v.value), 1)
  return (
    <div className="space-y-3">
      {values.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs text-mutedForeground">
            <span>{item.label}</span>
            <span>{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Dashboard() {
  const { t } = useI18n()
  const booksQuery = useBooksQuery()
  const analyticsQuery = useDashboardAnalytics()
  const insightsQuery = useDashboardInsights()
  const reminderQuery = useDashboardReminder()
  const goalsQuery = useGoalProgress()
  const sessionsQuery = useSessions()
  const saveGoal = useSaveGoalMutation()
  const createSession = useCreateSessionMutation()

  const books = booksQuery.data ?? []
  const analytics = analyticsQuery.data
  const insights = insightsQuery.data ?? []
  const reminder = reminderQuery.data
  const goals = goalsQuery.data ?? []
  const sessions = sessionsQuery.data ?? []

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

  const activeBook = books.find((book) => book.status === 'currentlyReading')

  return (
    <div className="space-y-6">
      <PageHeader title={t('dashboard.title')} description={t('dashboard.description')} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statusOptions.map((status) => (
          <Card key={status} className="surface-hover p-5">
            <p className="text-small text-mutedForeground">{t(`status.${status}`)}</p>
            <p className="mt-3 text-3xl font-semibold">{counts[status]}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <SectionCard>
          <p className="eyebrow">Reading momentum</p>
          <QueryState
            isLoading={analyticsQuery.isLoading}
            isError={analyticsQuery.isError}
            isEmpty={!analytics}
            emptyTitle="No analytics"
            emptyDescription="Your analytics will appear after adding books."
            onRetry={() => void analyticsQuery.refetch()}
          >
            {analytics ? (
              <>
                <LineChart
                  values={[
                    Math.max(analytics.base.readingPacePerMonth - 1, 0),
                    analytics.base.readingPacePerMonth,
                    analytics.base.readingPacePerMonth + 1,
                    analytics.base.readingPacePerMonth,
                    analytics.base.readingPacePerMonth + 2
                  ]}
                />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="metric-tile"><p>{t('dashboard.totalPagesRead')}</p><p>{analytics.base.totalPagesRead}</p></div>
                  <div className="metric-tile"><p>{t('dashboard.completionRate')}</p><p>{analytics.base.completionRate}%</p></div>
                  <div className="metric-tile"><p>{t('dashboard.readingPace')}</p><p>{analytics.base.readingPacePerMonth}</p></div>
                  <div className="metric-tile"><p>Consistency</p><p>{analytics.consistencyScore}%</p></div>
                </div>
              </>
            ) : null}
          </QueryState>
        </SectionCard>

        <SectionCard>
          <p className="eyebrow">Status distribution</p>
          <BarChart
            values={statusOptions.map((status) => ({ label: t(`status.${status}`), value: counts[status] }))}
          />
        </SectionCard>
      </div>


      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard>
          <h2 className="text-section-title">Reading goals</h2>
          <div className="space-y-3">
            {goals.map((goal) => (
              <div key={goal.period} className="rounded-xl border border-border bg-surface p-3">
                <p className="font-medium capitalize">{goal.period}</p>
                <p className="text-xs text-mutedForeground">Pages {goal.pagesRead}/{goal.pagesGoal} · Books {goal.booksRead}/{goal.booksGoal}</p>
              </div>
            ))}
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => saveGoal.mutate({ period: 'weekly', pages: 120, books: 1 })}>Set weekly</Button>
              <Button size="sm" variant="secondary" onClick={() => saveGoal.mutate({ period: 'monthly', pages: 500, books: 2 })}>Set monthly</Button>
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <h2 className="text-section-title">Reading sessions</h2>
          <p className="text-small text-mutedForeground">Recent sessions: {sessions.length}</p>
          <Button size="sm" className="mt-3" onClick={() => activeBook && createSession.mutate({ bookId: activeBook.id, date: new Date().toISOString().slice(0, 10), duration: 25, pages: 12 })}>Log quick session</Button>
          {analytics ? <p className="mt-3 text-small text-mutedForeground">Backlog health: {analytics.backlogHealth}</p> : null}
        </SectionCard>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <SectionCard>
          <h2 className="text-section-title">{t('dashboard.currentSnapshot')}</h2>
          {activeBook ? (
            <div className="space-y-3 rounded-2xl border border-border/80 bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{activeBook.title}</p>
                  <p className="text-small text-mutedForeground">{activeBook.author}</p>
                </div>
                <Badge className="border border-primary/20 bg-primary/10 text-foreground">
                  {Math.round(activeBook.progressPercentage)}%
                </Badge>
              </div>
              <Progress value={activeBook.progressPercentage} />
              <p className="text-xs text-mutedForeground">
                {activeBook.currentPage} / {activeBook.totalPages}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-5 text-sm text-mutedForeground">
              {t('dashboard.noActiveDescription')}
            </div>
          )}
        </SectionCard>
        <SectionCard>
          <h2 className="text-section-title">{t('dashboard.intelligenceTitle')}</h2>
          <div className="space-y-3">
            {insights.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-surface px-4 py-3 text-sm transition-all duration-200 hover:bg-secondary">{item.message}</div>
            ))}
          </div>
          {reminder ? <p className="text-small text-mutedForeground">{reminder.enabled ? reminder.time : t('dashboard.reminderOff')}</p> : null}
        </SectionCard>
      </div>
    </div>
  )
}

export function Library() {
  const { t } = useI18n()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [genre, setGenre] = useState('')
  const [sortBy, setSortBy] = useState<'updated_at' | 'title'>('updated_at')
  const booksQuery = useBooksQuery({ search, status, genre, sortBy, order: 'desc' })
  const createBookMutation = useCreateBookMutation()
  const deleteBookMutation = useDeleteBookMutation()

  const addBookForm = useForm<AddBookValues>({
    resolver: zodResolver(addBookSchema),
    defaultValues: { title: '', author: '', totalPages: 1, status: 'inLibrary', coverUrl: '', genre: '', isbn: '' }
  })

  const onAddBook = addBookForm.handleSubmit(async (values) => {
    try {
      await createBookMutation.mutateAsync(values)
      addBookForm.reset()
      toast.success(t('library.added'))
    } catch {
      toast.error(t('library.deleteError'))
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader title={t('library.title')} description={t('library.description')} />
      <SectionCard>
        <h2 className="text-section-title">{t('library.addBook')}</h2>
        <form onSubmit={onAddBook} className="grid gap-3 md:grid-cols-8">
          <Input placeholder={t('library.titlePlaceholder')} {...addBookForm.register('title')} />
          <Input placeholder={t('library.authorPlaceholder')} {...addBookForm.register('author')} />
          <Input type="number" min={1} placeholder={t('library.totalPages')} {...addBookForm.register('totalPages', { valueAsNumber: true })} />
          <Select {...addBookForm.register('status')}>
            {statusOptions.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
          </Select>
          <Input placeholder="Cover URL (optional)" {...addBookForm.register('coverUrl')} />
          <Input placeholder="Genre (optional)" {...addBookForm.register('genre')} />
          <Input placeholder="ISBN (optional)" {...addBookForm.register('isbn')} />
          <Button type="submit" disabled={createBookMutation.isPending}>{t('library.add')}</Button>
        </form>
      </SectionCard>
      <DataToolbar>
        <Input placeholder={t('library.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{t('library.allStatuses')}</option>
          {statusOptions.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
        </Select>
        <Input placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'updated_at' | 'title')}>
          <option value="updated_at">Recently updated</option>
          <option value="title">Title</option>
        </Select>
        {(search || status || genre) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatus(''); setGenre('') }}>
            {t('library.clearFilters')}
          </Button>
        )}
      </DataToolbar>
      <QueryState
        isLoading={booksQuery.isLoading}
        isError={booksQuery.isError}
        isEmpty={!booksQuery.data?.length}
        emptyTitle={t('library.noBooksTitle')}
        emptyDescription={t('library.noBooksDescription')}
        onRetry={() => void booksQuery.refetch()}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {booksQuery.data?.map((book) => (
            <Card key={book.id} className="surface-hover p-5 list-item-enter">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{book.title}</p>
                    <p className="text-small text-mutedForeground">{book.author}</p>
                  </div>
                  <StatusBadge status={book.status} />
                </div>
                <Progress value={book.progressPercentage} />
                <div className="flex flex-wrap gap-2">
                  <Link to={`/books/${book.id}`}><Button size="sm">{t('common.details')}</Button></Link>
                  <Button size="sm" variant="secondary" disabled={deleteBookMutation.isPending} onClick={() => deleteBookMutation.mutate(book.id)}>{t('books.delete')}</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  )
}

function BookListByStatus({ status, title, description }: { status: BookStatus; title: string; description: string }) {
  const query = useBooksQuery({ status })
  const updateStatus = useUpdateBookStatusMutation()
  const updateProgress = useUpdateBookProgressMutation()
  const { t } = useI18n()

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <QueryState isLoading={query.isLoading} isError={query.isError} isEmpty={!query.data?.length} emptyTitle="No books" emptyDescription="Move books from library.">
        {query.data?.map((book) => (
          <SectionCard key={book.id}>
            <div className="flex justify-between"><p>{book.title}</p><p>{book.currentPage}/{book.totalPages}</p></div>
            <Progress value={book.progressPercentage} />
            {status === 'currentlyReading' ? (
              <Button onClick={() => updateStatus.mutate({ id: book.id, status: 'finished' })}>{t('books.markFinished')}</Button>
            ) : null}
            {status === 'nextToRead' ? (
              <Button onClick={() => updateStatus.mutate({ id: book.id, status: 'currentlyReading' })}>{t('books.startReading')}</Button>
            ) : null}
            {status === 'currentlyReading' ? (
              <Button variant="secondary" onClick={() => updateProgress.mutate({ id: book.id, currentPage: Math.min(book.currentPage + 10, book.totalPages) })}>{t('books.updateProgress')}</Button>
            ) : null}
          </SectionCard>
        ))}
      </QueryState>
    </div>
  )
}

export const Reading = () => {
  const { t } = useI18n()
  return <BookListByStatus status="currentlyReading" title={t('books.reading')} description={t('books.readingDesc')} />
}
export const Finished = () => {
  const { t } = useI18n()
  return <BookListByStatus status="finished" title={t('books.finished')} description={t('books.finishedDesc')} />
}
export const Next = () => {
  const { t } = useI18n()
  return <BookListByStatus status="nextToRead" title={t('books.nextToRead')} description={t('books.nextToReadDesc')} />
}

export function Wishlist() {
  const query = useWishlistQuery()
  const addItem = useAddWishlistItemMutation()
  const addLink = useAddWishlistLinkMutation()
  const { t } = useI18n()

  const itemForm = useForm<WishlistItemValues>({ resolver: zodResolver(wishlistItemSchema), defaultValues: { title: '', author: '', notes: '' } })
  const linkForm = useForm<WishlistLinkValues>({ resolver: zodResolver(wishlistLinkSchema), defaultValues: { label: '', url: '' } })

  return (
    <div className="space-y-6">
      <PageHeader title={t('wishlist.title')} description={t('wishlist.description')} />
      <SectionCard>
        <h2 className="text-section-title">Add wishlist title</h2>
        <form onSubmit={itemForm.handleSubmit(async (values) => addItem.mutateAsync({ ...values, expectedPrice: Number.isNaN(values.expectedPrice) ? null : values.expectedPrice ?? null }))} className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Title" {...itemForm.register('title')} />
          <Input placeholder="Author" {...itemForm.register('author')} />
          <Input type="number" step="0.01" placeholder="Expected price" {...itemForm.register('expectedPrice', { valueAsNumber: true })} />
          <Input placeholder="Short note" {...itemForm.register('notes')} />
          <Button type="submit" className="md:col-span-2 md:w-fit" disabled={addItem.isPending}>Add to wishlist</Button>
        </form>
      </SectionCard>
      <QueryState isLoading={query.isLoading} isError={query.isError} isEmpty={!query.data?.length} emptyTitle="Wishlist is empty" emptyDescription="Add books to wishlist.">
        <div className="grid gap-4 md:grid-cols-2">
          {query.data?.map((item) => (
            <SectionCard key={item.id} className="list-item-enter">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-small text-mutedForeground">{item.author}</p>
                </div>
                <Badge className="border border-warning/30 bg-warning/10 text-warning">Wishlist</Badge>
              </div>
              <Separator />
              <form onSubmit={linkForm.handleSubmit(async (values) => addLink.mutateAsync({ itemId: item.id, ...values }))} className="space-y-2">
                <Input placeholder="Optional store label" {...linkForm.register('label')} />
                <div className="flex gap-2">
                  <Input placeholder="https://example.com/book" {...linkForm.register('url')} />
                  <Button type="submit" disabled={addLink.isPending}>Add link</Button>
                </div>
              </form>
            </SectionCard>
          ))}
        </div>
      </QueryState>
    </div>
  )
}

export function BookDetails({ id }: { id: string }) {
  const { t } = useI18n()
  const nav = useNavigate()
  const query = useBookQuery(id)
  const updateStatus = useUpdateBookStatusMutation()
  const updateProgress = useUpdateBookProgressMutation()
  const deleteBook = useDeleteBookMutation()
  const notesQuery = useBookNotesQuery(id)
  const addNote = useCreateBookNoteMutation(id)

  const form = useForm<ProgressValues>({ resolver: zodResolver(progressSchema), defaultValues: { currentPage: 0 } })
  const noteForm = useForm<{ note: string; highlight: string }>({ defaultValues: { note: '', highlight: '' } })

  if (!query.data) return <Card className="p-6">Loading…</Card>
  const book = query.data

  return (
    <div className="space-y-6">
      <PageHeader title={book.title} description={book.author} action={<StatusBadge status={book.status} />} />
      <SectionCard>
        <p>Progress: {Math.round(book.progressPercentage)}%</p>
        <Progress value={book.progressPercentage} />
      </SectionCard>

      <SectionCard>
        <h2 className="text-section-title">Notes & highlights</h2>
        <form className="space-y-2" onSubmit={noteForm.handleSubmit(async (values) => { await addNote.mutateAsync(values); noteForm.reset() })}>
          <Textarea placeholder="Your note" {...noteForm.register('note')} />
          <Input placeholder="Optional quote/highlight" {...noteForm.register('highlight')} />
          <Button type="submit" size="sm">Save note</Button>
        </form>
        <div className="mt-3 space-y-2">
          {notesQuery.data?.map((n) => (
            <div key={n.id} className="rounded-xl border border-border bg-surface p-3 text-sm">
              <p>{n.note}</p>
              {n.highlight ? <p className="mt-1 text-mutedForeground">“{n.highlight}”</p> : null}
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <Button key={status} variant="secondary" onClick={() => updateStatus.mutate({ id: book.id, status })}>{t('books.moveTo')} {t(`status.${status}`)}</Button>
          ))}
        </div>
        <form className="mt-3 flex gap-2" onSubmit={form.handleSubmit(async (values) => updateProgress.mutateAsync({ id: book.id, currentPage: values.currentPage }))}>
          <Input type="number" min={0} max={book.totalPages} {...form.register('currentPage', { valueAsNumber: true })} />
          <Button type="submit">{t('books.updateProgress')}</Button>
        </form>
        <Button className="mt-3" variant="secondary" onClick={async () => { await deleteBook.mutateAsync(book.id); nav('/library') }}>{t('books.delete')}</Button>
      </SectionCard>
    </div>
  )
}

export function Profile() {
  const { t } = useI18n()
  const toast = useToast()
  const reminderQuery = useReminderSettingsQuery()
  const updateName = useUpdateProfileNameMutation()
  const updatePassword = useUpdatePasswordMutation()
  const updateReminder = useUpdateReminderMutation()

  const nameForm = useForm<NameValues>({ resolver: zodResolver(nameSchema), defaultValues: { name: '' } })
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: '', newPassword: '' } })
  const reminderForm = useForm<ReminderValues>({
    resolver: zodResolver(reminderSchema),
    values: reminderQuery.data ?? { enabled: false, time: '20:00', frequency: 'daily' }
  })

  return (
    <div className="space-y-6">
      <PageHeader title={t('profile.title')} description={t('profile.description')} />
      <SectionCard className="max-w-2xl">
        <form onSubmit={nameForm.handleSubmit(async (values) => { await updateName.mutateAsync(values.name); toast.success(t('profile.nameSuccess')) })} className="space-y-3">
          <Input placeholder={t('profile.newName')} {...nameForm.register('name')} />
          <Button type="submit" disabled={updateName.isPending}>{t('profile.updateNameAction')}</Button>
        </form>
      </SectionCard>
      <SectionCard className="max-w-2xl">
        <form onSubmit={passwordForm.handleSubmit(async (values) => { await updatePassword.mutateAsync(values); toast.success(t('profile.passwordSuccess')); passwordForm.reset() })} className="space-y-3">
          <Input type="password" placeholder={t('profile.currentPassword')} {...passwordForm.register('currentPassword')} />
          <Input type="password" placeholder={t('profile.newPassword')} {...passwordForm.register('newPassword')} />
          <Button type="submit" disabled={updatePassword.isPending}>{t('profile.updatePasswordAction')}</Button>
        </form>
      </SectionCard>
      <SectionCard className="max-w-2xl">
        <form onSubmit={reminderForm.handleSubmit(async (values) => { await updateReminder.mutateAsync(values); toast.success(t('profile.reminderSuccess')) })} className="grid gap-3 md:grid-cols-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={reminderForm.watch('enabled')} onChange={(e) => reminderForm.setValue('enabled', e.target.checked)} /> {t('profile.reminderEnabled')}</label>
          <Input type="time" {...reminderForm.register('time')} />
          <Select {...reminderForm.register('frequency')}>
            <option value="daily">{t('profile.daily')}</option>
            <option value="weekdays">{t('profile.weekdays')}</option>
            <option value="weekends">{t('profile.weekends')}</option>
          </Select>
          <Button type="submit" className="md:col-span-3 md:w-fit" disabled={updateReminder.isPending}>{t('profile.saveReminders')}</Button>
        </form>
      </SectionCard>
      <SectionCard className="max-w-2xl">
        <h2 className="text-section-title">Notes</h2>
        <Textarea placeholder="Optional personal reading notes..." />
      </SectionCard>
    </div>
  )
}
