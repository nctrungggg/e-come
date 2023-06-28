import React from 'react'
import { Helmet } from 'react-helmet'
import CategoryContainer from '../../../containers/admin/category'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router'

export const CategoryAdminPage = () => {
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
        <CategoryContainer />
      </div>
    </div>
  )
}
