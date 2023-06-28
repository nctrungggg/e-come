import 'react-multi-carousel/lib/styles.css'
import { Col, Row } from 'antd'
import ProductItem from '../item/Item'
import { TNewestData } from './type'
import { useEffect, useState } from 'react'
import productService from '../../service/productService'

const New = () => {
  const [newItem, setNewItem] = useState<TNewestData[]>([])
  useEffect(() => {
    productService
      .getNewestProduct(8)
      .then((res) => setNewItem(res.data))
      .catch((err) => console.log(err))
  }, [])
  return (
    <div className="mt-[8vh] bg-[#FFFFFF] rounded-[12px] pb-[8vh] px-4">
      <p className="text-[30px] flex justify-center mb-8 pt-4">NEW ARRIVALS</p>

      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 8 }} className="pr-2 pl-2">
        {newItem.map((data) => (
          <Col className="gutter-row " span={6} key={data.id}>
            <ProductItem
              salePrice={data.salePrice}
              id={data.id}
              coverImage={data.coverImage}
              name={data.name}
              price={data.price}
              className="hover:-translate-y-1 "
            />
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default New
