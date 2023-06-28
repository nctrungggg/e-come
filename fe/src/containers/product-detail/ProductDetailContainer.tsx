import { Divider, Input, Modal, Radio, message } from 'antd'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FixPriceFormat } from '../../common/price-format/FixPrice'
import { SalePrice } from '../../common/price-format/SalePrice'
import { Review } from '../../components/review'
import { addToCart } from '../../redux/slice/cartSlice'
import { RootState } from '../../redux/store'
import productService from '../../service/productService'
import { toast } from 'react-toastify'
import SizeChart from '../../assets/texture/Size-chart-swimsuit-all_3x_c5e1f1a0-68aa-4fbf-b314-a8491ea802fb.webp'
import SizeChartGlasses from '../../assets/texture/size-mat-kinh-final.jpeg'
import { useNavigate } from 'react-router'

type ProductItemProps = {
  productId: string
}

type productDataType = {
  id: number
  name: string
  slug: string
  price: number
  description: string
  salePrice: number
  coverImage: string
  sizes: any
  category: any
  deletedAt?: any
}

type sizeType = {
  id: number
  name: string
}

export const preventMinus = (e: any) => {
  if (e.code === 'Minus') {
    e.preventDefault()
  }
}

export const ProductDetailContainer = ({ productId }: ProductItemProps) => {
  const userData = useSelector((state: RootState) => state.auth)
  const [productData, setProductData] = useState<productDataType>()
  const [sizeData, setSizeData] = useState<any>()
  const [size, setSize] = useState<sizeType>()
  const [sizeQuantity, setSizeQuantity] = useState<number>()
  const [quantity, setQuantity] = useState(1)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  console.log(productData)

  useEffect(() => {
    if (productId) {
      productService
        .getProductDetail(productId)
        .then((res) => {
          setProductData(res.data)
          setSizeData(
            res.data.sizes.map((size: any) => ({ quantity: size.Product_Size.quantity, id: size.Product_Size.sizeId }))
          )
        })
        .catch((err) => console.log(err))
    }
  }, [productId, setProductData])

  const handleAddToCart = () => {
    if (quantity > sizeQuantity!) {
      toast.error('The quantity of product do not enough')
    } else if (!userData.isLoggedIn) {
      toast.warning('Please login before add to cart !')
    } else if (size === undefined) {
      toast.warning('Please choose a size !')
    } else {
      dispatch(
        addToCart({
          size: size,
          id: productData?.id!,
          name: productData?.name!,
          price: productData?.salePrice! < productData?.price! ? productData?.salePrice! : productData?.price!,
          quantity: quantity,
          coverImage: productData?.coverImage!,
        })
      )
      toast.success('Product was added successfully')
    }
  }

  const onChange = (event: any) => {
    if (event.target.value === '0') {
      alert('Quantity > 0')
    } else {
      setQuantity(event.target.value)
    }
  }

  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleOk = () => {
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  useEffect(() => {
    if (productData?.deletedAt) {
      toast.error('This product has been deleted.', {})
      navigate(-1)
    }
  }, [navigate, productData?.deletedAt, productId])

  return (
    <div className=" px-[8%] mt-[4vh] py-[2vh]">
      <div className="flex w-full bg-[#FFFFFF] p-[4vh]">
        <div className="basis-[50%] mr-[40px]">
          <div className="relative">
            {productData?.deletedAt ? (
              <div className=" rounded-md text-[#FFFFFF] bg-baseColor w-fit py-1 px-4 absolute top-3 left-3">
                Product deleted
              </div>
            ) : null}
            <img
              className="w-full aspect-[1/1] object-center rounded-md shadow-md"
              src={productData?.coverImage}
              alt={productData?.slug}
            ></img>
          </div>
        </div>
        <div className="basis-[50%] flex-col pl-[50px] pr-[50px]">
          <div className="text-[44px] font-medium">{productData?.name}</div>
          <div className="flex items-center my-3">
            {Number(productData?.price) - Number(productData?.salePrice) !== 0 && (
              <FixPriceFormat fontSize="16px" price={productData?.price} />
            )}
            <SalePrice className="!text-3xl font-medium" fontSize="24px" salePrice={productData?.salePrice} />
          </div>
          <p className="text-[16px]">{productData?.description}</p>
          <Divider />
          <div className="flex items-center gap-[40px]">
            <p className="">Size: </p>
            <div className="flex items-center">
              <Radio.Group defaultValue={size} className="flex gap-2">
                {productData?.sizes
                  .sort((a: any, b: any) => {
                    // Sắp xếp các size theo thứ tự từ S, M, L, XL, XXL, XXXL...
                    const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
                    return sizeOrder.indexOf(a.name) - sizeOrder.indexOf(b.name)
                  })
                  .map((size: any) => (
                    <Radio.Button
                      value={size.name}
                      onClick={() => {
                        setSize({ name: size.name, id: size.id })
                        setSizeQuantity(sizeData.find((item: any) => item.id === size.id).quantity)
                      }}
                      className="border focus:bg-baseColor active:duration-[300ms]"
                      key={size.id}
                    >
                      {size.name}
                    </Radio.Button>
                  ))}
              </Radio.Group>
            </div>
            {sizeQuantity ? <div className="text-[13px] ml-auto">Quantity Size: {sizeQuantity} </div> : null}
          </div>
          <div className="flex mt-6 items-center">
            <div className="pr-3">Quantity: </div>
            <Input
              min={1}
              onKeyPress={preventMinus}
              // style={{ fontSize: 24, width: '150px' }}
              defaultValue={1}
              placeholder="1"
              className="w-[17%] h-[32px]"
              type="number"
              onChange={onChange}
            />
          </div>

          <div className="mt-5 text-end text-sm underline cursor-pointer text-[#595959]" onClick={showModal}>
            Size Chart
          </div>
          <Modal className="w-[500px] h-[500px]" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
            {productData?.category.name === 'Glasses' && (
              <img className="w-full h-full object-cover pt-10 px-10" src={SizeChartGlasses} alt="size-chart" />
            )}
            {productData?.category.name !== 'Glasses' && (
              <img className="w-full h-full object-cover pt-10 px-10" src={SizeChart} alt="size-chart" />
            )}
          </Modal>

          <Divider />
          <button
            disabled={productData?.deletedAt}
            onClick={handleAddToCart}
            className={`w-full h-[50px] mt-5 rounded-md bg-baseColor  hover:bg-[#a35d3e] text-[#FFFFFF] transition-all  duration-300 ${
              productData?.deletedAt && 'cursor-not-allowed'
            }`}
          >
            <p className="font-medium text-lg">ADD TO CARD</p>
          </button>
        </div>
      </div>
      <div className="bg-[#FFFFFF] mt-4 p-4">
        <Review productId={+productId} userId={userData.user?.id!} />
      </div>
    </div>
  )
}
