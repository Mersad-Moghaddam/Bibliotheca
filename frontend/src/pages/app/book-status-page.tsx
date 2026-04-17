import { Link } from 'react-router-dom'

import { Progress } from '../../components/UI'
import { Button } from '../../components/ui/button'
import { SectionCard } from '../../components/ui/card'
import {
  useBooksQuery,
  useUpdateBookProgressMutation,
  useUpdateBookStatusMutation
} from '../../features/books/queries/use-books'
import { QueryState } from '../../shared/components/query-state'
import { useI18n } from '../../shared/i18n/i18n-provider'
import { BookStatus } from '../../types'

import { BookCover, PageHeading } from './shared/page-primitives'

function BookListByStatus({ status, title }: { status: BookStatus; title: string }) {
  const query = useBooksQuery({ status })
  const updateStatus = useUpdateBookStatusMutation()
  const updateProgress = useUpdateBookProgressMutation()
  const { t } = useI18n()

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeading title={title} />
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        isEmpty={!query.data?.length}
        emptyTitle={t('books.emptyTitle')}
        emptyDescription={t('books.emptyDescription')}
      >
        <div className="grid gap-3 md:grid-cols-2">
          {query.data?.map((book) => (
            <SectionCard key={book.id}>
              <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><BookCover title={book.title} coverUrl={book.coverUrl} /><div className="min-w-0"><p className="truncate font-semibold">{book.title}</p><p className="truncate text-small text-mutedForeground">{book.author}</p></div></div><p className="text-sm text-mutedForeground">{book.currentPage}/{book.totalPages}</p></div>
              <Progress value={book.progressPercentage} />
              <div className="flex flex-wrap gap-2">
                {status === 'currentlyReading' ? <Button className="w-full sm:w-auto" onClick={() => updateStatus.mutate({ id: book.id, status: 'finished' })}>{t('books.markFinished')}</Button> : null}
                {status === 'nextToRead' ? <Button className="w-full sm:w-auto" onClick={() => updateStatus.mutate({ id: book.id, status: 'currentlyReading' })}>{t('books.startReading')}</Button> : null}
                {status === 'currentlyReading' ? <Button className="w-full sm:w-auto" variant="secondary" onClick={() => updateProgress.mutate({ id: book.id, currentPage: Math.min(book.currentPage + 10, book.totalPages) })}>{t('books.updateProgress')}</Button> : null}
                <Link className="w-full sm:w-auto" to={`/books/${book.id}`}><Button className="w-full" variant="ghost">{t('common.details')}</Button></Link>
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
  return <BookListByStatus status="currentlyReading" title={t('books.reading')} />
}

export const Finished = () => {
  const { t } = useI18n()
  return <BookListByStatus status="finished" title={t('books.finished')} />
}

export const Next = () => {
  const { t } = useI18n()
  return <BookListByStatus status="nextToRead" title={t('books.nextToRead')} />
}
