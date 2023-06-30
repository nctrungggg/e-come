import { Button, Input, Select, Table } from 'antd'
import React, { useEffect, useState } from 'react'
import userService from '../../../service/admin-service/userService'
import { UserType } from './type'
import { ColumnType } from 'antd/es/table'
import { useNavigate } from 'react-router'

const { Option } = Select

export const UserManagementContainer = () => {
  const [inputSearch, setInputSearch] = useState('')
  const [option, setOption] = useState<string>('name')
  const [userData, setUserData] = useState<UserType[]>()
  const [filteredData, setFilteredData] = useState<UserType[]>()
  const navigate = useNavigate()

  console.log('userData:', userData)

  const handleSearchNameInput = (value: string) => {
    if (value === 'all') {
      setFilteredData(userData)
    } else if (value === 'name') {
      setFilteredData(userData!.filter((user) => user.name.toLowerCase().includes(inputSearch.toLowerCase())))
    } else if (value === 'phone') {
      setFilteredData(userData!.filter((user) => user.phone.toLowerCase().includes(inputSearch.toLowerCase())))
    } else if (value === 'email') {
      setFilteredData(userData!.filter((user) => user.email.toLowerCase().includes(inputSearch.toLowerCase())))
    }
  }
  const columns: ColumnType<UserType>[] = [
    {
      title: 'No',
      dataIndex: 'id',
      key: 'id',
      render: (value: any, record: UserType, index: number) => <div>{index + 1}</div>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, record: UserType) => {
        return <p className="font-medium">{record.name}</p>
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (_: any, record: UserType) => {
        return <p>{record.phone}</p>
      },
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
  ]

  useEffect(() => {
    userService
      .getAllUser()
      .then((res) => {
        setUserData(res.data)
        setFilteredData(res.data)
      })
      .catch((err) => console.log(err))
  }, [])

  const handleRowDoubleClick = (id: string) => {
    navigate(`${id}`)
  }

  return (
    <div className="p-5">
      <div className="flex justify-end gap-3 mb-5">
        <Input
          onChange={(e) => setInputSearch(e.target.value)}
          value={inputSearch}
          placeholder="Find by ..."
          className="w-[280px] h-[40px]"
        />
        <Select className="h-[40px]" style={{ width: 150 }} defaultValue={'name'} onChange={(e) => setOption(e)}>
          <Option value="all">All</Option>
          <Option value="name">Name</Option>
          <Option value="phone">Phone number</Option>
          <Option value="email">Email</Option>
        </Select>
        <Button className="h-[40px]" onClick={() => handleSearchNameInput(option!)}>
          Find
        </Button>
      </div>
      <Table
        dataSource={filteredData}
        columns={columns}
        onRow={(record) => ({
          onDoubleClick: () => handleRowDoubleClick(record.id),
        })}
      />
    </div>
  )
}
