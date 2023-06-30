import { CloseOutlined, DownOutlined } from '@ant-design/icons'
import { Checkbox, Col, Pagination, Row, Select } from 'antd'
import { TreeProps } from 'antd/es/tree'
import { useCallback, useEffect, useState } from 'react'
import ProductItem from '../../components/item/Item'
import typeService from '../../service/typeService'
import { Tree } from 'antd'
import { useLocation } from 'react-router'
import { ProductData, ProductType } from './type'
import productService from '../../service/productService'
import bannerMen from '../../assets/banner/nam.jpg'
import bannerWomen from '../../assets/banner/nu.jpg'
import bannerKids from '../../assets/banner/treem.jpg'
import { Key } from 'antd/lib/table/interface'
import { preventMinus } from '../product-detail/ProductDetailContainer'
import { Radio } from 'antd'

type SelectedOptionType = {
  bigCategory?: string
  category?: string
  price?: {
    maxPrice: number
    minPrice: number
  }
}

type TPriceFiler = {
  minPrice: number
  maxPrice: number
}

const ProductPageContainer = () => {
  const location = useLocation()
  const path = location.pathname.replace('/', '')

  const [treeData, setTreeData] = useState([])
  const [productData, setProductData] = useState<ProductData[]>([])
  const [filterOption, setFilterOption] = useState<SelectedOptionType>()
  const [filterData, setFilterData] = useState<ProductData[]>([])
  const [priceFilter, setPriceFilter] = useState<TPriceFiler>({
    minPrice: 0,
    maxPrice: 0,
  })
  const [sortOrder, setSortOrder] = useState<any>()
  const [isOnSale, setIsOnSale] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)

  console.log(productData)

  const PAGE_SIZE = 12
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = currentPage * PAGE_SIZE

  // Lấy danh sách sản phẩm trên trang hiện tại
  const currentProducts = filterData?.slice(startIndex, endIndex)

  const handlePageChange = (page: any) => {
    setCurrentPage(page)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultSelectedKeys = [] as Key[]
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([])

  const handleExpand = (expandedKeys: Key[]) => {
    setExpandedKeys(expandedKeys)
  }

  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    setFilterOption(getValueFromKey(selectedKeys[0]))
  }

  const getValueFromKey = (key: any) => {
    const [bigCategory, category] = key.split('-')
    if (category) {
      return { category: category }
    } else {
      return { bigCategory: bigCategory }
    }
  }

  const buildTreeData = useCallback((data: any, parentId = '') => {
    return data.map((item: any) => {
      const id = parentId ? `${parentId}-${item.id}` : `${item.id}`
      const node = {
        key: id,
        title: item.name,
        children: item.categories ? buildTreeData(item.categories, id) : undefined,
      }
      return node
    })
  }, [])

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const id = queryParams.get('id')

    if (id) {
      defaultSelectedKeys.push(id)
      setExpandedKeys([id.split('-')[0]])
    }
    // Simulate an API call to fetch the data
    const fetchCategoryData = async () => {
      const response = await typeService.getTypeById((Object.keys(ProductType).indexOf(path) + 1).toString())

      const data = response.data?.big_categories

      // Transform the data into the format expected by the Tree component
      const transformedData = buildTreeData(data)

      setTreeData(transformedData)
    }
    fetchCategoryData()

    const fetchProductData = async () => {
      if (id) {
        productService
          .getProductByCategory(+id.split('-')[1])
          .then((res) => {
            setProductData(res.data)
            setFilterData(res.data)
            queryParams.delete('id')
            const newUrl = window.location.pathname + '?' + queryParams.toString()
            window.history.pushState({ path: newUrl }, '', newUrl)
          })
          .catch((errors) => console.log(errors))
      } else if (filterOption?.bigCategory) {
        productService.getProductByBigCategory(+filterOption?.bigCategory).then((res) => {
          setProductData(res.data)
          setFilterData(res.data)
        })
      } else if (filterOption?.category) {
        productService.getProductByCategory(+filterOption?.category).then((res) => {
          setProductData(res.data)
          setFilterData(res.data)
        })
      } else {
        productService.getProductByType(Object.keys(ProductType).indexOf(path) + 1).then((res) => {
          setProductData(res.data)
          setFilterData(res.data)
        })
      }
    }

    fetchProductData()
  }, [buildTreeData, filterOption?.bigCategory, filterOption?.category, path])

  const handleOnChangeMinPrice = (event: any) => {
    setPriceFilter({
      ...priceFilter,
      minPrice: event.target.value,
    })
  }

  const handleOnChangeMaxPrice = (event: any) => {
    setPriceFilter({
      ...priceFilter,
      maxPrice: event.target.value,
    })
  }

  const handleFilterProducts = (price: TPriceFiler, isOnSale: boolean, sortOrder: string) => {
    let filteredProducts = [...productData]

    if (price.maxPrice) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          (isOnSale &&
            product.salePrice < product.price &&
            product.salePrice >= price.minPrice &&
            product.salePrice <= price.maxPrice) ||
          (!isOnSale && product.price >= price.minPrice && product.price <= price.maxPrice)
      )
    } else if (isOnSale) {
      filteredProducts = filteredProducts.filter((product) => product.salePrice < product.price)
    }

    let sortedProducts = [...filteredProducts]
    if (sortOrder === 'DESC') {
      sortedProducts.sort((a, b) => b.salePrice - a.salePrice)
    } else if (sortOrder === 'ASC') {
      sortedProducts.sort((a, b) => a.salePrice - b.salePrice)
    }

    setFilterData(sortedProducts)
  }

  // Call handleFilterProducts when necessary
  useEffect(() => {
    handleFilterProducts(priceFilter, isOnSale, sortOrder)
  }, [isOnSale, sortOrder])

  const handleClearFitlerPrice = () => {
    setSortOrder('')
    setPriceFilter({
      minPrice: 0,
      maxPrice: 0,
    })
    setIsOnSale(false)

    setFilterData(productData) // Reset filterData về giá trị ban đầu
  }

  return (
    <div>
      {path === 'men' && <img className="h-[300px] w-full object-cover object-top" src={bannerMen} alt="" />}
      {path === 'women' && <img className="h-[300px] w-full object-cover object-top" src={bannerWomen} alt="" />}
      {path === 'kids' && <img className="h-[300px] w-full object-cover  object-top" src={bannerKids} alt="" />}
      <div className="flex pl-[8%] pr-[8%] bg-[#FFFFFF] pt-[12vh] pb-[4vh] ">
        <div className="basis-[25%]  ">
          <div className="text-[40px] font-medium">{path.toUpperCase()}</div>
          <div className="text-[18px] mt-6">
            Result:{' '}
            <span className="text-2xl font-medium">
              {filterData.length === 1 ? filterData.length + ' item' : filterData.length + ' items'}
            </span>
          </div>
          <div className="text-[24px] mt-4">Categories: </div>
          <div className="py-2">
            <Tree
              defaultExpandAll
              style={{ fontSize: '16px' }}
              showIcon
              onSelect={onSelect}
              switcherIcon={<DownOutlined />}
              treeData={treeData}
              defaultSelectedKeys={defaultSelectedKeys}
              expandedKeys={expandedKeys}
              onExpand={handleExpand}
            />
          </div>

          <div className="mt-5">
            <div className="text-[24px]">Price: </div>
            <Checkbox checked={isOnSale} onChange={(e) => setIsOnSale(e.target.checked)} className="text-base mt-2">
              Sale
            </Checkbox>
            <div>
              <Radio.Group
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="my-2 flex flex-col gap-2"
              >
                <Radio value="ASC" className="text-base">
                  Low to High
                </Radio>
                <Radio className="text-base" value="DESC">
                  High to Low
                </Radio>
              </Radio.Group>
            </div>
            <div className="relative pt-4">
              <div className="flex py-2">
                <input
                  type="number"
                  className="!w-[80px] input-field"
                  value={priceFilter.minPrice}
                  min={0}
                  onChange={(event) => handleOnChangeMinPrice(event)}
                  onKeyPress={preventMinus}
                />
                <div className="px-3">to</div>
                <input
                  type="number"
                  className="!w-[80px] input-field"
                  min={0}
                  value={priceFilter.maxPrice}
                  onChange={(event) => handleOnChangeMaxPrice(event)}
                  onKeyPress={preventMinus}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="w-[80px] h-[35px] border border-[#909090] mt-5 rounded-md text-[#000000de] transition-all duration-300 hover:bg-[#9d9d9d] hover:border-none hover:!text-[#FFFFFF]"
                onClick={handleClearFitlerPrice}
              >
                <p className="text-sm">RESET</p>
              </button>
              <button
                disabled={priceFilter.maxPrice === 0 ? true : false}
                className={`${
                  priceFilter.maxPrice === 0 ? 'cursor-not-allowed' : ''
                } w-[80px] h-[35px] mt-5 rounded-md bg-baseColor hover:bg-[#a35d3e] text-[#FFFFFF] transition-all duration-300`}
                onClick={() => handleFilterProducts(priceFilter, isOnSale, sortOrder)}
              >
                <p className="text-sm">REFINE</p>
              </button>
            </div>
          </div>
        </div>

        <div className="basis-[80%]">
          <div className="flex justify-between items-center">
            {/* <div className="text-[28px]">Sort by prize: </div> */}
            {/* <div>
              <Select
                value={sortOrder}
                defaultValue="Select to sort"
                onChange={handleChange}
                options={[
                  { value: 'ASC', label: 'Low to High' },
                  { value: 'DESC', label: 'High to Low' },
                ]}
              />
            </div> */}
          </div>

          <div className="text-[32px] mt-2">PRODUCTS: </div>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 8 }}>
            {currentProducts?.map((data) => (
              <Col
                className="gutter-row pb-2 hover:shadow-md transition-all duration-300 rounded-md hover:-translate-y-1 "
                span={6}
              >
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

          <div className="mt-16 flex justify-center">
            <Pagination
              current={currentPage}
              pageSize={PAGE_SIZE}
              total={filterData?.length}
              onChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPageContainer
