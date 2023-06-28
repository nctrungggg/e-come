// import BestSeller from "../../components/best-seller/BestSeller";
import BestSeller from '../../components/best-seller/BestSeller'
import CarouselImage from '../../components/carousel/carousel'
import New from '../../components/new-item/New'
import { News } from '../../components/news/News'
import Recently from '../../components/recently/Recently'

const HomePageContainer = () => {
  return (
    <div className="bg-[#f5f5f5]">
      <CarouselImage />
      <div className="pl-[8%] pr-[8%] ">
        <BestSeller />
        <New />
        <Recently />
        <News />
      </div>
    </div>
  )
}

export default HomePageContainer
