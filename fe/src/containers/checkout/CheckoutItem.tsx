import React from 'react'
import { SalePrice } from '../../common/price-format/SalePrice'

type CheckoutItemProps = {
  id: number
  name: string
  coverImage: string
  price: number
  quantity: number
  size: {
    id: number
    name: string
  }
}

export const CheckoutItem = (item: CheckoutItemProps) => {
  return (
    <div>
      <div className="flex p-2 items-center">
        <div className=" w-[120px] pr-2">
          <img src={item.coverImage} alt={item.name} className="rounded-md" />
        </div>
        <div className="basis-[100%]">
          <p className="text-[16px] font-medium">{item.name}</p>
          <div className="flex items-center mt-2 mb-1">
            <div className="flex justify-start items-center w-fit mr-12">
              <p className="text-sm">
                Quantity: <span className="text-base font-medium"> {item.quantity}</span>
              </p>
            </div>
            <span className="text-sm mr-2">Price:</span>{' '}
            <SalePrice className="font-medium" salePrice={item.price * item.quantity} />
          </div>

          <div className="text-sm">
            Size: <span className="text-base font-medium"> {item.size.name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
