import { Button, Divider, Input, Modal, Radio, message } from 'antd'
import { useEffect, useState } from 'react'
import { FixPriceFormat } from '../../../common/price-format/FixPrice'
import { SalePrice } from '../../../common/price-format/SalePrice'
import { useLocation, useNavigate } from 'react-router'
import productService from '../../../service/admin-service/productService'
import { Review } from '../../../components/review'
import { toast } from 'react-toastify'
import { ArrowLeftOutlined } from '@ant-design/icons'

type productDataType = {
  id: number
  name: string
  slug: string
  price: number
  description: string
  salePrice: number
  coverImage: string
  sizes: any
  deletedAt: string | undefined
}

export const preventMinus = (e: any) => {
  if (e.code === 'Minus') {
    e.preventDefault()
  }
}

export const ProductDetailAdminContainer = () => {
  const [productData, setProductData] = useState<productDataType>()
  const location = useLocation()
  const data = location.state.status
  const productId = data.status
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleOk = () => {
    handleDeleteProduct()
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const handleDeleteProduct = () => {
    productService
      .deleteProduct(productId)
      .then((response) => {
        if (response.status === 200) {
          toast.success('Product deleted successfully')
          navigate('/admin/product')
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }
  useEffect(() => {
    try {
      productService
        .getProductDetail(productId)
        .then((res) => setProductData(res.data))
        .catch((err) => console.log(err))
    } catch (error) {}
  }, [productId])


  return (
    <div className="p-5">
      <div className="cursor-pointer pb-5" onClick={() => navigate(-1)}>
        <ArrowLeftOutlined className="text-xl" />
      </div>
      <div className="bg-[#FFFFFF] p-8 ">
        <div className="flex mb-5">
          <div className="relative">
            {productData?.deletedAt ? (
              <div className=" rounded-md text-[#FFFFFF] bg-baseColor w-fit py-1 px-4 absolute top-3 left-3">
                Product deleted
              </div>
            ) : null}
            <img
              className="w-[600px] shadow-md aspect-[1/1] rounded-md object-center"
              src={productData?.coverImage}
              alt={productData?.slug}
            ></img>
          </div>
          <div className="pl-12 w-full">
            <div className="text-[44px]">{productData?.name}</div>
            <div className="flex items-center">
              {productData?.salePrice! < productData?.price! ? (
                <div className="flex items-center gap-4">
                  <FixPriceFormat fontSize="16px" price={productData?.price} />
                  <SalePrice fontSize="26px" className="font-medium" salePrice={productData?.salePrice} />
                </div>
              ) : (
                <SalePrice fontSize="26px" className="font-medium" salePrice={productData?.salePrice} />
              )}
            </div>
            <p className="text-[18px] my-3">{productData?.description}</p>
            <div className="flex flex-col gap-3">
              {productData?.sizes.map((data: any) => (
                <div key={data.id} className="flex w-full items-center gap-10">
                  <div className="min-w-[100px]">
                    Size: <span className="font-medium text-lg">{data.name}</span>
                  </div>
                  <div className="min-w-[100px]">
                    Sale count: <span className="font-medium text-lg">{data.Product_Size.saleCount}</span>
                  </div>
                  <div className="min-w-[100px]">
                    Remain: <span className="font-medium text-lg">{data.Product_Size.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Divider />

        <div className="flex justify-between px-4">
          {!productData?.deletedAt ? (
            <Button
              className="block w-[180px] h-[40px] bg-white border  hover:bg-baseColor hover:!text-[#FFFFFF] rounded-md transition-all hover:font-medium"
              onClick={() => navigate('/admin/product/update', { state: { status: { id: productId } } })}
              type="default"
            >
              Update Product
            </Button>
          ) : null}

          {!productData?.deletedAt ? (
            <Button
              onClick={showModal}
              type="default"
              className="block w-[150px] h-[40px] bg-white border  hover:bg-[#777] hover:!text-[#FFFFFF] rounded-md transition-all hover:font-medium"
            >
              Delete Product
            </Button>
          ) : null}
        </div>
        {!productData?.deletedAt && <Divider />}

        <div className="bg-[#FFFFFF] mt-4 py-4 px-[2vh]">
          <Review productId={+productId} isAdmin={true} />
        </div>
        <Modal open={isModalOpen} onOk={handleOk} okButtonProps={{ type: 'default' }} onCancel={handleCancel}>
          <div className="p-5">
            <p className="text-[20px] font-medium">DO YOU WANT TO DELETE</p>
          </div>
        </Modal>
      </div>
    </div>
  )
}
