import React from 'react'
import { Helmet } from 'react-helmet'
import SizePageContainer from '../../../containers/admin/size/SizePageContainer'

export const SizePage = () => {
  return (
    <div className="">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Home page</title>
      </Helmet>
      <div>
        <SizePageContainer />
      </div>
    </div>
  )
}
