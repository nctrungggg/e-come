import { Helmet } from 'react-helmet'
import { UserManagementContainer } from '../../../containers/admin/user'

export const AdminUserManagement = () => {
  return (
    <div className="">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Home page</title>
      </Helmet>
      <div>
        <UserManagementContainer />
      </div>
    </div>
  )
}
