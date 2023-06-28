import { UserOutlined } from '@ant-design/icons'
import { Dropdown } from 'antd'
import { MenuProps } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { logout } from '../../redux/slice/authSlice'
import { useNavigate } from 'react-router'

export const LoginIcon = () => {
  const isLogin = useSelector((state: RootState) => state.auth.isLoggedIn)

  const dispatch = useDispatch()

  const navigate = useNavigate()

  const handleSignout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const items: MenuProps['items'] = [
    {
      label: <div onClick={() => navigate('/account/profile')}>My Account</div>,
      key: '1',
    },
    {
      type: 'divider',
    },
    {
      label: <div onClick={() => navigate('/account/transaction')}>Order Tracking</div>,
      key: '2',
    },
    {
      type: 'divider',
    },
    {
      label: <div onClick={handleSignout}>Sign out</div>,
      key: '3',
    },
  ]

  const handleClick = () => {
    if (!isLogin) {
      navigate('/login')
    }
  }

  return (
    <div className="relative">
      <Dropdown overlayStyle={{ width: '160px' }} disabled={!isLogin} menu={{ items }} placement="bottomRight">
        <UserOutlined onClick={handleClick} className=" p-3 hover:text-baseColor cursor-pointer text-[28px]" />
      </Dropdown>
    </div>
  )
}
