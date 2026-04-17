import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Progress } from '../../components/UI'
import { Button } from '../../components/ui/button'
import { SectionCard } from '../../components/ui/card'
import { Textarea } from '../../components/ui/textarea'
import {
  useBooksQuery,
  useUpdateBookProgressMutation,
  useUpdateBookStatusMutation
} from '../../features/books/queries/use-books'
import { QueryState } from '../../shared/components/query-state'
import { useI18n } from '../../shared/i18n/i18n-provider'
import { BookStatus } from '../../types'

import { BookCover, PageHeading } from './shared/page-primitives'

type FinishDraft = {
  rating?: number
  reflection: string
  highlight: string
}

function BookListByStatus({ status, title }: { status: BookStatus; title: string }) {
  const query = useBooksQuery({ status })
  const updateStatus = useUpdateBookStatusMutation()
  const updateProgress = useUpdateBookProgressMutation()
  const [activeFinishId, setActiveFinishId] = useState<string | null>(null)
  const [finishDrafts, setFinishDrafts] = useState<Record<string, FinishDraft>>({})
  const { t, locale } = useI18n()
  const numberFormatter = new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US')
  const isSubmittingFinish = (id: string) => updateStatus.isPending && updateStatus.variables?.id === id

  const getDraft = (id: string): FinishDraft => finishDrafts[id] ?? { reflection: '', highlight: '' }

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
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <BookCover title={book.title} coverUrl={book.coverUrl} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{book.title}</p>
                    <p className="truncate text-small text-mutedForeground">{book.author}</p>
                  </div>
                </div>
                <p className="text-sm text-mutedForeground">
                  {numberFormatter.format(book.currentPage)}/
                  {numberFormatter.format(book.totalPages)}
                </p>
              </div>
              <Progress value={book.progressPercentage} />
              <div className="flex flex-wrap gap-2">
                {status === 'currentlyReading' ? (
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setActiveFinishId((current) => (current === book.id ? null : book.id))
                    }}
                  >
                    {t('books.markFinished')}
                  </Button>
                ) : null}
                {status === 'nextToRead' ? (
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => updateStatus.mutate({ id: book.id, status: 'currentlyReading' })}
                  >
                    {t('books.startReading')}
                  </Button>
                ) : null}
                {status === 'currentlyReading' ? (
                  <Button
                    className="w-full sm:w-auto"
                    variant="secondary"
                    onClick={() =>
                      updateProgress.mutate({
                        id: book.id,
                        currentPage: Math.min(book.currentPage + 10, book.totalPages)
                      })
                    }
                  >
                    {t('books.updateProgress')}
                  </Button>
                ) : null}
                <Link className="w-full sm:w-auto" to={`/books/${book.id}`}>
                  <Button className="w-full" variant="ghost">
                    {t('common.details')}
                  </Button>
                </Link>
              </div>
              {status === 'currentlyReading' && activeFinishId === book.id ? (
                <div className="space-y-3 rounded-xl border border-border bg-surface p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t('books.finishFlowTitle')}</p>
                    <p className="text-xs text-mutedForeground">{t('books.finishFlowDescription')}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-mutedForeground">{t('books.finishRatingLabel')}</p>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => {
                        const selected = getDraft(book.id).rating === rating
                        return (
                          <Button
                            key={rating}
                            size="sm"
                            type="button"
                            variant={selected ? 'primary' : 'secondary'}
                            className="min-w-10"
                            onClick={() =>
                              setFinishDrafts((current) => ({
                                ...current,
                                [book.id]: { ...getDraft(book.id), rating }
                              }))
                            }
                          >
                            {numberFormatter.format(rating)}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                  <label className="block space-y-1">
                    <span className="text-xs text-mutedForeground">{t('books.finishReflectionLabel')}</span>
                    <Textarea
                      rows={2}
                      maxLength={1000}
                      placeholder={t('books.finishReflectionPlaceholder')}
                      value={getDraft(book.id).reflection}
                      onChange={(event) =>
                        setFinishDrafts((current) => ({
                          ...current,
                          [book.id]: { ...getDraft(book.id), reflection: event.target.value }
                        }))
                      }
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs text-mutedForeground">{t('books.finishHighlightLabel')}</span>
                    <Textarea
                      rows={2}
                      maxLength={600}
                      placeholder={t('books.finishHighlightPlaceholder')}
                      value={getDraft(book.id).highlight}
                      onChange={(event) =>
                        setFinishDrafts((current) => ({
                          ...current,
                          [book.id]: { ...getDraft(book.id), highlight: event.target.value }
                        }))
                      }
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={isSubmittingFinish(book.id)}
                      onClick={() =>
                        updateStatus
                          .mutateAsync({
                            id: book.id,
                            status: 'finished',
                            finishRating: getDraft(book.id).rating,
                            finishReflection: getDraft(book.id).reflection.trim() || undefined,
                            finishHighlight: getDraft(book.id).highlight.trim() || undefined
                          })
                          .then(() => {
                            setActiveFinishId(null)
                          })
                      }
                    >
                      {t('books.finishNowAction')}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={isSubmittingFinish(book.id)}
                      onClick={() =>
                        updateStatus
                          .mutateAsync({ id: book.id, status: 'finished' })
                          .then(() => setActiveFinishId(null))
                      }
                    >
                      {t('books.finishQuickAction')}
                    </Button>
                  </div>
                </div>
              ) : null}
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
