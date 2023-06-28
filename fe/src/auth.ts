import { message } from 'antd'
import axios, { AxiosInstance } from 'axios'
import { toast } from 'react-toastify'

import { useNavigate } from 'react-router-dom'

interface MyAxiosInstance extends AxiosInstance {
  setToken: (token: string) => void
}
const instance = axios.create({
  baseURL: 'http://localhost:8080/',
  timeout: 5 * 1000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
}) as MyAxiosInstance

instance.setToken = (token) => {
  instance.defaults.headers.common.Authorization = token
  localStorage.setItem('token', token)
}

instance.interceptors.request.use(
  (config) => {
    config.headers.Authorization = localStorage.getItem('token')
    return config
  },
  (err) => {
    console.log(err)
    return err
  }
)

instance.interceptors.response.use(
  (response) => {
    return response
  },
  (err) => {
    if (err.response) {
      const { status } = err.response
      if (status === 401 || status === 403) {
        toast.error('You need to login first', {
          onClose: () => {
            window.location.href = '/login'
          },
        })
      }
    }
  }
)
export default instance
