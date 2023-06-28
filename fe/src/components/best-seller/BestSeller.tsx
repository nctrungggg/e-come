import { useEffect, useState } from 'react'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
import ProductItem from '../item/Item'
import productService from '../../service/productService'
import { BestSellerData } from './type'

const BestSeller = () => {
  const [bestSellerData, setBestSellerData] = useState<BestSellerData[]>([])

  useEffect(() => {
    productService
      .getBestSellerProduct()
      .then((res) => setBestSellerData(res.data))
      .catch((err) => console.log(err))
  }, [])
  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  }
  return (
    <div className="mt-[8vh] bg-[#FFFFFF] rounded-[12px] pb-[4vh]">
      <p className="text-[30px] flex justify-center pt-4">BEST SELLER</p>

      <div className="mb-4">
        <Carousel
          autoPlaySpeed={2000}
          customTransition="all .5s"
          responsive={responsive}
          autoPlay={true}
          itemClass="carousel-item-padding-40-px"
          infinite={true}
          draggable={false}
        >
          {bestSellerData?.map((data: BestSellerData) => (
            <ProductItem
              key={data.id}
              salePrice={data.salePrice}
              id={data.id}
              coverImage={data.coverImage}
              name={data.name}
              price={data.price}
            />
          ))}
        </Carousel>
      </div>
    </div>
  )
}

export default BestSeller
