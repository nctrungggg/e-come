import { ColumnsType } from 'antd/es/table'
import { Button, Table, Select, Input } from 'antd'
import { useEffect, useState } from 'react'
import productService from '../../../service/admin-service/productService'
import { formatPrice } from '../../../utilities/formatPrice'
import { useNavigate } from 'react-router-dom'
import { CloseCircleFilled, CloseOutlined } from '@ant-design/icons'

type ProductType = {
  id: number
  name: string
  description: string
  price: number
  salePrice: number
  coverImage: string
  category: any
  deletedAt: any | null
}

type ProductTable = {
  id: number
  name: string
  description: string
  price: number
  salePrice: number
  coverImage: string
  category: any
  deletedAt: any | null
}

type BigCategoryType = {
  id: number
  name: string
  product: ProductType[]
}
const { Search } = Input
export const ProductAdminPageContainer = () => {
  const [productData, setProductData] = useState<ProductType[]>([])
  const [initialData, setInitialData] = useState<ProductType[]>([])
  const [dataSource, setDateSource] = useState<BigCategoryType[]>([])
  const [typeSelected, setTypeSelected] = useState(0)
  const [bigCategoryOptions, setBigCategoryOptions] = useState<any>([])
  const [inputSearch, setInputSearch] = useState('')

  console.log(productData)

  const typeOptions = [
    {
      value: 0,
      label: 'All',
    },
    {
      value: 1,
      label: 'MEN',
    },
    {
      value: 2,
      label: 'WOMEN',
    },
    {
      value: 3,
      label: 'KIDS',
    },
  ]
  const [bigCategorySelect, setCategorySelect] = useState()
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const navigate = useNavigate()

  const handleSearchNameInput = (val: string) => {
    const filterData = initialData.filter((value) => value.name.toLowerCase().includes(val.toLowerCase()))
    setProductData(filterData)
  }
  const handlePageChange = (page: any) => {
    setCurrentPage(page)
  }
  useEffect(() => {
    try {
      productService
        .getAllProductPagination(currentPage)
        .then((res) => {
          setProductData(res.data)
          setInitialData(res.data)
          setTotal(res.data.length)
        })
        .catch((err) => console.log(err))
    } catch (error) {}
  }, [currentPage])

  useEffect(() => {
    productService
      .filterProduct(typeSelected!)
      .then((res) => {
        if (!!typeSelected) {
          const result = res?.data.big_categories.map((bigCategory: any) => {
            let value = []
            for (const category of bigCategory.categories) {
              for (const product of category.products) {
                value.push(product)
              }
            }
            return {
              ...bigCategory,
              categories: null,
              products: value,
            }
          })
          let products = []
          for (const value of result) {
            products.push(...value.products)
          }
          let bigCategories = []
          for (const value of result) {
            bigCategories.push({
              value: value.id,
              label: value.name,
            })
          }
          setBigCategoryOptions(bigCategories)
          setProductData(products)
          setInitialData(products)
          setTotal(products.length)
          setDateSource(result)
        } else {
          productService
            .getAllProductPagination(currentPage)
            .then((res) => {
              setProductData(res.data)
              setInitialData(res.data)
            })
            .catch((err) => console.log(err))
        }
      })
      .catch((e) => {
        console.log(e)
      })
  }, [typeSelected])
  useEffect(() => {
    //@ts-ignore
    setProductData(dataSource.find((value) => value.id === bigCategorySelect!)?.products)
  }, [bigCategorySelect])

  useEffect(() => {
    setTotal(productData?.length ?? 0)
  }, [productData])

  const columns: ColumnsType<ProductTable> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: any, record: any) => {
        return <div className=" text-baseColor cursor-pointer font-medium">{record?.name}</div>
      },
    },
    {
      title: 'Image',
      dataIndex: 'coverImage',
      key: 'coverImage',
      align: 'center',
      render: (text: any, record: any) => <img className="w-[90px] rounded-md" src={record.coverImage} alt="" />,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      width: '10%',
      sorter: (a, b) => a.price - b.price,
      render: (text: any, record: any) => <p className="font-medium"> {formatPrice(record.price)} đ</p>,
    },
    {
      title: 'Sale price',
      dataIndex: 'salePrice',
      key: 'salePrice',
      align: 'center',
      width: '10%',
      render: (text: any, record: any) => <p className="font-medium"> {formatPrice(record.salePrice)} đ</p>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      align: 'center',
      render: (text: any, record: any) => <div>{record.category?.name}</div>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Status',
      dataIndex: 'deletedAt',
      key: 'deletedAt',
      align: 'center',
      render: (text: any, record: any) =>
        record.deletedAt === null ? (
          <div className=" flex justify-center items-center border rounded-md text-[#FFFFFF] bg-[#2d7044] p-2">
            Active
          </div>
        ) : (
          <div className="text-sm flex justify-center items-center border text-[#ddd] rounded-md bg-[#555] p-2 cursor-none">
            Deleted
          </div>
        ),
      filters: [
        {
          text: 'Active',
          value: true,
        },
        {
          text: 'Deleted',
          value: false,
        },
      ],
      onFilter: (value, record) => value === (record.deletedAt === null),
    },
  ]

  const handleRowDoubleClick = (record: any) => {
    const data = { status: record.id }
    console.log(data)

    navigate(`/admin/product/${record.id}`, { state: { status: data } })
  }

  return (
    <div className="p-5">
      <div className="p-8 bg-[#FFFFFF]">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-8">
            <div className="flex gap-[10px]">
              <Select
                style={{ width: 160 }}
                placeholder="Choose type"
                optionFilterProp="children"
                onChange={(e) => setTypeSelected(e)}
                options={typeOptions}
                value={typeSelected}
              />
              <Select
                showSearch
                style={{ width: 160 }}
                placeholder="Choose big category"
                optionFilterProp="children"
                onChange={(e) => setCategorySelect(e)}
                options={bigCategoryOptions}
                disabled={!typeSelected}
              />
            </div>
            <div>
              <Search
                onChange={(e: any) => setInputSearch(e.target.value)}
                onSearch={handleSearchNameInput}
                value={inputSearch}
                placeholder="Enter product name ..."
                className="w-[280px] h-[40px]"
              />
            </div>
          </div>
          <Button
            className=" w-[150px] h-[40px] bg-white border  hover:bg-baseColor hover:!text-[#FFFFFF] hover:font-medium rounded-md transition-all"
            onClick={() => navigate('/admin/product/create')}
          >
            Create Product
          </Button>
        </div>
        <Table
          dataSource={productData}
          columns={columns}
          pagination={{
            current: currentPage,
            pageSize: 10,
            total: total,
            onChange: handlePageChange,
          }}
          onRow={(record) => ({
            onDoubleClick: () => handleRowDoubleClick(record),
          })}
        />
      </div>
      <style>{`.ant-btn.ant-btn-sm.ant-btn-primary{

    background-color: #7f4227;
        }`}</style>
    </div>
  )
}
