import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Modal, Tooltip } from 'antd'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { SalePrice } from '../../common/price-format/SalePrice'
import { addToCart, discreaseQuantity, removeFromCart } from '../../redux/slice/cartSlice'
import { TProductCart } from './type'

type TProps = { productCartData: TProductCart }

export const ProductCart: React.FC<TProps> = ({ productCartData }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleOk = () => {
    setIsModalOpen(false)
    dispatch(removeFromCart(productCartData))
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="flex mb-4 gap-8 items-center ">
      <div className=" w-[120px] pr-2 cursor-pointer" onClick={() => navigate(`/product/${productCartData.id}`)}>
        <img
          className="w-full h-full object-cover rounded-md"
          src={productCartData.coverImage}
          alt={productCartData.name}
        />
      </div>
      <p className="text-[18px] font-medium w-[200px]">{productCartData.name}</p>
      <div className="flex gap-2 items-center">
        <div className="flex  border border-[#333] rounded-[5px] w-fit">
          <MinusOutlined
            className="text-[12px] mx-2"
            onClick={() =>
              dispatch(
                discreaseQuantity({
                  size: productCartData.size,
                  name: productCartData.name,
                  price: productCartData.price,
                  id: productCartData.id,
                  coverImage: productCartData.coverImage,
                  quantity: 1,
                })
              )
            }
          />
          <span className="text-[16px]">{productCartData.quantity}</span>
          <PlusOutlined
            className="text-[12px] mx-2"
            onClick={() => {
              dispatch(
                addToCart({
                  size: productCartData.size,
                  name: productCartData.name,
                  price: productCartData.price,
                  id: productCartData.id,
                  coverImage: productCartData.coverImage,
                  quantity: 1,
                })
              )
            }}
          />
        </div>
        <p className="text-sm">
          Size: <span className="font-medium text-base">{productCartData.size.name}</span>
        </p>
      </div>

      <div className="flex items-center">
        <span className="text-[16px] mr-2">Price:</span>{' '}
        <SalePrice className="text-xl font-medium" salePrice={productCartData.price * productCartData.quantity} />
      </div>
      {/* onClick={() => dispatch(removeFromCart(productCartData)) */}
      <button onClick={showModal} className="text-[24px] mr-4 ml-auto">
        <Tooltip placement="top" title="Delete">
          <DeleteOutlined />
        </Tooltip>
      </button>
      <Modal
        title="DO YOU WANT TO DELETE?"
        className="w-[500px] h-[500px]"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      ></Modal>
    </div>
  )
}
