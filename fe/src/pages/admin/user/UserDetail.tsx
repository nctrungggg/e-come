import { Helmet } from 'react-helmet'
import { UserDetailContainer } from '../../../containers/admin/user/UserDetail'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router'

export const AdminUserDetailManagement = () => {
  const navigate = useNavigate()

  return (
    <div className="">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Home page</title>
      </Helmet>
      <div>
        <div className="cursor-pointer py-5" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined className="text-xl" />
        </div>
        <UserDetailContainer />
      </div>
    </div>
  )
}
