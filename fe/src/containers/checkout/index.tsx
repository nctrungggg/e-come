import { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { Divider, Input, message } from 'antd'
import dayjs from 'dayjs'
import { CheckoutItem } from './CheckoutItem'
import { SalePrice } from '../../common/price-format/SalePrice'
import { TProductCart } from '../../components/cart/type'
import { authService } from '../../service/authService'
import transactionService from '../../service/transactionService'
import paymentService from '../../service/paymentService'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
export type UserDetailData = {
  id: number
  name: string
  email: string
  gender: string
  birthday: string
  phone: string
  address: string
  avatar: string
}

export const CheckoutContainer = () => {
  const authData = useSelector((state: RootState) => state.auth)
  const cartData = useSelector((state: RootState) => state.cart)
  const [userInfor, setUserInfor] = useState<UserDetailData>()
  const [note, setNote] = useState('')
  const navigate = useNavigate()
  console.log(cartData)

  const getTotalPrice = (items: TProductCart[]) => {
    let totalPrice = 0
    for (const item of items) {
      totalPrice += item.price * item.quantity
    }
    return totalPrice
  }

  const totalPrice = getTotalPrice(cartData.items)

  const creataTransaction = useCallback(async () => {
    const dataSubmit = {
      userId: authData.user?.id,
      productList: cartData.items.map((item) => ({
        sizeId: item.size.id,
        productId: item.id,
        quantity: item.quantity,
      })),
      transactionMethod: 'cash',
      description: note,
      totalPrice: totalPrice,
    }
    try {
      const res = await transactionService.createTransaction(dataSubmit)
      if (res.status === 200) {
        toast.success('Your transaction was successfully')
        const data = { status: 1 }
        navigate('/result', { state: { status: data } })
      } else {
        toast.error('The number of products in stock is not enough')
      }
    } catch (error: any) {
      toast.error('The number of products in stock is not enough')
    }
  }, [authData.user?.id, cartData.items, navigate, note, totalPrice])

  const handleOnlinePayment = async () => {
    const dataSubmit = {
      userId: authData.user?.id,
      productList: cartData.items.map((item) => ({
        sizeId: item.size.id,
        productId: item.id,
        quantity: item.quantity,
      })),
      transactionMethod: 'vnpay',
      description: note,
      totalPrice: totalPrice,
    }
    try {
      const transaction = await transactionService.createTransaction(dataSubmit)
      if (!transaction) throw new Error('error')
      const paymentData = {
        transactionId: transaction.data.id,
        bankCode: 'VNBANK',
        language: 'vn',
      }
      const result = await paymentService.createPaymentURL(paymentData)
      window.location.href = result.data.url
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    authService
      .getUserProfile(authData.user?.id!)
      .then((res) => {
        setUserInfor(res.data)
      })
      .catch((err) => console.log(err))
  }, [authData.user?.id])

  return (
    <>
      {cartData.items.length > 0 ? (
        <div className="pl-[8%] pr-[8%] gap-5 bg-[#FFFFFF] my-[5vh] py-[6vh] flex">
          <div className="basis-[60%] px-4">
            <div className="text-[24px] font-medium mb-4">TRANSACTION DETAIL</div>
            <div className="">
              <div className="text-sm">Receiver:</div>
              <div className=" font-medium">{userInfor?.name}</div>
              <Divider className="bg-[#e5e5e5] mt-1" />
            </div>
            <div className="">
              <div className="text-sm">Email:</div>
              <div className=" font-medium"> {userInfor?.email}</div>
              <Divider className="bg-[#e5e5e5] mt-1" />
            </div>
            <div className="">
              <div className="text-sm">Phone:</div>
              <div className=" font-medium">{userInfor?.phone}</div>
              <Divider className="bg-[#e5e5e5] mt-1" />
            </div>
            <div className="">
              <div className="text-sm">Birthday:</div>
              <div className=" font-medium">
                {userInfor?.birthday ? dayjs(userInfor?.birthday).format('DD-MM-YYYY').toString() : null}
              </div>
              <Divider className="bg-[#e5e5e5] mt-1" />
            </div>
            <div className="">
              <div className="text-sm">Address:</div>
              <div className=" font-medium">{userInfor?.address}</div>
              <Divider className="bg-[#e5e5e5] mt-1" />
            </div>
            <div className="">
              <div className="text-sm mb-1">Addition Information: </div>
              <Input.TextArea autoSize={{ minRows: 3 }} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <div className="basis-[40%] p-5 border border-[#e5e5e5] rounded-md">
            <div className="text-[24px] font-medium">PRODUCTS</div>
            {cartData.items.map((data) => (
              <CheckoutItem
                quantity={data.quantity}
                size={data.size}
                price={data.price}
                id={data.id}
                name={data.name}
                coverImage={data.coverImage}
              />
            ))}
            <Divider className="bg-[#e5e5e5] mt-1" />
            <div className="flex justify-between pr-4">
              <div className="font-medium">TOTAL PRICE:</div>
              <SalePrice className="!text-3xl font-semibold" salePrice={getTotalPrice(cartData.items)} />
            </div>
            <Divider className="bg-[#e5e5e5] mt-2" />
            <div className="flex justify-center">
              <button
                onClick={() => {
                  creataTransaction()
                }}
                className="w-full h-[50px] mt-5 rounded-md bg-baseColor  hover:bg-[#a35d3e] text-[#FFFFFF] transition-all  duration-300] "
              >
                <p className="font-medium text-lg">PAYMENT ON DELIVERY</p>
              </button>
            </div>
            <div className="flex justify-center pt-4">
              <button
                className="w-full flex justify-center items-center h-[50px] rounded-md  border text-[#000] transition-all duration-300] hover:bg-baseColor hover:bg-opacity-60 hover:text-[#fff]"
                onClick={handleOnlinePayment}
              >
                <p className="font-medium text-lg">PAYMENT BY VNPAY</p>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center my-40">
          <p className="text-2xl ">
            NO PRODUCT ON THE CART,{' '}
            <span className="text-baseColor font-medium cursor-pointer underline" onClick={() => navigate('/men')}>
              BUY NOW !
            </span>
          </p>
        </div>
      )}
    </>
  )
}
