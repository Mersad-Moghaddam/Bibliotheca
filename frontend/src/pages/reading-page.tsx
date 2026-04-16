import { Link } from 'react-router-dom'

import { Progress } from '../components/UI'
import { Button } from '../components/ui/button'
import { SectionCard } from '../components/ui/card'
import { EmptyState } from '../components/ui/empty-state'
import { useBooksQuery, useUpdateBookProgressMutation, useUpdateBookStatusMutation } from '../features/books/queries/use-books'
import { useI18n } from '../shared/i18n/i18n-provider'
import { BookStatus } from '../types'

import { BookCover, PageHeading } from './modules/page-primitives'

function BookListByStatus({ status, title, emptyTitle, emptyDescription, emptyActionPath, emptyActionLabel }: { status: BookStatus; title: string; emptyTitle: string; emptyDescription: string; emptyActionPath: string; emptyActionLabel: string }) {
  const query = useBooksQuery({ status })
  const updateStatus = useUpdateBookStatusMutation()
  const updateProgress = useUpdateBookProgressMutation()
  const { t } = useI18n()

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeading title={title} />
      {!query.isLoading && !query.isError && !query.data?.length ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={<Link to={emptyActionPath}><Button>{emptyActionLabel}</Button></Link>}
        />
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {query.data?.map((book) => (
          <SectionCard key={book.id}>
            <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><BookCover title={book.title} coverUrl={book.coverUrl} /><div className="min-w-0"><p className="truncate font-semibold">{book.title}</p><p className="truncate text-small text-mutedForeground">{book.author}</p></div></div><p className="text-sm text-mutedForeground">{book.currentPage}/{book.totalPages}</p></div>
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
    </div>
  )
}

export function ReadingPage() {
  const { t } = useI18n()
  return <BookListByStatus status="currentlyReading" title={t('books.reading')} emptyTitle={t('journey.readingEmptyTitle')} emptyDescription={t('journey.readingEmptyDescription')} emptyActionPath="/next" emptyActionLabel={t('journey.readingEmptyAction')} />
}

export function FinishedPage() {
  const { t } = useI18n()
  return <BookListByStatus status="finished" title={t('books.finished')} emptyTitle={t('journey.finishedEmptyTitle')} emptyDescription={t('journey.finishedEmptyDescription')} emptyActionPath="/reading" emptyActionLabel={t('journey.finishedEmptyAction')} />
}

export function NextPage() {
  const { t } = useI18n()
  return <BookListByStatus status="nextToRead" title={t('books.nextToRead')} emptyTitle={t('journey.nextEmptyTitle')} emptyDescription={t('journey.nextEmptyDescription')} emptyActionPath="/library" emptyActionLabel={t('journey.nextEmptyAction')} />
}
