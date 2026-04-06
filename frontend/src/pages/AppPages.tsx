import { FormEvent, useEffect, useState } from 'react'
import api from '../api/client'
import { Book, WishlistItem } from '../types'
import { Progress, Section, StatusBadge } from '../components/UI'
import emptyLibrary from '../assets/empty-library.svg'

const statusOptions = ['currently_reading', 'finished', 'next_to_read']

export function Dashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    void api.get('/dashboard/summary').then((r) => setData(r.data))
  }, [])

  if (!data) return <p>Loading...</p>

  return (
    <div className='space-y-4'>
      <h1 className='text-4xl text-primary'>Your Personal Library</h1>
      <div className='grid gap-3 sm:grid-cols-2 md:grid-cols-5'>
        {Object.entries(data.counts).map(([k, v]) => (
          <div key={k} className='card'>
            <p className='text-sm capitalize text-secondary'>{k.replaceAll('_', ' ')}</p>
            <p className='text-2xl text-primary'>{String(v)}</p>
          </div>
        ))}
      </div>
      <Section title='Recent Books'>
        {data.recent_books?.length ? (
          data.recent_books.map((b: Book) => (
            <p key={b.id}>
              {b.title} — {b.author}
            </p>
          ))
        ) : (
          <div className='flex items-center gap-3'>
            <img src={emptyLibrary} alt='Empty library' className='h-16 w-24 rounded-xl' />
            <p className='text-secondary'>No books yet. Start building your shelf.</p>
          </div>
        )}
      </Section>
    </div>
  )
}

export function Library() {
  const [books, setBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const load = async () => {
    const r = await api.get('/books', { params: { search, status } })
    setBooks(r.data)
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
      total_pages: Number(f.get('total_pages')),
      status: f.get('status')
    })
    ;(e.target as HTMLFormElement).reset()
    void load()
  }

  return (
    <div className='space-y-4'>
      <h1 className='text-4xl text-primary'>Library</h1>
      <form onSubmit={add} className='card grid gap-2 md:grid-cols-5'>
        <input className='input' name='title' placeholder='Title' required />
        <input className='input' name='author' placeholder='Author' required />
        <input className='input' type='number' min={1} name='total_pages' placeholder='Pages' required />
        <select className='input' name='status'>
          {statusOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className='btn'>Add Book</button>
      </form>
      <div className='card flex flex-col gap-2 md:flex-row'>
        <input
          className='input'
          placeholder='Search title or author'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className='btn' onClick={() => void load()}>
          Search
        </button>
        <select className='input md:w-52' value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value=''>All</option>
          {statusOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className='space-y-2'>
        {books.length ? (
          books.map((b) => (
            <div key={b.id} className='card flex items-center gap-3'>
              <div className='grow'>
                <p className='font-semibold text-primary'>{b.title}</p>
                <p className='text-sm text-secondary'>
                  {b.author} · {b.total_pages} pages
                </p>
              </div>
              <StatusBadge status={b.status} />
              <a className='btn py-1.5' href={`/books/${b.id}`}>
                Details
              </a>
            </div>
          ))
        ) : (
          <div className='card text-center'>
            <img src={emptyLibrary} alt='Empty shelf' className='mx-auto mb-3 h-32 w-auto' />
            <p className='text-secondary'>No books found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function BookListByStatus({ status, title }: { status: string; title: string }) {
  const [books, setBooks] = useState<Book[]>([])
  const load = async () => {
    const r = await api.get('/books', { params: { status } })
    setBooks(r.data)
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className='space-y-3'>
      <h1 className='text-4xl text-primary'>{title}</h1>
      {books.length ? (
        books.map((b) => (
          <div key={b.id} className='card space-y-2'>
            <div className='flex justify-between'>
              <p className='font-semibold text-primary'>{b.title}</p>
              <p className='text-secondary'>
                {b.current_page ?? 0}/{b.total_pages}
              </p>
            </div>
            <Progress value={b.progress_percentage} />
            {status === 'currently_reading' && (
              <form
                className='flex flex-col gap-2 md:flex-row'
                onSubmit={async (e) => {
                  e.preventDefault()
                  const v = Number(new FormData(e.currentTarget).get('current_page'))
                  await api.patch(`/books/${b.id}/bookmark`, { current_page: v })
                  void load()
                }}
              >
                <input
                  className='input'
                  type='number'
                  name='current_page'
                  min={0}
                  max={b.total_pages}
                  placeholder='Update page'
                />
                <button className='btn'>Save Progress</button>
                <button
                  type='button'
                  className='btn-secondary'
                  onClick={async () => {
                    await api.patch(`/books/${b.id}/status`, { status: 'finished' })
                    void load()
                  }}
                >
                  Mark Finished
                </button>
              </form>
            )}
          </div>
        ))
      ) : (
        <div className='card text-center text-secondary'>No books in this section yet.</div>
      )}
    </div>
  )
}

export const Reading = () => <BookListByStatus status='currently_reading' title='Reading' />
export const Finished = () => <BookListByStatus status='finished' title='Finished' />
export const Next = () => <BookListByStatus status='next_to_read' title='Next Reads' />

export function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const load = async () => {
    const r = await api.get('/wishlist')
    setItems(r.data)
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
      expected_price: f.get('expected_price') ? Number(f.get('expected_price')) : null,
      notes: f.get('notes') || null
    })
    ;(e.target as HTMLFormElement).reset()
    void load()
  }

  return (
    <div className='space-y-4'>
      <h1 className='text-4xl text-primary'>Wishlist</h1>
      <form onSubmit={add} className='card grid gap-2 md:grid-cols-5'>
        <input className='input' name='title' placeholder='Title' required />
        <input className='input' name='author' placeholder='Author' required />
        <input className='input' type='number' step='0.01' name='expected_price' placeholder='Expected price' />
        <input className='input' name='notes' placeholder='Notes' />
        <button className='btn'>Add</button>
      </form>
      <div className='grid gap-3 md:grid-cols-2'>
        {items.length ? (
          items.map((i) => (
            <div className='card' key={i.id}>
              <h3 className='text-2xl text-primary'>{i.title}</h3>
              <p className='text-secondary'>{i.author}</p>
              <p className='text-sm text-secondary'>{i.notes}</p>
              <div className='my-2 flex flex-wrap gap-2'>
                {i.purchase_links?.map((l) => (
                  <a key={l.id} className='badge link-badge hover:underline' href={l.url} target='_blank'>
                    {l.label}
                  </a>
                ))}
              </div>
              <form
                className='flex flex-col gap-2 md:flex-row'
                onSubmit={async (e) => {
                  e.preventDefault()
                  const f = new FormData(e.currentTarget)
                  await api.post(`/wishlist/${i.id}/links`, { label: f.get('label'), url: f.get('url') })
                  ;(e.target as HTMLFormElement).reset()
                  void load()
                }}
              >
                <input className='input' name='label' placeholder='Store' />
                <input className='input' name='url' placeholder='https://' />
                <button className='btn'>Add Link</button>
              </form>
            </div>
          ))
        ) : (
          <div className='card text-center md:col-span-2'>
            <img src={emptyLibrary} alt='No wishlist items' className='mx-auto mb-3 h-32 w-auto' />
            <p className='text-secondary'>Your wishlist is empty.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function BookDetails({ id }: { id: string }) {
  const [book, setBook] = useState<Book | null>(null)

  useEffect(() => {
    void api.get(`/books/${id}`).then((r) => setBook(r.data))
  }, [id])

  if (!book) return <p>Loading...</p>

  return (
    <div className='card space-y-2'>
      <h1 className='text-4xl text-primary'>{book.title}</h1>
      <p className='text-secondary'>{book.author}</p>
      <StatusBadge status={book.status} />
      <p>Pages: {book.total_pages}</p>
      <p>
        Current: {book.current_page ?? 0} | Remaining: {book.remaining_pages}
      </p>
      <Progress value={book.progress_percentage} />
    </div>
  )
}

export function Profile() {
  const [name, setName] = useState('')

  return (
    <div className='space-y-4'>
      <h1 className='text-4xl text-primary'>Profile</h1>
      <form
        className='card max-w-lg space-y-2'
        onSubmit={async (e) => {
          e.preventDefault()
          await api.put('/users/profile', { name })
        }}
      >
        <input className='input' value={name} onChange={(e) => setName(e.target.value)} placeholder='New name' />
        <button className='btn'>Update Name</button>
      </form>
      <form
        className='card max-w-lg space-y-2'
        onSubmit={async (e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          await api.put('/users/password', {
            current_password: f.get('current_password'),
            new_password: f.get('new_password')
          })
          ;(e.target as HTMLFormElement).reset()
        }}
      >
        <input className='input' type='password' name='current_password' placeholder='Current password' required />
        <input className='input' type='password' name='new_password' placeholder='New password' minLength={6} required />
        <button className='btn'>Update Password</button>
      </form>
    </div>
  )
}
