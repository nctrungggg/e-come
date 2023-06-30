import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router'

export const ErrorPage = () => {
  const navigate = useNavigate()

  return (
    <div className="p-20">
      <div className="cursor-pointer" onClick={() => navigate('/')}>
        <ArrowLeftOutlined className="text-xl" />
      </div>
      <div className="mx-auto mt-40 flex flex-col items-center ">
        <h1 className="text-8xl font-medium mb-3">Oops!</h1>
        <p className="text-xl">Sorry, an unexpected error has occurred.</p>
        <p></p>
      </div>
    </div>
  )
}
