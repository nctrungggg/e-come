import { Col, Divider, Row } from 'antd'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import productService from '../../service/productService'
import ProductItem from '../../components/item/Item'

export type SearchDataProps = {
  id: number
  name: string
  slug?: string
  price: number
  description?: string
  coverImage: string
  salePrice: number
  sizes?: any
}

export const SearchContainer = () => {
  const param = useParams()
  const [dataSearch, setDataSearch] = useState<SearchDataProps[]>([])

  useEffect(() => {
    productService
      .getProductByName(param.name!)
      .then((res) => setDataSearch(res.data))
      .catch((err) => console.log(err))
  }, [param.name, setDataSearch])

  return (
    <div className="pl-[8%] pr-[8%] bg-[#FFFFFF] my-[4vh] py-[4vh] text-[18px]">
      <div className="flex gap-2 items-center mb-4">
        <div className="">SEARCH RESULTS FOR:</div>
        <div className="font-medium text-3xl">{param.name?.toUpperCase()}</div>
      </div>
      <div className="mb-4">
        <div>RESULTS:</div>
        {dataSearch ? <div className="font-medium text-xl">{dataSearch?.length} PRODUCTS</div> : null}
      </div>
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="pr-2 pl-2">
        {dataSearch.map((data) => (
          <Col className="gutter-row " span={6}>
            <ProductItem
              sizes={data.sizes}
              salePrice={data.salePrice}
              description={data.description}
              slug="1"
              id={data.id}
              coverImage={data.coverImage}
              name={data.name}
              price={data.price}
            />
          </Col>
        ))}
      </Row>
    </div>
  )
}
