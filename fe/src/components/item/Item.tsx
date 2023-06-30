import { useNavigate } from 'react-router-dom'
import { ProductData } from '../../containers/product/type'
import { FixPriceFormat } from '../../common/price-format/FixPrice'
import { SalePrice } from '../../common/price-format/SalePrice'
import { useDispatch } from 'react-redux'
import { addToRecently } from '../../redux/slice/recentlySlice'

const ProductItem = ({ coverImage, name, price, id, salePrice, className }: ProductData) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  console.log(id)

  return (
    <div
      onClick={() => {
        navigate(`/product/${id.toString()}`)
        dispatch(addToRecently({ id, coverImage, name, price, salePrice }))
      }}
      className={`${className}flex-col mr-5 ml-5 mt-8 justify-center items-center cursor-pointer transition-all`}
    >
      <div className="relative">
        <img src={coverImage} alt={name} className="rounded-md w-[240px] aspect-[1/1] object-center" />
        {salePrice < price ? (
          <div className="absolute bg-[#FFFFFF] text-baseColor rounded-sm  border top-3 left-3 px-2">
            -{Math.round((1 - salePrice / price) * 100)}%
          </div>
        ) : null}
      </div>
      <p className=" pt-2 font-medium text-[15px] clamp-text ">{name}</p>
      {salePrice < price ? (
        <div className="flex ">
          <FixPriceFormat className="font-light" price={price} />
          <SalePrice className="text-[17px]" salePrice={salePrice} />
        </div>
      ) : (
        <SalePrice className="text-[17px]" salePrice={price} />
      )}
    </div>
  )
}

export default ProductItem
