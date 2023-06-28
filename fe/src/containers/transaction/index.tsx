import { CreditCardTwoTone } from '@ant-design/icons'
import { Button, Select, Table } from 'antd'
import { ColumnType } from 'antd/lib/table'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import paymentService from '../../service/paymentService'
import transactionService from '../../service/transactionService'
import { formatPrice } from '../../utilities/formatPrice'

interface TransactionType {
  id: number
  Product_Sizes: any
  paymentStatus: number
  deliveryStatus: string
  description: string
  totalPrice: string
  transactionMethod: string
}

const { Option } = Select

export const TransactionContainer = () => {
  const authData = useSelector((state: any) => state.auth)
  const navigate = useNavigate()
  const userId = authData.user?.id
  const [transData, setTransData] = useState<TransactionType[]>([])

  const [filteredData, setFilteredData] = useState<TransactionType[]>()

  const handleDeliveryStatusFilter = (value: string) => {
    if (value === 'all') {
      setFilteredData(transData)
    } else {
      setFilteredData(transData.filter((transaction) => transaction.deliveryStatus === value))
    }
  }

  const handlePaymenMethodFilter = (value: string) => {
    if (value === 'all') {
      setFilteredData(transData)
    } else {
      setFilteredData(transData.filter((transaction) => transaction.transactionMethod === value))
    }
  }

  const handlePayAgain = async (id: number) => {
    const paymentData = {
      transactionId: id,
      bankCode: 'VNBANK',
      language: 'vn',
    }
    const result = await paymentService.createPaymentURL(paymentData)
    window.location.href = result.data.url
  }
  const columns: ColumnType<TransactionType>[] = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      width: '30%',
      render: (_: any, record: TransactionType) => {
        return (
          <div className="flex gap-3 flex-col">
            {record.Product_Sizes.map((data: any) => (
              <div className="flex cursor-pointer gap-3" onClick={() => navigate(`/product/${data.product.id}`)}>
                <img
                  className=" aspect-[1/1] object-center w-[100px] rounded-md shadow-sm"
                  src={data.product?.coverImage}
                  alt={data.product?.coverImage}
                />
                <div className=" flex flex-col gap-2 ">
                  <p className="font-medium">{data.product?.name}</p>
                  <p>
                    {data.Transaction_Product_Size?.quantity} x {data.size?.name}
                  </p>
                  {data.product?.salePrice ? (
                    <p>{formatPrice(data.product?.salePrice)}đ</p>
                  ) : (
                    <p>{formatPrice(data.product?.price)}đ</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      },
    },

    {
      title: 'Delivery',
      dataIndex: 'deliveryStatus',
      key: 'deliveryStatus',
      align: 'center',
      render: (_: any, record: any) => {
        return (
          <div>
            <p className="font-medium capitalize">{record?.deliveryStatus}</p>
          </div>
        )
      },
    },

    {
      title: 'Total price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'center',
      width: '15%',
      render: (_: any, record: any) => {
        return (
          <div>
            <p className="font-medium text-lg">{formatPrice(Number(record?.totalPrice))}đ</p>
          </div>
        )
      },
    },
    {
      title: 'Method',
      dataIndex: 'transactionMethod',
      key: 'transactionMethod',
      align: 'center',
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
          <>
            {record.paymentstatus === '0' ? (
              <p>Not Payment</p>
            ) : record.paymentstatus === '1' ? (
              <p>Payment</p>
            ) : (
              <p>Failure</p>
            )}
            {record.paymentstatus !== '1' &&
              record.transactionMethod !== 'cash' &&
              record.deliveryStatus !== 'canceled' && (
                <Button
                  onClick={() => handlePayAgain(record.id)}
                  className="mt-[1rem] border-none hover:bg-[#a35d3e] text-[#FFFFFF] transition-all hover:!text-[#FFFFFF] duration-300] rounded-md bg-baseColor   "
                >
                  Pay again
                </Button>
              )}
          </>
        )
      },
    },
    {
      title: 'Note',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
    },
    {
      title: 'Action',
      dataIndex: 'cancel',
      key: 'cancel',
      align: 'center',
      render: (text: string, record: any) => {
        const handleCancelTransaction = async () => {
          try {
            const res = await transactionService.cancelTransaction(record.id)
            if (res.status === 200) {
              toast.success('Your transaction has been canceled!')
              const updatedData = transData.map((transaction) => {
                if (transaction.id === record.id) {
                  return { ...transaction, deliveryStatus: 'canceled' }
                }
                return transaction
              })
              setTransData(updatedData)
              setFilteredData(updatedData)
            }
          } catch (error) {
            toast.warning('Can not cancel transaction')
          }
        }
        return (
          <Button disabled={record.deliveryStatus !== 'confirmming'} type="default" onClick={handleCancelTransaction}>
            Cancel
          </Button>
        )
      },
    },
  ]

  useEffect(() => {
    transactionService
      .getTransactionByUserId(userId!)
      .then((res) => {
        setTransData(res.data)
        setFilteredData(res.data)
      })
      .catch((err) => console.log(err))
  }, [userId])

  return (
    <div>
      <div>
        <Select className="py-4" style={{ width: 200 }} defaultValue={'all'} onChange={handleDeliveryStatusFilter}>
          <Option value="all">All transaction</Option>
          <Option value="confirmming">Confirmming</Option>
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
        <Table dataSource={filteredData} columns={columns} />
      </div>
    </div>
  )
}
