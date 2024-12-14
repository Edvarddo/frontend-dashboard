import React from 'react'
import useAuth from '@/hooks/useAuth'
import axios from '@/api/axios'

const useRefreshToken = () => {
  const { authToken, refreshToken, setAuthToken, setIsTokenExpired} = useAuth()
  // console.log(refreshToken)
  const refresh = async () => {
    const response = await axios.post('token/refresh/',{
        "refresh": refreshToken
    })
    .then(response => {
      console.log(response)
      setAuthToken(response.data.access)
      localStorage.setItem('authToken', response.data.access)
      return response
    })
    .catch(error => {
      console.log(error.status)
      console.log(error)
      if(error.status === 401 || error.status === 400){
        setIsTokenExpired(true)
      }
      return error
    })
    
    
    // console.log(response.data.access)
    // console.log(authToken)
    // setAuthToken(prev=>{
    //   console.log(JSON.stringify(prev))
    //   console.log(response.data.access)
    //   // return response.data.access
    //   return prev
    // })
    return response.data.access;
  }
  return refresh;
}

export default useRefreshToken