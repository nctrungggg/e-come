import { ShoppingCartOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from '../../redux/store'

export const CartIcon = () => {
  const navigate = useNavigate()
  const carts = useSelector((state: RootState) => state.cart)

  return (
    <div className="relative">
      <ShoppingCartOutlined
        onClick={() => navigate('/cart')}
        className="relative p-3 hover:text-baseColor cursor-pointer text-[28px]"
      />{' '}
      {carts.items.length > 0 && (
        <p className="absolute top-[6px] right-[6px] w-[15px] h-[15px] text-[10px] flex justify-center items-center text-[#FFFFFF] bg-baseColor rounded-full">
          {carts.items.length}
        </p>
      )}
    </div>
  )
}
