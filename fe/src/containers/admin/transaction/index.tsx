import { CreditCardTwoTone } from '@ant-design/icons'
import { Button, Input, Select, Table } from 'antd'
import { ColumnType } from 'antd/lib/table'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import transactionService from '../../../service/admin-service/transactionService'
import { formatPrice } from '../../../utilities/formatPrice'

interface TransactionType {
  id: number
  user: any
  Product_Sizes: any
  paymentStatus: number
  deliveryStatus: string
  description: string
  totalPrice: string
  transactionMethod: string
}

const { Option } = Select

export const TransactionAdminContainer = () => {
  const navigate = useNavigate()

  const [transData, setTransData] = useState<TransactionType[]>([])
  const [inputSearch, setInputSearch] = useState('')
  const [filteredData, setFilteredData] = useState<TransactionType[]>()

  const deliveryStatusOptions = [
    { value: 'confirmming', label: 'Confirmming' },
    { value: 'init', label: 'Initializing' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'received', label: 'Received' },
    { value: 'canceled', label: 'Canceled' },
  ]

  const [option, setOption] = useState<string>('name')
  const handleDeliveryStatusFilter = (value: string) => {
    if (value === 'all') {
      setFilteredData(transData)
    } else {
      setFilteredData(transData.filter((transaction) => transaction.deliveryStatus === value))
    }
  }

  const handleSearchNameInput = (value: string) => {
    if (value === 'name') {
      setFilteredData(
        transData.filter((transaction) => transaction.user?.name.toLowerCase().includes(inputSearch.toLowerCase()))
      )
    } else if (value === 'phone') {
      setFilteredData(
        transData.filter((transaction) => transaction.user?.phone.toLowerCase().includes(inputSearch.toLowerCase()))
      )
    } else if (value === 'email') {
      setFilteredData(
        transData?.filter((transaction) => transaction.user?.email.toLowerCase().includes(inputSearch.toLowerCase()))
      )
    }
  }

  const handlePaymenMethodFilter = (value: string) => {
    if (value === 'all') {
      setFilteredData(transData)
    } else {
      setFilteredData(transData.filter((transaction) => transaction.transactionMethod === value))
    }
  }

  const columns: ColumnType<TransactionType>[] = [
    {
      title: 'User Infor',
      dataIndex: 'user',
      key: 'user',
      render: (_: any, record: TransactionType) => {
        return (
          <div className="flex-col" onClick={() => navigate(`/admin/user/${record?.user?.id}`)}>
            <div className="py-[6px] font-medium">{record?.user?.email}</div>
            <div className="py-[6px] font-medium">{record?.user?.name}</div>
            <div className="py-[6px] font-medium">{record?.user?.phone}</div>
          </div>
        )
      },
    },

    {
      title: 'Product Details',
      dataIndex: 'product',
      key: 'product',
      width: '25%',
      render: (_: any, record: TransactionType) => {
        return (
          <div className="flex gap-3 flex-col">
            {record.Product_Sizes.map((data: any) => {
              const dataId = { status: data.product.id }

              return (
                <div
                  className="flex cursor-pointer gap-3"
                  onClick={() => navigate(`/admin/product/${data?.product?.id}`, { state: { status: dataId } })}
                >
                  <img
                    className=" aspect-[1/1] object-center w-[100px] rounded-md shadow-sm"
                    src={data.product?.coverImage}
                    alt={data.product?.coverImage}
                  />
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">{data.product?.name}</p>
                    <p>
                      {data.size?.name} x {data.Transaction_Product_Size?.quantity}
                    </p>
                    {data.product?.salePrice ? (
                      <p>{formatPrice(data.product?.salePrice)}đ</p>
                    ) : (
                      <p>{formatPrice(data.product?.price)}đ</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      },
    },

    {
      title: 'Total Amount',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (_: any, record: TransactionType) => {
        return <div className="font-medium text-lg">{formatPrice(+record.totalPrice)}đ</div>
      },
    },
    {
      title: 'Method',
      dataIndex: 'transactionMethod',
      key: 'transactionMethod',
      render: (_: any, record: any) => {
        return (
          <>
            {record.transactionMethod === 'vnpay' ? (
              <div className="flex gap-1">
                <CreditCardTwoTone /> <p className="">VNPay </p>
              </div>
            ) : (
              <div className="flex gap-1">
                <CreditCardTwoTone /> <p className="">Cash </p>
              </div>
            )}
          </>
        )
      },
    },
    {
      title: 'Payment ',
      dataIndex: 'paymentstatus',
      key: 'paymentstatus',
      align: 'center',

      render: (_: any, record: any) => {
        return (
          <>{record.paymentstatus === '1' || record.deliveryStatus === 'received' ? <p>Paid</p> : <p>Not Paid</p>}</>
        )
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Delivery ',
      dataIndex: 'deliveryStatus',
      key: 'deliveryStatus',
      render: (value: any, record: any) => {
        const handleChange = async (value: any) => {
          try {
            const res = await transactionService.updateTransaction(record.id, value, record.transactionMethod)
            if (res.status === 200) {
              toast.success('Transaction updated successfully')
              record.deliveryStatus = value
              setTransData([...transData])
            }
          } catch (error) {
            console.log('error', error)
            toast.error('Cannot update canceled transaction')
          }
        }

        return (
          <Select value={value} onSelect={handleChange} className="min-w-[130px]">
            {deliveryStatusOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        )
      },
    },
  ]

  useEffect(() => {
    transactionService
      .getAllTransaction()
      .then((res) => {
        setTransData(res.data)
        setFilteredData(res.data)
      })
      .catch((err) => console.log(err))
  }, [])

  return (
    <div>
      <div>
        <Select className="py-4" style={{ width: 200 }} defaultValue={'all'} onChange={handleDeliveryStatusFilter}>
          <Option value="all">All Transaction</Option>
          <Option value="confirmming">Confirmming Transaction</Option>
          <Option value="init">Initialization</Option>
          <Option value="shipping">Shipping</Option>
          <Option value="received">Received</Option>
          <Option value="canceled">Canceled</Option>
        </Select>
        <Select className="py-4 pl-2" style={{ width: 200 }} defaultValue={'all'} onChange={handlePaymenMethodFilter}>
          <Option value="all">All payment</Option>
          <Option value="cash">By cash</Option>
          <Option value="vnpay">By VNPay</Option>
        </Select>
        <Input
          onChange={(e) => setInputSearch(e.target.value)}
          value={inputSearch}
          placeholder="Find by ..."
          className="w-[300px] mx-2"
        />
        <Select className="mr-2" style={{ width: 150 }} defaultValue={'name'} onChange={(e) => setOption(e)}>
          <Option value="name">Name</Option>
          <Option value="phone">Phone number</Option>
          <Option value="email">Email</Option>
        </Select>
        <Button className="h-[40px]" onClick={() => handleSearchNameInput(option!)}>
          Find
        </Button>
        <Table dataSource={filteredData} columns={columns} />
      </div>
    </div>
  )
}
