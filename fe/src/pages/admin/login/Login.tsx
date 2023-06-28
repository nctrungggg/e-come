import React from 'react'
import { Helmet } from 'react-helmet'
import { LoginAdminPageContainer } from '../../../containers/admin/LoginAdminPageContainer'
import { Navigate } from 'react-router'

export const LoginAdminPage = () => {
  const token = localStorage.getItem('adminToken')

  if (token) {
    return <Navigate to={'/admin/dashboard'} />
  }

  return (
    <div className="">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Home page</title>
      </Helmet>
      <div>
        <LoginAdminPageContainer />
      </div>
    </div>
  )
}
