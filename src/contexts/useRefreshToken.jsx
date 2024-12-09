import React from 'react'
import useAuth from '@/hooks/useAuth'
import axios from '@/api/axios'
const useRerfreshToken = () => {
  const { authToken, refreshToken} = useAuth()
  const refresh = async () => {
    await axios.get('token/refresh',{
        "refresh": refreshToken
    })
  }
  return (
    <div>useRerfreshToken</div>
  )
}

export default useRerfreshToken