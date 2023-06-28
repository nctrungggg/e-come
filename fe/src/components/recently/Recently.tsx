import 'react-multi-carousel/lib/styles.css'
import Carousel from 'react-multi-carousel'
import ProductItem from '../item/Item'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'

const Recently = () => {
  const responsive = {
    superLargeDesktop: {
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

  const recently = useSelector((state: RootState) => state.recently)

  return (
    <div className="mt-[8vh] bg-[#FFFFFF] rounded-[12px] pb-[4vh]">
      <p className="text-[30px] flex justify-center pt-4">YOU RECENTLY WATCH</p>

      <div className="mb-4">
        <Carousel
          responsive={responsive}
          autoPlaySpeed={2000}
          autoPlay={true}
          customTransition="all .5s"
          itemClass="carousel-item-padding-40-px"
          infinite
          draggable={false}
        >
          {recently.items.map((data) => (
            <ProductItem
              key={data.id}
              coverImage={data.coverImage}
              name={data.name}
              price={data.price}
              id={+data.id}
              salePrice={data.salePrice}
            />
          ))}
        </Carousel>
      </div>
    </div>
  )
}

export default Recently
