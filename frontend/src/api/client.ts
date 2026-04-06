import axios from 'axios'
import { authStore } from '../contexts/authStore'

const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:8080/api/v1'})
api.interceptors.request.use(c=>{const t=authStore.getState().accessToken;if(t)c.headers.Authorization=`Bearer ${t}`;return c})
api.interceptors.response.use(r=>r, async err=>{
  const orig=err.config
  if(err.response?.status===401 && !orig._retry && authStore.getState().refreshToken){
    orig._retry=true
    try{
      const res=await axios.post(`${import.meta.env.VITE_API_URL||'http://localhost:8080/api/v1'}/auth/refresh`,{refresh_token:authStore.getState().refreshToken})
      authStore.getState().setTokens(res.data.tokens.access_token,res.data.tokens.refresh_token)
      orig.headers.Authorization=`Bearer ${res.data.tokens.access_token}`
      return api(orig)
    }catch{authStore.getState().logout()}
  }
  return Promise.reject(err)
})
export default api
