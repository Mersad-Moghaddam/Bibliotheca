import { zodResolver } from '@hookform/resolvers/zod'
import { BookCheck, BookOpen, BookPlus, Forward, List } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { Progress, StatusBadge } from '../components/UI'
import { Button } from '../components/ui/button'
import { Card, SectionCard } from '../components/ui/card'
import { ContextActionCard } from '../components/ui/context-action-card'
import { DataToolbar } from '../components/ui/data-toolbar'
import { Input } from '../components/ui/input'
import { ItemAction, ItemActionsMenu } from '../components/ui/item-actions-menu'
import { SectionHeader } from '../components/ui/section-header'
import { Select } from '../components/ui/select'
import { SwipeableCardShell } from '../components/ui/swipeable-shell'
import { addBookSchema, AddBookValues } from '../features/books/forms/book-schemas'
import {
  useBooksQuery,
  useCreateBookMutation,
  useDeleteBookMutation,
  useUpdateBookStatusMutation
} from '../features/books/queries/use-books'
import { QueryState } from '../shared/components/query-state'
import { useI18n } from '../shared/i18n/i18n-provider'
import { useToast } from '../shared/toast/toast-provider'
import { BookStatus } from '../types'

import { BookCover, FieldBlock, FieldError, PageHeading } from './modules/page-primitives'

const statusOptions: BookStatus[] = ['inLibrary', 'currentlyReading', 'finished', 'nextToRead']

export function LibraryPage() {
  const { t } = useI18n()
  const toast = useToast()
  const nav = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [genre, setGenre] = useState('')
  const [sortBy, setSortBy] = useState<'updated_at' | 'title'>('updated_at')
  const [showAddBookForm, setShowAddBookForm] = useState(true)
  const [expandedQuickId, setExpandedQuickId] = useState<string | null>(null)

  const booksQuery = useBooksQuery({ search, status, genre, sortBy, order: 'desc' })
  const createBookMutation = useCreateBookMutation()
  const updateStatusMutation = useUpdateBookStatusMutation()
  const deleteBookMutation = useDeleteBookMutation()

  const addBookForm = useForm<AddBookValues>({
    resolver: zodResolver(addBookSchema),
    defaultValues: {
      title: '',
      author: '',
      totalPages: 1,
      status: 'inLibrary',
      coverUrl: '',
      genre: '',
      isbn: ''
    }
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

  const firstInProgress = booksQuery.data?.find(
    (book) => book.status === 'currentlyReading' || (book.currentPage > 0 && book.status !== 'finished')
  )

  const filteredBooks = useMemo(() => booksQuery.data ?? [], [booksQuery.data])

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeading title={t('library.title')} />

      <SectionCard>
        <SectionHeader
          title={t('journey.libraryActionsTitle')}
          description={t('journey.libraryActionsDescription')}
        />
        <div className="grid gap-3 md:grid-cols-3">
          <ContextActionCard
            title={t('journey.actions.addBook.title')}
            description={t('journey.actions.addBook.description')}
            actionLabel={t('journey.actions.addBook.cta')}
            icon={<BookPlus className="h-4 w-4" />}
            onAction={() => setShowAddBookForm(true)}
          />
          <ContextActionCard
            title={t('journey.actions.filterActive.title')}
            description={t('journey.actions.filterActive.description')}
            actionLabel={t('journey.actions.filterActive.cta')}
            icon={<BookOpen className="h-4 w-4" />}
            onAction={() => setStatus('currentlyReading')}
          />
          <ContextActionCard
            title={t('journey.actions.resumeReading.title')}
            description={
              firstInProgress
                ? t('journey.actions.resumeReading.withBook', { title: firstInProgress.title })
                : t('journey.actions.resumeReading.description')
            }
            actionLabel={t('journey.actions.resumeReading.cta')}
            icon={<BookOpen className="h-4 w-4" />}
            onAction={() => nav(firstInProgress ? `/books/${firstInProgress.id}` : '/reading')}
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader
          title={t('library.addBook')}
          description={t('library.addBookDescription')}
          icon={<BookPlus className="h-4 w-4" />}
          action={
            <Button variant="ghost" size="sm" onClick={() => setShowAddBookForm((prev) => !prev)}>
              {showAddBookForm ? t('library.hideForm') : t('library.showForm')}
            </Button>
          }
        />
        {showAddBookForm ? (
          <form onSubmit={onAddBook} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <FieldBlock label={t('library.titlePlaceholder')}>
                <Input placeholder={t('library.titlePlaceholder')} {...addBookForm.register('title')} />
              </FieldBlock>
              <FieldError message={addBookForm.formState.errors.title?.message} />
            </div>
            <div>
              <FieldBlock label={t('library.authorPlaceholder')}>
                <Input placeholder={t('library.authorPlaceholder')} {...addBookForm.register('author')} />
              </FieldBlock>
              <FieldError message={addBookForm.formState.errors.author?.message} />
            </div>
            <div>
              <FieldBlock label={t('library.totalPages')}>
                <Input
                  type="number"
                  min={1}
                  placeholder={t('library.totalPages')}
                  {...addBookForm.register('totalPages', { valueAsNumber: true })}
                />
              </FieldBlock>
              <FieldError message={addBookForm.formState.errors.totalPages?.message} />
            </div>
            <FieldBlock label={t('library.status')}>
              <Select {...addBookForm.register('status')}>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {t(`status.${s}`)}
                  </option>
                ))}
              </Select>
            </FieldBlock>
            <FieldBlock label={t('library.coverUrlOptional')}>
              <Input placeholder={t('library.coverUrlOptional')} {...addBookForm.register('coverUrl')} />
            </FieldBlock>
            <FieldBlock label={t('library.genreOptional')}>
              <Input placeholder={t('library.genreOptional')} {...addBookForm.register('genre')} />
            </FieldBlock>
            <FieldBlock label={t('library.isbnOptional')}>
              <Input placeholder={t('library.isbnOptional')} {...addBookForm.register('isbn')} />
            </FieldBlock>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={createBookMutation.isPending}>
                {t('library.add')}
              </Button>
            </div>
          </form>
        ) : null}
      </SectionCard>

      <Card className="p-2 sm:p-3">
        <DataToolbar className="xl:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <Input
            placeholder={t('library.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t('library.allStatuses')}</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`)}
              </option>
            ))}
          </Select>
          <Input placeholder={t('library.genre')} value={genre} onChange={(e) => setGenre(e.target.value)} />
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'updated_at' | 'title')}>
            <option value="updated_at">{t('library.sortRecent')}</option>
            <option value="title">{t('library.sortTitle')}</option>
          </Select>
          {search || status || genre ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                setStatus('')
                setGenre('')
              }}
            >
              {t('library.clearFilters')}
            </Button>
          ) : (
            <div className="hidden xl:block" />
          )}
        </DataToolbar>
      </Card>

      <QueryState
        isLoading={booksQuery.isLoading}
        isError={booksQuery.isError}
        isEmpty={!filteredBooks.length}
        loadingVariant="book-grid"
        onRetry={() => void booksQuery.refetch()}
        emptyTitle={t('journey.libraryEmptyTitle')}
        emptyDescription={t('journey.libraryEmptyDescription')}
        emptyAction={<Button onClick={() => setShowAddBookForm(true)}>{t('journey.libraryEmptyAction')}</Button>}
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredBooks.map((book) => {
            const actionList: ItemAction[] = [
              {
                key: 'read',
                label: t('books.startReading'),
                icon: <BookOpen className="h-4 w-4" />,
                onSelect: async () => updateStatusMutation.mutateAsync({ id: book.id, status: 'currentlyReading' }),
                disabled: book.status === 'currentlyReading'
              },
              {
                key: 'next',
                label: t('status.nextToRead'),
                icon: <Forward className="h-4 w-4" />,
                onSelect: async () => updateStatusMutation.mutateAsync({ id: book.id, status: 'nextToRead' }),
                disabled: book.status === 'nextToRead'
              },
              {
                key: 'finished',
                label: t('books.markFinished'),
                icon: <BookCheck className="h-4 w-4" />,
                onSelect: async () => updateStatusMutation.mutateAsync({ id: book.id, status: 'finished' }),
                disabled: book.status === 'finished'
              }
            ]

            return (
              <SwipeableCardShell
                key={book.id}
                startAction={{
                  label: t('books.startReading'),
                  onAction: async () => updateStatusMutation.mutateAsync({ id: book.id, status: 'currentlyReading' }),
                  tone: 'success'
                }}
                endAction={{
                  label: t('books.markFinished'),
                  onAction: async () => updateStatusMutation.mutateAsync({ id: book.id, status: 'finished' }),
                  tone: 'default'
                }}
                hint={t('library.description')}
              >
                <Card
                  className="interactive-card surface-hover p-4 sm:p-5"
                  onContextMenu={(event) => {
                    event.preventDefault()
                    setExpandedQuickId((prev) => (prev === book.id ? null : book.id))
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 gap-3">
                        <BookCover title={book.title} coverUrl={book.coverUrl} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold" title={book.title}>
                            {book.title}
                          </p>
                          <p className="truncate text-small text-mutedForeground" title={book.author}>
                            {book.author}
                          </p>
                          <p className="mt-1 truncate text-xs text-mutedForeground" title={book.genre || t('library.genreFallback')}>
                            {book.genre || t('library.genreFallback')}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 pt-0.5">
                        <StatusBadge status={book.status} />
                      </div>
                    </div>
                    <Progress value={book.progressPercentage} />

                    {expandedQuickId === book.id ? (
                      <div className="rounded-xl border border-dashed border-primary/35 bg-primary/5 p-2">
                        <div className="mb-1.5 flex items-center gap-1 text-xs text-mutedForeground">
                          <List className="h-3.5 w-3.5" /> Quick actions
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {actionList.map((action) => (
                            <Button
                              key={action.key}
                              size="sm"
                              variant="secondary"
                              disabled={action.disabled}
                              onClick={() => void action.onSelect()}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/books/${book.id}`}>
                        <Button size="sm">{t('common.details')}</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={deleteBookMutation.isPending}
                        onClick={() => deleteBookMutation.mutate(book.id)}
                      >
                        {t('books.delete')}
                      </Button>
                      <div className="ms-auto">
                        <ItemActionsMenu actions={actionList} label={`Actions for ${book.title}`} />
                      </div>
                    </div>
                  </div>
                </Card>
              </SwipeableCardShell>
            )
          })}
        </div>
      </QueryState>
    </div>
  )
}
