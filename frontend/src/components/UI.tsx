import { ReactNode } from 'react'
export const Section=({title,children}:{title:string,children:ReactNode})=><section className='card'><h2 className='text-xl mb-3'>{title}</h2>{children}</section>
export const StatusBadge=({status}:{status:string})=><span className='badge'>{status.replaceAll('_',' ')}</span>
export const Progress=({value}:{value:number})=><div className='w-full bg-parchment rounded-full h-2'><div className='bg-bronze h-2 rounded-full' style={{width:`${Math.min(100,Math.max(0,value))}%`}}/></div>
