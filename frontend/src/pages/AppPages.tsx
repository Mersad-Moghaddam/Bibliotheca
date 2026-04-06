import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { Book, BookStatus, ListResponse, WishlistItem } from '../types'
import { Progress, Section, StatusBadge, statusLabel } from '../components/UI'
import emptyLibrary from '../assets/empty-library.svg'

const statusOptions: BookStatus[] = ['inLibrary', 'currentlyReading', 'finished', 'nextToRead']

function isAxiosError(error: unknown): error is { response?: { data?: { error?: string } } } {
  return typeof error === 'object' && error !== null && 'response' in error
}

export function Dashboard() {
  const [books, setBooks] = useState<Book[]>([])

  useEffect(() => {
    void api.get<ListResponse<Book>>('/books', { params: { limit: 200, page: 1 } }).then((r) => setBooks(r.data.items))
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
      <header className='card'>
        <p className='mb-2 text-xs uppercase tracking-[0.2em] text-secondary'>Welcome back</p>
        <h1 className='page-title'>Your Personal Library</h1>
        <p className='mt-2 max-w-2xl text-sm text-secondary'>
          Track every title, keep your reading rhythm, and move books through your shelf with clarity.
        </p>
      </header>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {statusOptions.map((status) => (
          <div key={status} className='card'>
            <p className='text-sm text-secondary'>{statusLabel[status]}</p>
            <p className='mt-3 text-4xl text-primary'>{counts[status]}</p>
          </div>
        ))}
      </div>

      <Section title='Current Reading Snapshot'>
        <div className='space-y-3'>
          {currentReading.length ? (
            currentReading.map((b) => (
              <div key={b.id} className='table-row rounded-xl'>
                <div className='grow'>
                  <p className='font-semibold text-primary'>{b.title}</p>
                  <p className='text-sm text-secondary'>{b.author}</p>
                </div>
                <div className='w-44'>
                  <p className='mb-1 text-right text-xs text-secondary'>{Math.round(b.progressPercentage)}%</p>
                  <Progress value={b.progressPercentage} />
                </div>
              </div>
            ))
          ) : (
            <p className='text-secondary'>No active reading session yet.</p>
          )}
        </div>
      </Section>

      <Section title='Books Needing Action'>
        <div className='space-y-2'>
          {needingAction.length ? (
            needingAction.map((b) => (
              <div key={b.id} className='table-row rounded-xl'>
                <p className='grow font-medium text-primary'>{b.title}</p>
                <StatusBadge status={b.status} />
              </div>
            ))
          ) : (
            <p className='text-secondary'>Everything is up to date.</p>
          )}
        </div>
      </Section>
    </div>
  )
}

export function Library() {
  const [books, setBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [message, setMessage] = useState('')

  const load = async () => {
    const r = await api.get<ListResponse<Book>>('/books', { params: { search, status, limit: 200, page: 1 } })
    setBooks(r.data.items)
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
      <h1 className='page-title'>Library</h1>

      <form onSubmit={add} className='card grid gap-3 md:grid-cols-5'>
        <input className='input' name='title' placeholder='Title' required />
        <input className='input' name='author' placeholder='Author' required />
        <input className='input' type='number' min={1} name='totalPages' placeholder='Total pages' required />
        <select className='input' name='status' defaultValue='inLibrary'>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{statusLabel[s]}</option>
          ))}
        </select>
        <button type='submit' className='btn'>Add Book</button>
      </form>

      {message && <p className='text-sm text-secondary'>{message}</p>}

      <div className='card flex flex-col gap-3 md:flex-row'>
        <input className='input' placeholder='Search title or author' value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type='button' className='btn md:w-32' onClick={() => void load()}>Search</button>
        <select className='input md:w-56' value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value=''>All statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{statusLabel[s]}</option>
          ))}
        </select>
      </div>

      {books.length ? (
        <div className='table-shell'>
          {books.map((b) => (
            <div key={b.id} className='table-row'>
              <div className='grow'>
                <p className='font-semibold text-primary'>{b.title}</p>
                <p className='text-sm text-secondary'>{b.author} · {b.totalPages} pages</p>
              </div>
              <StatusBadge status={b.status} />
              <Link className='btn py-2' to={`/books/${b.id}`}>Details</Link>
            </div>
          ))}
        </div>
      ) : (
        <div className='card text-center'>
          <img src={emptyLibrary} alt='Empty shelf' className='mx-auto mb-3 h-32 w-auto opacity-85' />
          <p className='text-secondary'>No books found. Add your first title above.</p>
        </div>
      )}
    </div>
  )
}

function BookListByStatus({ status, title }: { status: BookStatus; title: string }) {
  const [books, setBooks] = useState<Book[]>([])
  const load = async () => {
    const r = await api.get<ListResponse<Book>>('/books', { params: { status, limit: 200, page: 1 } })
    setBooks(r.data.items)
  }

  useEffect(() => {
    void load()
  }, [status])

  return (
    <div className='space-y-4'>
      <h1 className='page-title'>{title}</h1>
      {books.length ? (
        books.map((b) => (
          <div key={b.id} className='card space-y-4'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-xl font-semibold text-primary'>{b.title}</p>
                <p className='text-sm text-secondary'>{b.author}</p>
              </div>
              <p className='text-sm text-secondary'>{b.currentPage}/{b.totalPages}</p>
            </div>
            <Progress value={b.progressPercentage} />
            {status === 'currentlyReading' && (
              <form
                className='grid gap-2 md:grid-cols-[1fr_auto_auto]'
                onSubmit={async (e) => {
                  e.preventDefault()
                  const v = Number(new FormData(e.currentTarget).get('currentPage'))
                  await api.patch(`/books/${b.id}/bookmark`, { currentPage: v })
                  void load()
                }}
              >
                <input className='input' type='number' name='currentPage' min={0} max={b.totalPages} placeholder='Update page' />
                <button type='submit' className='btn'>Save Progress</button>
                <button type='button' className='btn-secondary' onClick={async () => { await api.patch(`/books/${b.id}/status`, { status: 'finished' }); void load() }}>
                  Mark Finished
                </button>
              </form>
            )}
            {status === 'nextToRead' && (
              <button type='button' className='btn' onClick={async () => { await api.patch(`/books/${b.id}/status`, { status: 'currentlyReading' }); void load() }}>
                Start Reading
              </button>
            )}
          </div>
        ))
      ) : (
        <div className='card text-center text-secondary'>No books in this section yet.</div>
      )}
    </div>
  )
}

export const Reading = () => <BookListByStatus status='currentlyReading' title='Currently Reading' />
export const Finished = () => <BookListByStatus status='finished' title='Finished' />
export const Next = () => <BookListByStatus status='nextToRead' title='Next To Read' />

export function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [error, setError] = useState('')

  const load = async () => {
    const r = await api.get<ListResponse<WishlistItem>>('/wishlist', { params: { limit: 200, page: 1 } })
    setItems(r.data.items)
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
      <h1 className='page-title'>Wishlist</h1>
      <form onSubmit={add} className='card grid gap-3 md:grid-cols-5'>
        <input className='input' name='title' placeholder='Title' required />
        <input className='input' name='author' placeholder='Author' required />
        <input className='input' type='number' step='0.01' name='expectedPrice' placeholder='Expected price' />
        <input className='input' name='notes' placeholder='Notes' />
        <button type='submit' className='btn'>Add</button>
      </form>
      {error && <p className='error-text'>{error}</p>}
      <div className='grid gap-4 md:grid-cols-2'>
        {items.length ? (
          items.map((i) => (
            <div className='card space-y-3' key={i.id}>
              <h3 className='text-3xl text-primary'>{i.title}</h3>
              <p className='text-secondary'>{i.author}</p>
              <p className='text-sm text-secondary'>{i.notes}</p>
              <div className='my-1 flex flex-wrap gap-2'>
                {i.purchaseLinks?.map((l) => (
                  <a key={l.id} className='badge link-badge hover:underline' href={l.url} target='_blank' rel='noreferrer'>
                    {l.alias || l.label}
                  </a>
                ))}
              </div>
              <form
                className='space-y-2'
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
                <input className='input' name='label' placeholder='Optional label' />
                <div className='flex gap-2'>
                  <input className='input' name='url' placeholder='https://example.com/book' required />
                  <button type='submit' className='btn whitespace-nowrap'>Add Link</button>
                </div>
              </form>
            </div>
          ))
        ) : (
          <div className='card text-center md:col-span-2'>
            <img src={emptyLibrary} alt='No wishlist items' className='mx-auto mb-3 h-32 w-auto opacity-85' />
            <p className='text-secondary'>Your wishlist is empty.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function BookDetails({ id }: { id: string }) {
  const [book, setBook] = useState<Book | null>(null)

  const load = async () => {
    const res = await api.get<{ item: Book }>(`/books/${id}`)
    setBook(res.data.item)
  }

  useEffect(() => {
    void load()
  }, [id])

  if (!book) return <p className='text-secondary'>Loading...</p>

  return (
    <div className='space-y-4'>
      <h1 className='page-title'>{book.title}</h1>
      <div className='card space-y-4'>
        <p className='text-lg text-secondary'>{book.author}</p>
        <StatusBadge status={book.status} />
        <div className='grid gap-3 sm:grid-cols-2'>
          <p>Total pages: {book.totalPages}</p>
          <p>Current: {book.currentPage} · Remaining: {book.remainingPages}</p>
          <p>Progress: {Math.round(book.progressPercentage)}%</p>
          <p>Completed: {book.completedAt ? new Date(book.completedAt).toLocaleDateString() : 'Not finished yet'}</p>
        </div>
        <Progress value={book.progressPercentage} />
        <div className='flex flex-wrap gap-2'>
          {statusOptions.map((s) => (
            <button key={s} type='button' className='btn-secondary' onClick={async () => { await api.patch(`/books/${book.id}/status`, { status: s }); void load() }}>
              Move to {statusLabel[s]}
            </button>
          ))}
        </div>
        {book.status === 'currentlyReading' && (
          <form
            className='grid gap-2 md:grid-cols-[1fr_auto]'
            onSubmit={async (e) => {
              e.preventDefault()
              const currentPage = Number(new FormData(e.currentTarget).get('currentPage'))
              await api.patch(`/books/${book.id}/bookmark`, { currentPage })
              void load()
            }}
          >
            <input className='input' type='number' min={0} max={book.totalPages} name='currentPage' placeholder='Update current page' />
            <button type='submit' className='btn'>Update progress</button>
          </form>
        )}
      </div>
    </div>
  )
}

export function Profile() {
  const [name, setName] = useState('')

  return (
    <div className='space-y-6'>
      <h1 className='page-title'>Profile</h1>
      <form
        className='card max-w-xl space-y-3'
        onSubmit={async (e) => {
          e.preventDefault()
          await api.put('/user/profile', { name })
        }}
      >
        <h2 className='section-title'>Update name</h2>
        <input className='input' value={name} onChange={(e) => setName(e.target.value)} placeholder='New name' />
        <button type='submit' className='btn'>Update Name</button>
      </form>
      <form
        className='card max-w-xl space-y-3'
        onSubmit={async (e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          await api.patch('/user/password', {
            currentPassword: f.get('currentPassword'),
            newPassword: f.get('newPassword')
          })
          ;(e.target as HTMLFormElement).reset()
        }}
      >
        <h2 className='section-title'>Update password</h2>
        <input className='input' type='password' name='currentPassword' placeholder='Current password' required />
        <input className='input' type='password' name='newPassword' placeholder='New password' minLength={6} required />
        <button type='submit' className='btn'>Update Password</button>
      </form>
    </div>
  )
}
