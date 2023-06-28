import { formatPrice } from '../../utilities/formatPrice'

interface FixPriceFormatProps {
  salePrice?: number | undefined
  fontSize?: string
  className?: string
}
export const SalePrice = (props: FixPriceFormatProps) => {
  const { salePrice, fontSize, className } = props
  return (
    <span style={{ fontSize: fontSize }} className={`${className} text-[16px] flex  text-baseColor `}>
      {formatPrice(salePrice)}đ
    </span>
  )
}
