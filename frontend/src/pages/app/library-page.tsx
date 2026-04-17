import { zodResolver } from '@hookform/resolvers/zod'
import { BookPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { Progress, StatusBadge } from '../../components/UI'
import { Button } from '../../components/ui/button'
import { Card, SectionCard } from '../../components/ui/card'
import { DataToolbar } from '../../components/ui/data-toolbar'
import { Input } from '../../components/ui/input'
import { SectionHeader } from '../../components/ui/section-header'
import { Select } from '../../components/ui/select'
import { addBookSchema, AddBookValues } from '../../features/books/forms/book-schemas'
import { useBooksQuery, useCreateBookMutation, useDeleteBookMutation } from '../../features/books/queries/use-books'
import { QueryState } from '../../shared/components/query-state'
import { useI18n } from '../../shared/i18n/i18n-provider'
import { useToast } from '../../shared/toast/toast-provider'

import { BookCover, FieldBlock, FieldError, PageHeading, statusOptions } from './shared/page-primitives'

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
    <div className="space-y-4 sm:space-y-5">
      <PageHeading title={t('library.title')} />
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
            <div><FieldBlock label={t('library.titlePlaceholder')}><Input placeholder={t('library.titlePlaceholder')} {...addBookForm.register('title')} /></FieldBlock><FieldError message={addBookForm.formState.errors.title?.message} /></div>
            <div><FieldBlock label={t('library.authorPlaceholder')}><Input placeholder={t('library.authorPlaceholder')} {...addBookForm.register('author')} /></FieldBlock><FieldError message={addBookForm.formState.errors.author?.message} /></div>
            <div><FieldBlock label={t('library.totalPages')}><Input type="number" min={1} placeholder={t('library.totalPages')} {...addBookForm.register('totalPages', { valueAsNumber: true })} /></FieldBlock><FieldError message={addBookForm.formState.errors.totalPages?.message} /></div>
            <FieldBlock label={t('library.status')}><Select {...addBookForm.register('status')}>{statusOptions.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}</Select></FieldBlock>
            <FieldBlock label={t('library.coverUrlOptional')}><Input placeholder={t('library.coverUrlOptional')} {...addBookForm.register('coverUrl')} /></FieldBlock>
            <FieldBlock label={t('library.genreOptional')}><Input placeholder={t('library.genreOptional')} {...addBookForm.register('genre')} /></FieldBlock>
            <FieldBlock label={t('library.isbnOptional')}><Input placeholder={t('library.isbnOptional')} {...addBookForm.register('isbn')} /></FieldBlock>
            <div className="flex items-end"><Button type="submit" className="w-full" disabled={createBookMutation.isPending}>{t('library.add')}</Button></div>
          </form>
        ) : null}
      </SectionCard>

      <Card className="p-2 sm:p-3">
        <DataToolbar className="xl:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <Input placeholder={t('library.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">{t('library.allStatuses')}</option>{statusOptions.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}</Select>
          <Input placeholder={t('library.genre')} value={genre} onChange={(e) => setGenre(e.target.value)} />
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'updated_at' | 'title')}><option value="updated_at">{t('library.sortRecent')}</option><option value="title">{t('library.sortTitle')}</option></Select>
          {(search || status || genre) ? <Button variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => { setSearch(''); setStatus(''); setGenre('') }}>{t('library.clearFilters')}</Button> : <div className="hidden xl:block" />}
        </DataToolbar>
      </Card>

      <QueryState
        isLoading={booksQuery.isLoading}
        isError={booksQuery.isError}
        isEmpty={!booksQuery.data?.length}
        emptyTitle={t('library.noBooksTitle')}
        emptyDescription={t('library.noBooksDescription')}
        onRetry={() => void booksQuery.refetch()}
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {booksQuery.data?.map((book) => (
            <Card key={book.id} className="surface-hover p-4 sm:p-5">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <BookCover title={book.title} coverUrl={book.coverUrl} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold" title={book.title}>{book.title}</p>
                      <p className="truncate text-small text-mutedForeground" title={book.author}>{book.author}</p>
                      <p className="mt-1 truncate text-xs text-mutedForeground" title={book.genre || t('library.genreFallback')}>{book.genre || t('library.genreFallback')}</p>
                    </div>
                  </div>
                  <div className="shrink-0 pt-0.5"><StatusBadge status={book.status} /></div>
                </div>
                <Progress value={book.progressPercentage} />
                <div className="flex flex-wrap gap-2"><Link to={`/books/${book.id}`}><Button size="sm">{t('common.details')}</Button></Link><Button size="sm" variant="secondary" disabled={deleteBookMutation.isPending} onClick={() => deleteBookMutation.mutate(book.id)}>{t('books.delete')}</Button></div>
              </div>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  )
}
