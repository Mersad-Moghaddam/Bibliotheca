import { create } from 'zustand'
import { User } from '../types'

type State={user:User|null,accessToken:string|null,refreshToken:string|null,setAuth:(u:User,a:string,r:string)=>void,setTokens:(a:string,r:string)=>void,logout:()=>void}
export const authStore=create<State>((set)=>({
  user:null,accessToken:null,refreshToken:null,
  setAuth:(user,accessToken,refreshToken)=>set({user,accessToken,refreshToken}),
  setTokens:(accessToken,refreshToken)=>set({accessToken,refreshToken}),
  logout:()=>set({user:null,accessToken:null,refreshToken:null})
}))
