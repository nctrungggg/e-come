import { Helmet } from 'react-helmet'
import { RegisterContainer } from '../../containers/register/RegisterContainer'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Navigate, useNavigate } from 'react-router'

export const RegisterPage = () => {
  const navigate = useNavigate()
 const token = localStorage.getItem('token')

  if (token) {
    return <Navigate to="/" />
  }
  return (
    <div className="">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Home page</title>
      </Helmet>
      <div>
        <div className="mt-10 ml-10 cursor-pointer" onClick={() => navigate('/')}>
          <ArrowLeftOutlined className="text-xl" />
        </div>
        <RegisterContainer />
      </div>
    </div>
  )
}
