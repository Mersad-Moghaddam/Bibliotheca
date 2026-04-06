import { FormEvent, useEffect, useState } from 'react'
import api from '../api/client'
import { Book, WishlistItem } from '../types'
import { Progress, Section, StatusBadge } from '../components/UI'

const statusOptions=['currently_reading','finished','next_to_read']

export function Dashboard(){
  const [data,setData]=useState<any>(null)
  useEffect(()=>{ void api.get('/dashboard/summary').then(r=>setData(r.data)) },[])
  if(!data) return <p>Loading...</p>
  return <div className='space-y-4'><h1 className='text-3xl'>Your Reading Room</h1><div className='grid md:grid-cols-5 gap-3'>{Object.entries(data.counts).map(([k,v])=><div key={k} className='card'><p className='text-sm'>{k.replaceAll('_',' ')}</p><p className='text-2xl'>{String(v)}</p></div>)}</div><Section title='Recent Books'>{data.recent_books?.map((b:Book)=><p key={b.id}>{b.title} — {b.author}</p>)}</Section></div>
}

export function Library(){
  const [books,setBooks]=useState<Book[]>([]); const [search,setSearch]=useState(''); const [status,setStatus]=useState('')
  const load=async()=>{const r=await api.get('/books',{params:{search,status}});setBooks(r.data)}
  useEffect(()=>{void load()},[status])
  const add=async(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();const f=new FormData(e.currentTarget);await api.post('/books',{title:f.get('title'),author:f.get('author'),total_pages:Number(f.get('total_pages')),status:f.get('status')});(e.target as HTMLFormElement).reset();void load()}
  return <div className='space-y-4'><h1 className='text-3xl'>My Library</h1><form onSubmit={add} className='card grid md:grid-cols-5 gap-2'><input className='input' name='title' placeholder='Title' required/><input className='input' name='author' placeholder='Author' required/><input className='input' type='number' min={1} name='total_pages' placeholder='Pages' required/><select className='input' name='status'>{statusOptions.map(s=><option key={s}>{s}</option>)}</select><button className='btn'>Add Book</button></form><div className='card flex gap-2'><input className='input' placeholder='Search title/author' value={search} onChange={e=>setSearch(e.target.value)}/><button className='btn' onClick={()=>void load()}>Search</button><select className='input w-48' value={status} onChange={e=>setStatus(e.target.value)}><option value=''>All</option>{statusOptions.map(s=><option key={s}>{s}</option>)}</select></div><div className='space-y-2'>{books.map(b=><div key={b.id} className='card flex items-center gap-3'><div className='grow'><p className='font-semibold'>{b.title}</p><p className='text-sm'>{b.author} · {b.total_pages} pages</p></div><StatusBadge status={b.status}/><a className='btn !py-1' href={`/books/${b.id}`}>Details</a></div>)}</div></div>
}

function BookListByStatus({status,title}:{status:string,title:string}){const [books,setBooks]=useState<Book[]>([]);const load=async()=>{const r=await api.get('/books',{params:{status}});setBooks(r.data)};useEffect(()=>{void load()},[]);return <div className='space-y-3'><h1 className='text-3xl'>{title}</h1>{books.map(b=><div key={b.id} className='card space-y-2'><div className='flex justify-between'><p className='font-semibold'>{b.title}</p><p>{b.current_page ?? 0}/{b.total_pages}</p></div><Progress value={b.progress_percent}/>{status==='currently_reading'&&<form className='flex gap-2' onSubmit={async(e)=>{e.preventDefault();const v=Number(new FormData(e.currentTarget).get('current_page'));await api.patch(`/books/${b.id}/bookmark`,{current_page:v});void load()}}><input className='input' type='number' name='current_page' min={0} max={b.total_pages} placeholder='Update page'/><button className='btn'>Save</button><button type='button' className='btn !bg-bronze' onClick={async()=>{await api.patch(`/books/${b.id}/status`,{status:'finished'});void load()}}>Mark Finished</button></form>}</div>)}</div>}
export const Reading=()=> <BookListByStatus status='currently_reading' title='Currently Reading' />
export const Finished=()=> <BookListByStatus status='finished' title='Finished Books' />
export const Next=()=> <BookListByStatus status='next_to_read' title='Next to Read' />

export function Wishlist(){
  const [items,setItems]=useState<WishlistItem[]>([]); const load=async()=>{const r=await api.get('/wishlist');setItems(r.data)}; useEffect(()=>{void load()},[])
  const add=async(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();const f=new FormData(e.currentTarget);await api.post('/wishlist',{title:f.get('title'),author:f.get('author'),expected_price:f.get('expected_price')?Number(f.get('expected_price')):null,notes:f.get('notes')||null});(e.target as HTMLFormElement).reset();void load()}
  return <div className='space-y-4'><h1 className='text-3xl'>Wishlist / Shopping List</h1><form onSubmit={add} className='card grid md:grid-cols-5 gap-2'><input className='input' name='title' placeholder='Title' required/><input className='input' name='author' placeholder='Author' required/><input className='input' type='number' step='0.01' name='expected_price' placeholder='Expected price'/><input className='input' name='notes' placeholder='Notes'/><button className='btn'>Add</button></form><div className='grid md:grid-cols-2 gap-3'>{items.map(i=><div className='card' key={i.id}><h3 className='text-xl'>{i.title}</h3><p>{i.author}</p><p className='text-sm'>{i.notes}</p><div className='my-2 flex flex-wrap gap-2'>{i.purchase_links?.map(l=><a key={l.id} className='badge hover:underline' href={l.url} target='_blank'>{l.label}</a>)}</div><form className='flex gap-2' onSubmit={async(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);await api.post(`/wishlist/${i.id}/links`,{label:f.get('label'),url:f.get('url')});(e.target as HTMLFormElement).reset();void load()}}><input className='input' name='label' placeholder='Store'/><input className='input' name='url' placeholder='https://'/><button className='btn'>Add link</button></form></div>)}</div></div>
}

export function BookDetails({id}:{id:string}){const [book,setBook]=useState<Book|null>(null); useEffect(()=>{void api.get(`/books/${id}`).then(r=>setBook(r.data))},[id]); if(!book) return <p>Loading...</p>; return <div className='card space-y-2'><h1 className='text-3xl'>{book.title}</h1><p>{book.author}</p><StatusBadge status={book.status}/><p>Pages: {book.total_pages}</p><p>Current: {book.current_page ?? 0} | Remaining: {book.remaining_pages}</p><Progress value={book.progress_percent}/></div>}

export function Profile(){
  const [name,setName]=useState('')
  return <div className='space-y-4'><h1 className='text-3xl'>Profile</h1><form className='card max-w-lg space-y-2' onSubmit={async(e)=>{e.preventDefault();await api.put('/users/profile',{name})}}><input className='input' value={name} onChange={e=>setName(e.target.value)} placeholder='New name'/><button className='btn'>Update Name</button></form><form className='card max-w-lg space-y-2' onSubmit={async(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);await api.put('/users/password',{current_password:f.get('current_password'),new_password:f.get('new_password')});(e.target as HTMLFormElement).reset()}}><input className='input' type='password' name='current_password' placeholder='Current password' required/><input className='input' type='password' name='new_password' placeholder='New password' minLength={6} required/><button className='btn'>Update Password</button></form></div>
}
