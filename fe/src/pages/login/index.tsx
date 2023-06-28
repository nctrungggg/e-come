import { Helmet } from 'react-helmet'
import { LoginContainer } from '../../containers/login'
import { Navigate, useNavigate } from 'react-router'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useEffect } from 'react'

export const LoginPage = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  if (token) {
    return <Navigate to="/" />
  }

  // useEffect(() => {
  //   if (token) {
  //     navigate('/')
  //   }
  // }, [token, navigate])
  return (
    <div className="">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Login</title>
      </Helmet>
      <div>
        <div className="mt-10 ml-10 cursor-pointer" onClick={() => navigate('/')}>
          <ArrowLeftOutlined className="text-xl" />
        </div>
        <LoginContainer />
      </div>
    </div>
  )
}
