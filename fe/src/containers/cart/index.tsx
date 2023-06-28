import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { TProductCart } from './type'
import { ProductCart } from './ProductCart'
import { formatPrice } from '../../utilities/formatPrice'
import { NavLink, useNavigate } from 'react-router-dom'

export const CartContainer = () => {
  const navigate = useNavigate()

  const carts = useSelector((state: RootState) => state.cart)

  const getTotalPrice = (items: TProductCart[]) => {
    let totalPrice = 0
    for (const item of items) {
      totalPrice += item.price * item.quantity
    }
    return totalPrice
  }

  return (
    <div className="p-10 flex gap-8">
      <div className="bg-[#FFFFFF] p-6 w-[65%] rounded-md max-h-[600px] overflow-auto">
        <div className=" mb-5">
          <span className="text-2xl font-medium ">CART({carts.items.length})</span>
        </div>

        {carts.items.length === 0 ? (
          <div className="h-[60px] text-center">
            <p className="text-2xl ">
              NO PRODUCT ON THE CART,{' '}
              <span className="text-baseColor font-medium cursor-pointer underline" onClick={() => navigate('/men')}>
                BUY NOW !
              </span>
            </p>
          </div>
        ) : (
          carts.items.map((cart) => <ProductCart productCartData={cart} />)
        )}
      </div>
      <div className="flex-1">
        <div className="border border-[#e0e0e0] p-4 rounded-md">
          <div className="">
            <div>{`ORDER SUMMARY | ${carts.items.length} ITEM (S)`}</div>
            <div className="flex items-center mt-4">
              <div className="font-medium text-[#000]">TOTAL PRICE: </div>
              <div className="ml-3 text-baseColor font-semibold text-3xl">
                {formatPrice(getTotalPrice(carts.items))}đ
              </div>
            </div>
          </div>
        </div>

        <button
          className={`${
            carts.items.length <= 0 && 'cursor-not-allowed'
          } w-full flex justify-center items-center h-[50px] mt-5 rounded-md bg-baseColor  ${
            carts.items.length > 0 && 'hover:bg-[#a35d3e]'
          } text-[#FFFFFF] transition-all  duration-300] `}
          disabled={carts.items.length <= 0}
          onClick={() => navigate('/checkout')}
        >
          <p className="font-medium text-lg">ODER NOW</p>
        </button>
        <NavLink
          to={'/'}
          className="w-full flex justify-center items-center h-[50px] mt-5 rounded-md  border  text-[#000] transition-all  duration-300] "
        >
          <p className="font-medium text-lg">CONTINUE SHOPPING</p>
        </NavLink>
        <p className="mt-5 text-[#7d7d7d] text-sm">
          If you purchase additional 1.001.000 VND (VAT included), or choose Click & Collect, you will get free
          shipping.
        </p>
      </div>
    </div>
  )
}
