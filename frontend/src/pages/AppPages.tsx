import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { Book, BookStatus, WishlistItem } from '../types'
import { Progress, StatusBadge, statusLabel } from '../components/UI'
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
      <PageHeader title='Dashboard' description='Track momentum across your reading workflow and quickly resume what matters.' />

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {statusOptions.map((status) => (
          <Card key={status} className='surface-hover p-5'>
            <p className='text-small text-mutedForeground'>{statusLabel[status]}</p>
            <p className='mt-3 text-3xl font-semibold text-foreground'>{loading ? '—' : counts[status]}</p>
          </Card>
        ))}
      </div>

      <SectionCard>
        <h2 className='text-section-title'>Current reading snapshot</h2>
        {loading ? (
          <div className='space-y-3'>
            <Skeleton className='h-14' />
            <Skeleton className='h-14' />
          </div>
        ) : currentReading.length ? (
          <div className='space-y-3'>
            {currentReading.map((b) => (
              <div key={b.id} className='rounded-md border border-border p-4'>
                <div className='mb-3 flex items-center justify-between gap-3'>
                  <div>
                    <p className='font-medium'>{b.title}</p>
                    <p className='text-small text-mutedForeground'>{b.author}</p>
                  </div>
                  <p className='text-small text-mutedForeground'>{Math.round(b.progressPercentage)}%</p>
                </div>
                <Progress value={b.progressPercentage} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon='📖'
            title='No active books yet'
            description='Move a title to Currently Reading to start seeing your progress here.'
            action={<Link to='/library'><Button size='sm'>Go to library</Button></Link>}
          />
        )}
      </SectionCard>

      <SectionCard>
        <h2 className='text-section-title'>Needs attention</h2>
        {loading ? (
          <Skeleton className='h-28' />
        ) : needingAction.length ? (
          <div className='space-y-3'>
            {needingAction.map((b) => (
              <div key={b.id} className='flex items-center justify-between gap-3 rounded-md border border-border p-4'>
                <p className='font-medium'>{b.title}</p>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon='✨' title='Everything is tidy' description='No pending books right now—great reading flow.' />
        )}
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

  const load = async () => {
    setLoading(true)
    const r = await api.get<Book[] | { items: Book[] }>('/books', { params: { search, status } })
    setBooks(asItems(r.data))
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [status])

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    await api.post('/books', {
      title: f.get('title'),
      author: f.get('author'),
      totalPages: Number(f.get('totalPages')),
      status: f.get('status') || 'inLibrary'
    })
    ;(e.target as HTMLFormElement).reset()
    setMessage('Book added to your library.')
    void load()
  }

  return (
    <div className='space-y-6'>
      <PageHeader title='Library' description='Keep every title organized and route books into your reading pipeline.' />

      <SectionCard>
        <h2 className='text-section-title'>Add a new book</h2>
        <form onSubmit={add} className='grid gap-3 md:grid-cols-5'>
          <Input name='title' placeholder='Title' required />
          <Input name='author' placeholder='Author' required />
          <Input type='number' min={1} name='totalPages' placeholder='Total pages' required />
          <Select name='status' defaultValue='inLibrary'>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{statusLabel[s]}</option>
            ))}
          </Select>
          <Button type='submit'>Add book</Button>
        </form>
        {message ? <p className='text-small text-success'>{message}</p> : null}
      </SectionCard>

      <DataToolbar>
        <Input placeholder='Search title or author' value={search} onChange={(e) => setSearch(e.target.value)} className='md:flex-1' />
        <Button onClick={() => void load()}>Search</Button>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className='md:w-56'>
          <option value=''>All statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{statusLabel[s]}</option>
          ))}
        </Select>
      </DataToolbar>

      {loading ? (
        <div className='space-y-3'>
          <Skeleton className='h-24' />
          <Skeleton className='h-24' />
        </div>
      ) : books.length ? (
        <div className='space-y-3'>
          {books.map((b) => (
            <Card key={b.id} className='surface-hover p-5'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <p className='text-lg font-semibold'>{b.title}</p>
                  <p className='text-small text-mutedForeground'>{b.author} • {b.totalPages} pages</p>
                </div>
                <div className='flex items-center gap-3'>
                  <StatusBadge status={b.status} />
                  <Link to={`/books/${b.id}`}>
                    <Button size='sm'>Details</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon='📚'
          title='No books found'
          description='Start by adding your first book above, or adjust your search filters.'
          action={<Button size='sm' onClick={() => { setSearch(''); setStatus(''); void load() }}>Clear filters</Button>}
        />
      )}
    </div>
  )
}

function BookListByStatus({ status, title, description }: { status: BookStatus; title: string; description: string }) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const r = await api.get<Book[] | { items: Book[] }>('/books', { params: { status } })
    setBooks(asItems(r.data))
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [status])

  return (
    <div className='space-y-6'>
      <PageHeader title={title} description={description} />
      {loading ? (
        <div className='space-y-3'>
          <Skeleton className='h-28' />
          <Skeleton className='h-28' />
        </div>
      ) : books.length ? (
        books.map((b) => (
          <SectionCard key={b.id} className='surface-hover'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div>
                <p className='text-lg font-semibold'>{b.title}</p>
                <p className='text-small text-mutedForeground'>{b.author}</p>
              </div>
              <p className='text-small text-mutedForeground'>
                {b.currentPage}/{b.totalPages} pages
              </p>
            </div>
            <Progress value={b.progressPercentage} />
            {status === 'currentlyReading' ? (
              <form
                className='grid gap-3 md:grid-cols-[1fr_auto_auto]'
                onSubmit={async (e) => {
                  e.preventDefault()
                  const v = Number(new FormData(e.currentTarget).get('currentPage'))
                  await api.patch(`/books/${b.id}/progress`, { currentPage: v })
                  void load()
                }}
              >
                <Input type='number' name='currentPage' min={0} max={b.totalPages} placeholder='Update current page' />
                <Button type='submit'>Save progress</Button>
                <Button variant='secondary' onClick={async () => { await api.patch(`/books/${b.id}/status`, { status: 'finished' }); void load() }}>
                  Mark finished
                </Button>
              </form>
            ) : null}
            {status === 'nextToRead' ? (
              <Button onClick={async () => { await api.patch(`/books/${b.id}/status`, { status: 'currentlyReading' }); void load() }}>
                Start reading
              </Button>
            ) : null}
          </SectionCard>
        ))
      ) : (
        <EmptyState
          icon={status === 'finished' ? '🏁' : status === 'nextToRead' ? '🗂️' : '📘'}
          title={`No books in ${title.toLowerCase()}`}
          description='Move books from your Library to keep this queue active.'
          action={<Link to='/library'><Button size='sm'>Open library</Button></Link>}
        />
      )}
    </div>
  )
}

export const Reading = () => <BookListByStatus status='currentlyReading' title='Currently Reading' description='Track active books and update progress with minimal friction.' />
export const Finished = () => <BookListByStatus status='finished' title='Finished' description='Review books you completed and celebrate steady progress.' />
export const Next = () => <BookListByStatus status='nextToRead' title='Next To Read' description='Curate your upcoming queue and start your next title quickly.' />

export function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const r = await api.get<WishlistItem[] | { items: WishlistItem[] }>('/wishlist')
    setItems(asItems(r.data))
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    await api.post('/wishlist', {
      title: f.get('title'),
      author: f.get('author'),
      expectedPrice: f.get('expectedPrice') ? Number(f.get('expectedPrice')) : null,
      notes: f.get('notes') || null
    })
    ;(e.target as HTMLFormElement).reset()
    setError('')
    void load()
  }

  return (
    <div className='space-y-6'>
      <PageHeader title='Wishlist' description='Collect future purchases and keep reliable links in one organized place.' />
      <SectionCard>
        <h2 className='text-section-title'>Add wishlist item</h2>
        <form onSubmit={add} className='grid gap-3 md:grid-cols-2'>
          <Input name='title' placeholder='Title' required />
          <Input name='author' placeholder='Author' required />
          <Input type='number' step='0.01' name='expectedPrice' placeholder='Expected price' />
          <Input name='notes' placeholder='Short note' />
          <Button type='submit' className='md:col-span-2 md:w-fit'>Add to wishlist</Button>
        </form>
      </SectionCard>
      {error ? <p className='text-small text-destructive'>{error}</p> : null}
      {loading ? (
        <div className='grid gap-4 md:grid-cols-2'>
          <Skeleton className='h-56' />
          <Skeleton className='h-56' />
        </div>
      ) : items.length ? (
        <div className='grid gap-4 md:grid-cols-2'>
          {items.map((i) => (
            <SectionCard key={i.id} className='surface-hover'>
              <div className='space-y-1'>
                <h3 className='text-section-title'>{i.title}</h3>
                <p className='text-small text-mutedForeground'>{i.author}</p>
                {i.expectedPrice ? <p className='text-small text-mutedForeground'>Target: ${i.expectedPrice.toFixed(2)}</p> : null}
                {i.notes ? <p className='text-small text-mutedForeground'>{i.notes}</p> : null}
              </div>
              <Separator />
              <div className='flex flex-wrap gap-2'>
                {i.purchaseLinks?.length ? i.purchaseLinks.map((l) => (
                  <a key={l.id} className='inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground hover:bg-accent/20' href={l.url} target='_blank' rel='noreferrer'>
                    {l.alias || l.label}
                  </a>
                )) : <p className='text-small text-mutedForeground'>No purchase links yet.</p>}
              </div>
              <form
                className='space-y-3'
                onSubmit={async (e) => {
                  e.preventDefault()
                  const f = new FormData(e.currentTarget)
                  try {
                    await api.post(`/wishlist/${i.id}/links`, { label: f.get('label') || null, url: f.get('url') })
                    ;(e.target as HTMLFormElement).reset()
                    setError('')
                    void load()
                  } catch (err) {
                    setError(isAxiosError(err) ? err.response?.data?.error || 'Could not add link.' : 'Could not add link.')
                  }
                }}
              >
                <Input name='label' placeholder='Optional store label' />
                <div className='flex flex-col gap-3 sm:flex-row'>
                  <Input name='url' placeholder='https://example.com/book' required className='sm:flex-1' />
                  <Button type='submit'>Add link</Button>
                </div>
              </form>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState icon='🛍️' title='Wishlist is empty' description='Add books you plan to buy and attach trusted links for quick checkout.' />
      )}
    </div>
  )
}

export function BookDetails({ id }: { id: string }) {
  const [book, setBook] = useState<Book | null>(null)

  const load = async () => {
    const res = await api.get<Book>(`/books/${id}`)
    setBook(res.data)
  }

  useEffect(() => {
    void load()
  }, [id])

  if (!book) {
    return <Skeleton className='h-64' />
  }

  return (
    <div className='space-y-6'>
      <PageHeader title={book.title} description={book.author} action={<StatusBadge status={book.status} />} />
      <SectionCard>
        <h2 className='text-section-title'>Reading progress</h2>
        <div className='grid gap-3 text-small text-mutedForeground sm:grid-cols-3'>
          <p>Total pages: {book.totalPages}</p>
          <p>Current page: {book.currentPage}</p>
          <p>Remaining: {book.remainingPages}</p>
          <p>Progress: {Math.round(book.progressPercentage)}%</p>
          <p className='sm:col-span-2'>Completed: {book.completedAt ? new Date(book.completedAt).toLocaleDateString() : 'Not finished yet'}</p>
        </div>
        <Progress value={book.progressPercentage} />
      </SectionCard>

      <SectionCard>
        <h2 className='text-section-title'>Book actions</h2>
        <div className='flex flex-wrap gap-2'>
          {statusOptions.map((s) => (
            <Button key={s} variant='secondary' onClick={async () => { await api.patch(`/books/${book.id}/status`, { status: s }); void load() }}>
              Move to {statusLabel[s]}
            </Button>
          ))}
        </div>
        {book.status === 'currentlyReading' ? (
          <form
            className='grid gap-3 md:grid-cols-[1fr_auto]'
            onSubmit={async (e) => {
              e.preventDefault()
              const currentPage = Number(new FormData(e.currentTarget).get('currentPage'))
              await api.patch(`/books/${book.id}/progress`, { currentPage })
              void load()
            }}
          >
            <Input type='number' min={0} max={book.totalPages} name='currentPage' placeholder='Update current page' />
            <Button type='submit'>Update progress</Button>
          </form>
        ) : null}
      </SectionCard>
    </div>
  )
}

export function Profile() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  return (
    <div className='space-y-6'>
      <PageHeader title='Profile' description='Manage account details and security settings.' />
      <SectionCard className='max-w-2xl'>
        <h2 className='text-section-title'>Update name</h2>
        <form
          className='space-y-3'
          onSubmit={async (e) => {
            e.preventDefault()
            await api.put('/users/profile', { name })
            setMessage('Name updated successfully.')
          }}
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder='New name' />
          <Button type='submit'>Update name</Button>
        </form>
      </SectionCard>
      <SectionCard className='max-w-2xl'>
        <h2 className='text-section-title'>Update password</h2>
        <form
          className='space-y-3'
          onSubmit={async (e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            await api.put('/users/password', {
              currentPassword: f.get('currentPassword'),
              newPassword: f.get('newPassword')
            })
            ;(e.target as HTMLFormElement).reset()
            setMessage('Password updated successfully.')
          }}
        >
          <Input type='password' name='currentPassword' placeholder='Current password' required />
          <Input type='password' name='newPassword' placeholder='New password' minLength={6} required />
          <Button type='submit'>Update password</Button>
        </form>
      </SectionCard>
      {message ? <Card className='max-w-2xl text-small text-success'>{message}</Card> : null}
      <SectionCard className='max-w-2xl'>
        <h2 className='text-section-title'>Notes</h2>
        <Textarea placeholder='Optional personal reading notes...' />
      </SectionCard>
    </div>
  )
}
