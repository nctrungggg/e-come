import React, { useState } from 'react'
import type { MenuProps } from 'antd'
import { Menu, Layout } from 'antd'
import {
  AppstoreOutlined,
  HomeOutlined,
  ColumnHeightOutlined,
  MenuFoldOutlined,
  SettingOutlined,
  FileImageOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
type MenuItem = Required<MenuProps>['items'][number]
const { Sider } = Layout

const SideBar = () => {
  const [openKeys, setOpenKeys] = useState([''])
  const navigate = useNavigate()
  const onClick: MenuProps['onClick'] = (e) => {
    // Handle change router
    navigate('/admin/' + e.key)
  }
  function getItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[]): MenuItem {
    return {
      key,
      icon,
      children,
      label,
    } as MenuItem
  }
  const items: MenuItem[] = [
    getItem('Dashboard', 'dashboard', <HomeOutlined />),
    getItem('Carousel', 'carousel', <FileImageOutlined />),
    getItem('User', 'user', <UserOutlined />),
    getItem('Big Category', 'bigcategory', <AppstoreOutlined />, [
      getItem('Men', 'men'),
      getItem('Women', 'women'),
      getItem('Kids', 'kid'),
    ]),
    getItem('Size', 'size', <ColumnHeightOutlined />),
    getItem('Product', 'product', <MenuFoldOutlined />),
    getItem('Transaction', 'transaction', <SettingOutlined />),
  ]
  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    setOpenKeys(keys)
  }

  return (
    <Sider className="!w-[250px] !max-w-[250px] !basis-[250px] drop-shadow-md">
      <Menu
        mode="inline"
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        items={items}
        theme="light"
        onClick={onClick}
        style={{
          height: '100%',
          borderRight: 0,
          paddingTop: '20px',
        }}
      />
    </Sider>
  )
}

export default SideBar
