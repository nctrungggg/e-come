import { TransactionOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Divider } from 'antd'
import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { NavLink } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

const AccountLayout: React.FC<LayoutProps> = ({ children }) => {
  const authData = useSelector((state: RootState) => state.auth)
  const userData = authData.user
  return (
    <div className="flex pl-[8%] pr-[8%] mt-[4vh] ">
      <div className="flex-col basis-[25%] pt-6 pr-4">
        <div className="flex items-center">
          <Avatar size={52} icon={<UserOutlined />} src={userData?.avatar} />
          <div className="flex-col pl-4">
            <div className="font-medium">{userData?.name}</div>
          </div>
        </div>
        <Divider />
        <div className="flex-col ">
          <NavLink to={'/account/profile'}>
            <div className="flex items-center my-2 cursor-pointer">
              <UserOutlined className="text-[18px]" />
              <div className="pl-2 text-[18px]">My account</div>
            </div>
          </NavLink>
          <NavLink to="/account/transaction">
            <div className="flex items-center my-2 cursor-pointer">
              <TransactionOutlined className="text-[18px]" />
              <div className="pl-2 text-[18px]">Transaction</div>
            </div>
          </NavLink>
        </div>
      </div>
      <div className="w-full">{children}</div>
    </div>
  )
}

export default AccountLayout
