import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { Book, BookStatus, WishlistItem } from '../types'
import { Progress, StatusBadge } from '../components/UI'
import { Button } from '../components/ui/button'
import { Card, SectionCard } from '../components/ui/card'
import { DataToolbar } from '../components/ui/data-toolbar'
import { EmptyState } from '../components/ui/empty-state'
import { Input } from '../components/ui/input'
import { PageHeader } from '../components/ui/page-header'
import { Select } from '../components/ui/select'
import { Separator } from '../components/ui/separator'
import { Skeleton } from '../components/ui/skeleton'
import { Textarea } from '../components/ui/textarea'
import { useI18n } from '../shared/i18n/i18n-provider'
import { deleteBook, fetchBooks } from '../features/books/api'

const statusOptions: BookStatus[] = ['inLibrary', 'currentlyReading', 'finished', 'nextToRead']

function asItems<T>(data: T[] | { items: T[] }): T[] {
  return Array.isArray(data) ? data : data.items
}

function isAxiosError(error: unknown): error is { response?: { data?: { error?: string } } } {
  return typeof error === 'object' && error !== null && 'response' in error
}

export function Dashboard() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useI18n()

  useEffect(() => {
    void api
      .get<Book[] | { items: Book[] }>('/books')
      .then((r) => setBooks(asItems(r.data)))
      .finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => {
    const base: Record<BookStatus, number> = { inLibrary: 0, currentlyReading: 0, finished: 0, nextToRead: 0 }
    for (const book of books) base[book.status] += 1
    return base
  }, [books])

  const currentReading = books.filter((book) => book.status === 'currentlyReading').slice(0, 3)
  const needingAction = books.filter((book) => book.status === 'nextToRead' || book.status === 'inLibrary').slice(0, 4)

  return (
    <div className='space-y-6'>
      <PageHeader title={t('dashboard.title')} description={t('dashboard.description')} />

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {statusOptions.map((status) => (
          <Card key={status} className='surface-hover p-5'>
            <p className='text-small text-mutedForeground'>{t(`status.${status}`)}</p>
            <p className='mt-3 text-3xl font-semibold text-foreground'>{loading ? '—' : counts[status]}</p>
          </Card>
        ))}
      </div>

      <SectionCard>
        <h2 className='text-section-title'>{t('dashboard.currentSnapshot')}</h2>
        {loading ? (
          <div className='space-y-3'><Skeleton className='h-14' /><Skeleton className='h-14' /></div>
        ) : currentReading.length ? (
          <div className='space-y-3'>
            {currentReading.map((b) => (
              <div key={b.id} className='rounded-md border border-border p-4'>
                <div className='mb-3 flex items-center justify-between gap-3'>
                  <div><p className='font-medium'>{b.title}</p><p className='text-small text-mutedForeground'>{b.author}</p></div>
                  <p className='text-small text-mutedForeground'>{Math.round(b.progressPercentage)}%</p>
                </div>
                <Progress value={b.progressPercentage} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon='📖' title={t('dashboard.noActiveTitle')} description={t('dashboard.noActiveDescription')} action={<Link to='/library'><Button size='sm'>{t('dashboard.goLibrary')}</Button></Link>} />
        )}
      </SectionCard>

      <SectionCard>
        <h2 className='text-section-title'>{t('dashboard.needsAttention')}</h2>
        {loading ? <Skeleton className='h-28' /> : needingAction.length ? (
          <div className='space-y-3'>
            {needingAction.map((b) => (
              <div key={b.id} className='flex items-center justify-between gap-3 rounded-md border border-border p-4'><p className='font-medium'>{b.title}</p><StatusBadge status={b.status} /></div>
            ))}
          </div>
        ) : <EmptyState icon='✨' title={t('dashboard.tidyTitle')} description={t('dashboard.tidyDescription')} />}
      </SectionCard>
    </div>
  )
}

export function Library() {
  const [books, setBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { t } = useI18n()

  const load = async () => {
    setLoading(true)
    setBooks(await fetchBooks({ search, status }))
    setLoading(false)
  }

  useEffect(() => { void load() }, [status])

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    await api.post('/books', { title: f.get('title'), author: f.get('author'), totalPages: Number(f.get('totalPages')), status: f.get('status') || 'inLibrary' })
    ;(e.target as HTMLFormElement).reset()
    setMessage(t('library.added'))
    void load()
  }

  const remove = async (id: string) => {
    if (!window.confirm(t('library.deleteConfirm'))) return
    try {
      setDeletingId(id)
      await deleteBook(id)
      setBooks((prev) => prev.filter((b) => b.id !== id))
      setMessage(t('library.deleteSuccess'))
    } catch {
      setMessage(t('library.deleteError'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className='space-y-6'>
      <PageHeader title={t('library.title')} description={t('library.description')} />
      <SectionCard>
        <h2 className='text-section-title'>{t('library.addBook')}</h2>
        <form onSubmit={add} className='grid gap-3 md:grid-cols-5'>
          <Input name='title' placeholder={t('library.titlePlaceholder')} required />
          <Input name='author' placeholder={t('library.authorPlaceholder')} required />
          <Input type='number' min={1} name='totalPages' placeholder={t('library.totalPages')} required />
          <Select name='status' defaultValue='inLibrary'>
            {statusOptions.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
          </Select>
          <Button type='submit'>{t('library.add')}</Button>
        </form>
        {message ? <p className='text-small text-success'>{message}</p> : null}
      </SectionCard>

      <DataToolbar>
        <Input placeholder={t('library.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className='md:flex-1' />
        <Button onClick={() => void load()}>{t('common.search')}</Button>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className='md:w-56'>
          <option value=''>{t('library.allStatuses')}</option>
          {statusOptions.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
        </Select>
      </DataToolbar>

      {loading ? <div className='space-y-3'><Skeleton className='h-24' /><Skeleton className='h-24' /></div> : books.length ? (
        <div className='space-y-3'>
          {books.map((b) => (
            <Card key={b.id} className='surface-hover p-5'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div><p className='text-lg font-semibold'>{b.title}</p><p className='text-small text-mutedForeground'>{b.author} • {b.totalPages}</p></div>
                <div className='flex items-center gap-2'>
                  <StatusBadge status={b.status} />
                  <Link to={`/books/${b.id}`}><Button size='sm'>{t('common.details')}</Button></Link>
                  <Button size='sm' variant='secondary' disabled={deletingId === b.id} onClick={() => void remove(b.id)}>{deletingId === b.id ? t('library.deleting') : t('books.delete')}</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon='📚' title={t('library.noBooksTitle')} description={t('library.noBooksDescription')} action={<Button size='sm' onClick={() => { setSearch(''); setStatus(''); void load() }}>{t('library.clearFilters')}</Button>} />
      )}
    </div>
  )
}

function BookListByStatus({ status, title, description }: { status: BookStatus; title: string; description: string }) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useI18n()

  const load = async () => {
    setLoading(true)
    setBooks(await fetchBooks({ status }))
    setLoading(false)
  }

  useEffect(() => { void load() }, [status])

  return (
    <div className='space-y-6'>
      <PageHeader title={title} description={description} />
      {loading ? <div className='space-y-3'><Skeleton className='h-28' /><Skeleton className='h-28' /></div> : books.length ? books.map((b) => (
        <SectionCard key={b.id} className='surface-hover'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div><p className='text-lg font-semibold'>{b.title}</p><p className='text-small text-mutedForeground'>{b.author}</p></div>
            <p className='text-small text-mutedForeground'>{b.currentPage}/{b.totalPages}</p>
          </div>
          <Progress value={b.progressPercentage} />
          {status === 'currentlyReading' ? <form className='grid gap-3 md:grid-cols-[1fr_auto_auto]' onSubmit={async (e) => { e.preventDefault(); const v = Number(new FormData(e.currentTarget).get('currentPage')); await api.patch(`/books/${b.id}/progress`, { currentPage: v }); void load() }}>
            <Input type='number' name='currentPage' min={0} max={b.totalPages} placeholder={t('books.updateProgress')} />
            <Button type='submit'>{t('common.save')}</Button>
            <Button variant='secondary' onClick={async () => { await api.patch(`/books/${b.id}/status`, { status: 'finished' }); void load() }}>{t('books.markFinished')}</Button>
          </form> : null}
          {status === 'nextToRead' ? <Button onClick={async () => { await api.patch(`/books/${b.id}/status`, { status: 'currentlyReading' }); void load() }}>{t('books.startReading')}</Button> : null}
        </SectionCard>
      )) : <EmptyState icon='📘' title={`No books in ${title.toLowerCase()}`} description='Move books from your Library to keep this queue active.' action={<Link to='/library'><Button size='sm'>Open library</Button></Link>} />}
    </div>
  )
}

export function Reading() { const { t } = useI18n(); return <BookListByStatus status='currentlyReading' title={t('books.reading')} description={t('books.readingDesc')} /> }
export function Finished() { const { t } = useI18n(); return <BookListByStatus status='finished' title={t('books.finished')} description={t('books.finishedDesc')} /> }
export function Next() { const { t } = useI18n(); return <BookListByStatus status='nextToRead' title={t('books.nextToRead')} description={t('books.nextToReadDesc')} /> }

export function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { t } = useI18n()

  const load = async () => { setLoading(true); const r = await api.get<WishlistItem[] | { items: WishlistItem[] }>('/wishlist'); setItems(asItems(r.data)); setLoading(false) }
  useEffect(() => { void load() }, [])

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    await api.post('/wishlist', { title: f.get('title'), author: f.get('author'), expectedPrice: f.get('expectedPrice') ? Number(f.get('expectedPrice')) : null, notes: f.get('notes') || null })
    ;(e.target as HTMLFormElement).reset(); setError(''); void load()
  }

  return <div className='space-y-6'>
    <PageHeader title={t('wishlist.title')} description={t('wishlist.description')} />
    <SectionCard><h2 className='text-section-title'>Add wishlist item</h2><form onSubmit={add} className='grid gap-3 md:grid-cols-2'><Input name='title' placeholder='Title' required /><Input name='author' placeholder='Author' required /><Input type='number' step='0.01' name='expectedPrice' placeholder='Expected price' /><Input name='notes' placeholder='Short note' /><Button type='submit' className='md:col-span-2 md:w-fit'>Add to wishlist</Button></form></SectionCard>
    {error ? <p className='text-small text-destructive'>{error}</p> : null}
    {loading ? <div className='grid gap-4 md:grid-cols-2'><Skeleton className='h-56' /><Skeleton className='h-56' /></div> : items.length ? <div className='grid gap-4 md:grid-cols-2'>{items.map((i) => <SectionCard key={i.id} className='surface-hover'><div className='space-y-1'><h3 className='text-section-title'>{i.title}</h3><p className='text-small text-mutedForeground'>{i.author}</p>{i.expectedPrice ? <p className='text-small text-mutedForeground'>Target: ${i.expectedPrice.toFixed(2)}</p> : null}{i.notes ? <p className='text-small text-mutedForeground'>{i.notes}</p> : null}</div><Separator />
    <div className='flex flex-wrap gap-2'>{i.purchaseLinks?.length ? i.purchaseLinks.map((l) => <a key={l.id} className='inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground hover:bg-accent/20' href={l.url} target='_blank' rel='noreferrer'>{l.alias || l.label}</a>) : <p className='text-small text-mutedForeground'>No purchase links yet.</p>}</div>
    <form className='space-y-3' onSubmit={async (e) => { e.preventDefault(); const f = new FormData(e.currentTarget); try { await api.post(`/wishlist/${i.id}/links`, { label: f.get('label') || null, url: f.get('url') }); (e.target as HTMLFormElement).reset(); setError(''); void load() } catch (err) { setError(isAxiosError(err) ? err.response?.data?.error || 'Could not add link.' : 'Could not add link.') } }}><Input name='label' placeholder='Optional store label' /><div className='flex flex-col gap-3 sm:flex-row'><Input name='url' placeholder='https://example.com/book' required className='sm:flex-1' /><Button type='submit'>Add link</Button></div></form></SectionCard>)}</div> : <EmptyState icon='🛍️' title='Wishlist is empty' description='Add books you plan to buy and attach trusted links for quick checkout.' />}
  </div>
}

export function BookDetails({ id }: { id: string }) {
  const [book, setBook] = useState<Book | null>(null)
  const [deleting, setDeleting] = useState(false)
  const nav = useNavigate()
  const { t } = useI18n()

  const load = async () => { const res = await api.get<Book>(`/books/${id}`); setBook(res.data) }
  useEffect(() => { void load() }, [id])

  if (!book) return <Skeleton className='h-64' />

  return (
    <div className='space-y-6'>
      <PageHeader title={book.title} description={book.author} action={<StatusBadge status={book.status} />} />
      <SectionCard>
        <h2 className='text-section-title'>{t('books.readingProgress')}</h2>
        <div className='grid gap-3 text-small text-mutedForeground sm:grid-cols-3'>
          <p>Total pages: {book.totalPages}</p><p>Current page: {book.currentPage}</p><p>Remaining: {book.remainingPages}</p><p>Progress: {Math.round(book.progressPercentage)}%</p>
          <p className='sm:col-span-2'>{t('books.completed')}: {book.completedAt ? new Date(book.completedAt).toLocaleDateString() : t('books.notFinished')}</p>
        </div>
        <Progress value={book.progressPercentage} />
      </SectionCard>

      <SectionCard>
        <h2 className='text-section-title'>{t('books.actions')}</h2>
        <div className='flex flex-wrap gap-2'>
          {statusOptions.map((s) => <Button key={s} variant='secondary' onClick={async () => { await api.patch(`/books/${book.id}/status`, { status: s }); void load() }}>{t('books.moveTo')} {t(`status.${s}`)}</Button>)}
        </div>
        {book.status === 'currentlyReading' ? <form className='grid gap-3 md:grid-cols-[1fr_auto]' onSubmit={async (e) => { e.preventDefault(); const currentPage = Number(new FormData(e.currentTarget).get('currentPage')); await api.patch(`/books/${book.id}/progress`, { currentPage }); void load() }}><Input type='number' min={0} max={book.totalPages} name='currentPage' placeholder={t('books.updateProgress')} /><Button type='submit'>{t('books.updateProgress')}</Button></form> : null}
        <Button variant='secondary' disabled={deleting} onClick={async () => {
          if (!window.confirm(t('library.deleteConfirm'))) return
          try {
            setDeleting(true)
            await deleteBook(book.id)
            nav('/library')
          } finally {
            setDeleting(false)
          }
        }}>{deleting ? t('library.deleting') : t('books.delete')}</Button>
      </SectionCard>
    </div>
  )
}

export function Profile() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const { t } = useI18n()

  return (
    <div className='space-y-6'>
      <PageHeader title={t('profile.title')} description={t('profile.description')} />
      <SectionCard className='max-w-2xl'>
        <h2 className='text-section-title'>Update name</h2>
        <form className='space-y-3' onSubmit={async (e) => { e.preventDefault(); await api.put('/users/profile', { name }); setMessage('Name updated successfully.') }}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder='New name' />
          <Button type='submit'>Update name</Button>
        </form>
      </SectionCard>
      <SectionCard className='max-w-2xl'>
        <h2 className='text-section-title'>Update password</h2>
        <form className='space-y-3' onSubmit={async (e) => { e.preventDefault(); const f = new FormData(e.currentTarget); await api.put('/users/password', { currentPassword: f.get('currentPassword'), newPassword: f.get('newPassword') }); (e.target as HTMLFormElement).reset(); setMessage('Password updated successfully.') }}>
          <Input type='password' name='currentPassword' placeholder='Current password' required />
          <Input type='password' name='newPassword' placeholder='New password' minLength={6} required />
          <Button type='submit'>Update password</Button>
        </form>
      </SectionCard>
      {message ? <Card className='max-w-2xl text-small text-success'>{message}</Card> : null}
      <SectionCard className='max-w-2xl'><h2 className='text-section-title'>Notes</h2><Textarea placeholder='Optional personal reading notes...' /></SectionCard>
    </div>
  )
}
