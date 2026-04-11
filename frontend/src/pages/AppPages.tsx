import { zodResolver } from '@hookform/resolvers/zod'
import {
  BookPlus,
  Bookmark,
  CircleDollarSign,
  ExternalLink,
  Flame,
  LibraryBig,
  LineChart,
  ListChecks,
  NotebookPen,
  Sparkles,
  Timer
} from 'lucide-react'
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
  useBookNotesQuery,
  useBookQuery,
  useBooksQuery,
  useCreateBookMutation,
  useCreateBookNoteMutation,
  useDeleteBookMutation,
  useUpdateBookProgressMutation,
  useUpdateBookStatusMutation
} from '../features/books/queries/use-books'
import {
  useCreateSessionMutation,
  useDashboardAnalytics,
  useDashboardInsights,
  useDashboardReminder,
  useGoalProgress,
  useSaveGoalMutation,
  useSessions
} from '../features/dashboard/queries/use-dashboard'
import {
  nameSchema,
  NameValues,
  passwordSchema,
  PasswordValues,
  reminderSchema,
  ReminderValues
} from '../features/profile/forms/profile-schemas'
import {
  useReminderSettingsQuery,
  useUpdatePasswordMutation,
  useUpdateProfileNameMutation,
  useUpdateReminderMutation
} from '../features/profile/queries/use-profile'
import {
  wishlistItemSchema,
  WishlistItemValues,
  wishlistLinkSchema,
  WishlistLinkValues
} from '../features/wishlist/forms/wishlist-schemas'
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

function BookCover({ title, coverUrl }: { title: string; coverUrl?: string | null }) {
  if (coverUrl) {
    return <img src={coverUrl} alt={title} className="h-24 w-16 rounded-lg border border-border object-cover" />
  }
  return (
    <div className="flex h-24 w-16 items-center justify-center rounded-lg border border-dashed border-border bg-surface text-mutedForeground">
      <LibraryBig className="h-4 w-4" />
    </div>
  )
}

function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: typeof Sparkles }) {
  return (
    <Card className="surface-hover p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-small text-mutedForeground">{title}</p>
        <span className="rounded-lg bg-secondary p-2 text-mutedForeground">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </Card>
  )
}

export function Dashboard() {
  const { t, locale } = useI18n()
  const booksQuery = useBooksQuery()
  const analyticsQuery = useDashboardAnalytics()
  const insightsQuery = useDashboardInsights()
  const reminderQuery = useDashboardReminder()
  const goalsQuery = useGoalProgress()
  const sessionsQuery = useSessions()
  const saveGoal = useSaveGoalMutation()
  const createSession = useCreateSessionMutation()

  const books = useMemo(() => booksQuery.data ?? [], [booksQuery.data])
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
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US'),
    [locale]
  )

  return (
    <div className="space-y-6">
      <PageHeader title={t('dashboard.title')} description={t('dashboard.description')} eyebrow={t('nav.workspace')} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title={t('status.currentlyReading')} value={numberFormatter.format(counts.currentlyReading)} icon={BookPlus} />
        <StatCard title={t('status.inLibrary')} value={numberFormatter.format(counts.inLibrary)} icon={LibraryBig} />
        <StatCard title={t('status.finished')} value={numberFormatter.format(counts.finished)} icon={ListChecks} />
        <StatCard title={t('dashboard.readingPace')} value={numberFormatter.format(analytics?.base.readingPacePerMonth ?? 0)} icon={LineChart} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <SectionCard>
          <p className="eyebrow">{t('dashboard.currentSnapshot')}</p>
          {activeBook ? (
            <div className="space-y-3 rounded-2xl border border-border/80 bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <BookCover title={activeBook.title} coverUrl={activeBook.coverUrl} />
                  <div>
                    <p className="font-semibold">{activeBook.title}</p>
                    <p className="text-small text-mutedForeground">{activeBook.author}</p>
                  </div>
                </div>
                <Badge className="border border-primary/20 bg-primary/10 text-foreground">{Math.round(activeBook.progressPercentage)}%</Badge>
              </div>
              <Progress value={activeBook.progressPercentage} />
              <p className="text-xs text-mutedForeground">{numberFormatter.format(activeBook.currentPage)} / {numberFormatter.format(activeBook.totalPages)}</p>
              <Button size="sm" onClick={() => createSession.mutate({ bookId: activeBook.id, date: new Date().toISOString().slice(0, 10), duration: 25, pages: 12 })}>
                {t('dashboard.logSession')}
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-5 text-sm text-mutedForeground">{t('dashboard.noActiveDescription')}</div>
          )}
        </SectionCard>

        <SectionCard>
          <p className="eyebrow">{t('dashboard.intelligenceTitle')}</p>
          <div className="space-y-3">
            {insights.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-surface px-4 py-3 text-sm">{item.message}</div>
            ))}
            {!insights.length && <p className="text-sm text-mutedForeground">{t('dashboard.noInsights')}</p>}
          </div>
          {reminder ? <p className="text-small text-mutedForeground">{reminder.enabled ? reminder.time : t('dashboard.reminderOff')}</p> : null}
          <p className="text-small text-mutedForeground">{t('dashboard.sessionsCount', { count: sessions.length })}</p>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard>
          <p className="eyebrow">{t('dashboard.analyticsTitle')}</p>
          <QueryState
            isLoading={analyticsQuery.isLoading}
            isError={analyticsQuery.isError}
            isEmpty={!analytics}
            emptyTitle={t('dashboard.emptyAnalyticsTitle')}
            emptyDescription={t('dashboard.emptyAnalyticsDescription')}
            onRetry={() => void analyticsQuery.refetch()}
          >
            {analytics ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="metric-tile"><p>{t('dashboard.totalPagesRead')}</p><p>{numberFormatter.format(analytics.base.totalPagesRead)}</p></div>
                <div className="metric-tile"><p>{t('dashboard.completionRate')}</p><p>{analytics.base.completionRate}%</p></div>
                <div className="metric-tile"><p>{t('dashboard.readingPace')}</p><p>{numberFormatter.format(analytics.base.readingPacePerMonth)}</p></div>
                <div className="metric-tile"><p>{t('dashboard.consistency')}</p><p>{analytics.consistencyScore}%</p></div>
              </div>
            ) : null}
          </QueryState>
        </SectionCard>

        <SectionCard>
          <p className="eyebrow">{t('dashboard.goalsTitle')}</p>
          <div className="space-y-3">
            {goals.map((goal) => (
              <div key={goal.period} className="rounded-xl border border-border bg-surface p-3">
                <p className="font-medium">{goal.period === 'weekly' ? t('dashboard.periodWeekly') : t('dashboard.periodMonthly')}</p>
                <p className="text-xs text-mutedForeground">{t('dashboard.goalSummary', { pagesRead: goal.pagesRead, pagesGoal: goal.pagesGoal, booksRead: goal.booksRead, booksGoal: goal.booksGoal })}</p>
              </div>
            ))}
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => saveGoal.mutate({ period: 'weekly', pages: 120, books: 1 })}>{t('dashboard.setWeekly')}</Button>
              <Button size="sm" variant="secondary" onClick={() => saveGoal.mutate({ period: 'monthly', pages: 500, books: 2 })}>{t('dashboard.setMonthly')}</Button>
            </div>
          </div>
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
  const [showAddBookForm, setShowAddBookForm] = useState(true)

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
      <PageHeader title={t('library.title')} description={t('library.description')} eyebrow={t('nav.workspace')} />
      <SectionCard>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-section-title"><BookPlus className="h-4 w-4" />{t('library.addBook')}</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowAddBookForm((prev) => !prev)}>
            {showAddBookForm ? t('library.hideForm') : t('library.showForm')}
          </Button>
        </div>
        {showAddBookForm ? (
          <form onSubmit={onAddBook} className="grid gap-3 md:grid-cols-8">
            <Input placeholder={t('library.titlePlaceholder')} {...addBookForm.register('title')} />
            <Input placeholder={t('library.authorPlaceholder')} {...addBookForm.register('author')} />
            <Input type="number" min={1} placeholder={t('library.totalPages')} {...addBookForm.register('totalPages', { valueAsNumber: true })} />
            <Select {...addBookForm.register('status')}>
              {statusOptions.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
            </Select>
            <Input placeholder={t('library.coverUrlOptional')} {...addBookForm.register('coverUrl')} />
            <Input placeholder={t('library.genreOptional')} {...addBookForm.register('genre')} />
            <Input placeholder={t('library.isbnOptional')} {...addBookForm.register('isbn')} />
            <Button type="submit" disabled={createBookMutation.isPending}>{t('library.add')}</Button>
          </form>
        ) : null}
      </SectionCard>
      <DataToolbar>
        <Input placeholder={t('library.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{t('library.allStatuses')}</option>
          {statusOptions.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
        </Select>
        <Input placeholder={t('library.genre')} value={genre} onChange={(e) => setGenre(e.target.value)} />
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'updated_at' | 'title')}>
          <option value="updated_at">{t('library.sortRecent')}</option>
          <option value="title">{t('library.sortTitle')}</option>
        </Select>
        {(search || status || genre) && <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatus(''); setGenre('') }}>{t('library.clearFilters')}</Button>}
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
                  <div className="flex gap-3">
                    <BookCover title={book.title} coverUrl={book.coverUrl} />
                    <div>
                      <p className="font-semibold">{book.title}</p>
                      <p className="text-small text-mutedForeground">{book.author}</p>
                    </div>
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
      <PageHeader title={title} description={description} eyebrow={t('books.collection')} />
      <QueryState isLoading={query.isLoading} isError={query.isError} isEmpty={!query.data?.length} emptyTitle={t('books.emptyTitle')} emptyDescription={t('books.emptyDescription')}>
        <div className="grid gap-4 md:grid-cols-2">
          {query.data?.map((book) => (
            <SectionCard key={book.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <BookCover title={book.title} coverUrl={book.coverUrl} />
                  <div><p className="font-semibold">{book.title}</p><p className="text-small text-mutedForeground">{book.author}</p></div>
                </div>
                <p className="text-sm text-mutedForeground">{book.currentPage}/{book.totalPages}</p>
              </div>
              <Progress value={book.progressPercentage} />
              <div className="flex flex-wrap gap-2">
                {status === 'currentlyReading' ? <Button onClick={() => updateStatus.mutate({ id: book.id, status: 'finished' })}>{t('books.markFinished')}</Button> : null}
                {status === 'nextToRead' ? <Button onClick={() => updateStatus.mutate({ id: book.id, status: 'currentlyReading' })}>{t('books.startReading')}</Button> : null}
                {status === 'currentlyReading' ? <Button variant="secondary" onClick={() => updateProgress.mutate({ id: book.id, currentPage: Math.min(book.currentPage + 10, book.totalPages) })}>{t('books.updateProgress')}</Button> : null}
                <Link to={`/books/${book.id}`}><Button variant="ghost">{t('common.details')}</Button></Link>
              </div>
            </SectionCard>
          ))}
        </div>
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
      <PageHeader title={t('wishlist.title')} description={t('wishlist.description')} eyebrow={t('books.collection')} />
      <SectionCard>
        <h2 className="flex items-center gap-2 text-section-title"><Bookmark className="h-4 w-4" />{t('wishlist.addTitle')}</h2>
        <form onSubmit={itemForm.handleSubmit(async (values) => addItem.mutateAsync({ ...values, expectedPrice: Number.isNaN(values.expectedPrice) ? null : values.expectedPrice ?? null }))} className="grid gap-3 md:grid-cols-2">
          <Input placeholder={t('library.titlePlaceholder')} {...itemForm.register('title')} />
          <Input placeholder={t('library.authorPlaceholder')} {...itemForm.register('author')} />
          <Input type="number" step="0.01" placeholder={t('wishlist.expectedPrice')} {...itemForm.register('expectedPrice', { valueAsNumber: true })} />
          <Input placeholder={t('wishlist.notes')} {...itemForm.register('notes')} />
          <Button type="submit" className="md:col-span-2 md:w-fit" disabled={addItem.isPending}>{t('wishlist.addAction')}</Button>
        </form>
      </SectionCard>
      <QueryState isLoading={query.isLoading} isError={query.isError} isEmpty={!query.data?.length} emptyTitle={t('wishlist.emptyTitle')} emptyDescription={t('wishlist.emptyDescription')}>
        <div className="grid gap-4 md:grid-cols-2">
          {query.data?.map((item) => (
            <SectionCard key={item.id} className="list-item-enter">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-small text-mutedForeground">{item.author}</p>
                </div>
                <Badge className="border border-warning/30 bg-warning/10 text-warning"><CircleDollarSign className="h-3.5 w-3.5" /></Badge>
              </div>
              <Separator />
              <form onSubmit={linkForm.handleSubmit(async (values) => addLink.mutateAsync({ itemId: item.id, ...values }))} className="space-y-2">
                <Input placeholder={t('wishlist.linkLabel')} {...linkForm.register('label')} />
                <div className="flex gap-2">
                  <Input placeholder={t('wishlist.urlPlaceholder')} {...linkForm.register('url')} />
                  <Button type="submit" disabled={addLink.isPending}><ExternalLink className="h-4 w-4" /></Button>
                </div>
              </form>
              {item.purchaseLinks.length ? (
                <div className="space-y-2">
                  {item.purchaseLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-xs text-mutedForeground hover:bg-secondary"
                    >
                      <span>{link.label || link.alias}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              ) : null}
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

  if (!query.data) return <Card className="p-6">{t('common.loading')}</Card>
  const book = query.data

  return (
    <div className="space-y-6">
      <PageHeader title={book.title} description={book.author} action={<StatusBadge status={book.status} />} eyebrow={t('books.readingProgress')} />
      <SectionCard>
        <div className="flex items-center gap-4">
          <BookCover title={book.title} coverUrl={book.coverUrl} />
          <div className="flex-1 space-y-2">
            <p>{t('books.readingProgress')}: {Math.round(book.progressPercentage)}%</p>
            <Progress value={book.progressPercentage} />
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <h2 className="flex items-center gap-2 text-section-title"><NotebookPen className="h-4 w-4" />{t('books.notesTitle')}</h2>
        <form className="space-y-2" onSubmit={noteForm.handleSubmit(async (values) => { await addNote.mutateAsync(values); noteForm.reset() })}>
          <Textarea placeholder={t('books.notePlaceholder')} {...noteForm.register('note')} />
          <Input placeholder={t('books.highlightPlaceholder')} {...noteForm.register('highlight')} />
          <Button type="submit" size="sm">{t('books.saveNote')}</Button>
        </form>
        <div className="mt-3 space-y-2">
          {notesQuery.data?.map((n) => (
            <div key={n.id} className="rounded-xl border border-border bg-surface p-3 text-sm">
              <p>{n.note}</p>
              {n.highlight ? <p className="mt-1 text-mutedForeground">“{n.highlight}”</p> : null}
            </div>
          ))}
          {!notesQuery.data?.length ? (
            <p className="text-sm text-mutedForeground">{t('books.notesEmpty')}</p>
          ) : null}
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
      <PageHeader title={t('profile.title')} description={t('profile.description')} eyebrow={t('nav.account')} />
      <SectionCard className="max-w-2xl">
        <h2 className="flex items-center gap-2 text-section-title"><Sparkles className="h-4 w-4" />{t('profile.updateName')}</h2>
        <form onSubmit={nameForm.handleSubmit(async (values) => { await updateName.mutateAsync(values.name); toast.success(t('profile.nameSuccess')) })} className="space-y-3">
          <Input placeholder={t('profile.newName')} {...nameForm.register('name')} />
          <Button type="submit" disabled={updateName.isPending}>{t('profile.updateNameAction')}</Button>
        </form>
      </SectionCard>
      <SectionCard className="max-w-2xl">
        <h2 className="flex items-center gap-2 text-section-title"><Timer className="h-4 w-4" />{t('profile.updatePassword')}</h2>
        <form onSubmit={passwordForm.handleSubmit(async (values) => { await updatePassword.mutateAsync(values); toast.success(t('profile.passwordSuccess')); passwordForm.reset() })} className="space-y-3">
          <Input type="password" placeholder={t('profile.currentPassword')} {...passwordForm.register('currentPassword')} />
          <Input type="password" placeholder={t('profile.newPassword')} {...passwordForm.register('newPassword')} />
          <Button type="submit" disabled={updatePassword.isPending}>{t('profile.updatePasswordAction')}</Button>
        </form>
      </SectionCard>
      <SectionCard className="max-w-2xl">
        <h2 className="flex items-center gap-2 text-section-title"><Flame className="h-4 w-4" />{t('profile.reminders')}</h2>
        <form onSubmit={reminderForm.handleSubmit(async (values) => { await updateReminder.mutateAsync(values); toast.success(t('profile.reminderSuccess')) })} className="grid gap-3 md:grid-cols-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={reminderForm.watch('enabled')} onChange={(e) => reminderForm.setValue('enabled', e.target.checked)} /> {t('profile.reminderEnabled')}</label>
          <Input type="time" {...reminderForm.register('time')} />
          <Select {...reminderForm.register('frequency')}>
            <option value="daily">{t('profile.daily')}</option>
            <option value="weekdays">{t('profile.weekdays')}</option>
            <option value="weekends">{t('profile.weekends')}</option>
            <option value="weekly">{t('profile.weekly')}</option>
          </Select>
          <Button type="submit" className="md:col-span-3 md:w-fit" disabled={updateReminder.isPending}>{t('profile.saveReminders')}</Button>
        </form>
      </SectionCard>
      <SectionCard className="max-w-2xl">
        <h2 className="text-section-title">{t('profile.notesTitle')}</h2>
        <Textarea placeholder={t('profile.notesPlaceholder')} />
      </SectionCard>
    </div>
  )
}
