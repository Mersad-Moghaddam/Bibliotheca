import { zodResolver } from '@hookform/resolvers/zod'
import { NotebookPen } from 'lucide-react'
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

  const handleMoveStatus = async (status: BookStatus) => {
    setRecentlyClickedStatus(status)
    window.setTimeout(() => {
      setRecentlyClickedStatus((current) => (current === status ? null : current))
    }, 500)
    await updateStatus.mutateAsync({ id: book.id, status })
  }
  const numberFormatter = new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US')

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        title={book.title}
        description={book.author}
        action={<StatusBadge status={book.status} />}
        eyebrow={t('books.readingProgress')}
      />
      <SectionCard className="overflow-hidden">
        <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <BookCover title={book.title} coverUrl={book.coverUrl} />
          <div className="min-w-0 space-y-2">
            <p>
              {t('books.readingProgress')}:{' '}
              {numberFormatter.format(Math.round(book.progressPercentage))}%
            </p>
            <Progress value={book.progressPercentage} />
            <div className="flex flex-wrap gap-2 text-xs text-mutedForeground">
              <span className="rounded-full border border-border bg-surface px-2 py-1">
                {book.genre || t('library.genreFallback')}
              </span>
              <span className="rounded-full border border-border bg-surface px-2 py-1">
                {t('books.isbnLabel')}: {book.isbn || '—'}
              </span>
            </div>
          </div>
        </div>
      </SectionCard>
      <SectionCard>
        <SectionHeader
          title={t('books.editDetailsTitle')}
          description={t('books.editDetailsDescription')}
        />
        <form
          className="grid gap-3 md:grid-cols-2"
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
              disabled={updateBook.isPending || updateProgress.isPending || updateStatus.isPending}
            >
              {updateBook.isPending || updateProgress.isPending || updateStatus.isPending
                ? `${t('common.save')}...`
                : t('common.save')}
            </Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard>
        <SectionHeader title={t('books.notesTitle')} icon={<NotebookPen className="h-4 w-4" />} />
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
        <SectionHeader title={t('books.actions')} description={t('books.actionsDescription')} />
        <div className="flex flex-wrap gap-2">
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
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
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
      </SectionCard>
    </div>
  )
}
