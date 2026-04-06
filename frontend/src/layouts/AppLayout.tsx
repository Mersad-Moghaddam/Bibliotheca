import { Link, NavLink, useNavigate } from 'react-router-dom'
import { authStore } from '../contexts/authStore'

const links=[['/dashboard','Dashboard'],['/library','My Library'],['/reading','Currently Reading'],['/finished','Finished'],['/next','Next to Read'],['/wishlist','Wishlist'],['/profile','Profile']]
export default function AppLayout({children}:{children:React.ReactNode}){
  const nav=useNavigate(); const logout=authStore(s=>s.logout)
  return <div className='min-h-screen pattern'><header className='border-b border-coffee/15 bg-cream/90 backdrop-blur'><div className='max-w-6xl mx-auto p-4 flex items-center gap-4'><Link to='/dashboard' className='text-2xl font-semibold'>📚 Bibliotheca</Link><nav className='flex gap-2 text-sm'>{links.map(([to,label])=><NavLink key={to} to={to} className={({isActive})=>`px-2 py-1 rounded ${isActive?'bg-walnut text-cream':'hover:bg-parchment'}`}>{label}</NavLink>)}</nav><button className='ml-auto btn' onClick={()=>{logout();nav('/login')}}>Sign out</button></div></header><main className='max-w-6xl mx-auto p-4'>{children}</main></div>
}
