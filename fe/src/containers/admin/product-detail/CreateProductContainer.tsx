import { Button, Checkbox, Form, Input, Progress, Select, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface'
import Upload, { RcFile } from 'antd/es/upload'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import storage from '../../../firebaseConfig'
import bigCategoriesService from '../../../service/admin-service/bigCategoryService'
import categoriesService from '../../../service/admin-service/categoryService'
import sizeService from '../../../service/admin-service/sizeService'
import { ArrowLeftOutlined, CloseCircleOutlined, UploadOutlined } from '@ant-design/icons'
import productService from '../../../service/admin-service/productService'
import { useLocation, useNavigate } from 'react-router'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { toast } from 'react-toastify'
import { preventMinus } from '../../product-detail/ProductDetailContainer'

type SizeType = {
  sizeId: string
  sizeQuantity: number
}

type ProductType = {
  name: string
  price: number
  description: string
  coverImage: string
  salePrice: number
  categoryId: any
  categoryName: string
  bigCategoryId: string
  bigCategoryName: string
  typeId: string
  typeName: string
  sizes: SizeType[]
}

type TPops = {
  isUpdate?: boolean
}

export const CreateProductContainer: React.FC<TPops> = ({ isUpdate }) => {
  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<ProductType>()
  const location = useLocation()
  const data = location.state?.status
  const productId = data?.id
  const navigate = useNavigate()

  const { fields, remove, append } = useFieldArray({
    name: 'sizes',
    control,
    rules: {
      required: 'Please select a size',
    },
  })

  const [percent, setPercent] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const typeOptions = [
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
  const [categoryOptions, setCategoryOptions] = useState([])
  const [bigCategoryOptions, setBigCategoryOptions] = useState([])

  const [typeSelected, setTypeSelected] = useState<string>()
  const [bigCategorySelect, setCategorySelect] = useState<string>()
  const [sizeData, setSizeData] = useState([])
  const [checked, setChecked] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<number>()
  const priceWatch = watch('price')

  const onChange = (e: CheckboxChangeEvent) => {
    setChecked(e.target.checked)
  }

  const onSubmit = () => {
    const data = getValues()

    if (!checked) {
      data.salePrice = priceWatch
    }

    const dataSubmit = {
      ...data,
      categoryId: selectedCategory,
    }

    const isAllSizesEmpty = data.sizes.every((size) => size.sizeId === '' || Number(size.sizeQuantity) === 0)
    if (isAllSizesEmpty) {
      return toast.warning('You have not selected the size and quantity')
    }

    if (!checked || data.salePrice === undefined) {
      data.salePrice = priceWatch
    }

    if (!data.coverImage) {
      return toast.warning("You haven't selected a photo yet")
    }

    if (!isUpdate) {
      productService
        .createProduct(dataSubmit)
        .then((res) => {
          toast.success('Create product successfully')
          // navigate('/admin/product')
        })
        .catch((err) => {
          toast.error('Something went wrong')
        })
    } else {
      productService
        .updateProduct(productId, dataSubmit)
        .then((res: any) => {
          toast.success('Update product successfully')
          navigate('/admin/product')
        })
        .catch((err: any) => {
          toast.error('Something went wrong')
        })
    }
  }

  useEffect(() => {
    if (isUpdate) {
      productService
        .getProductDetail(productId)
        .then((res) => {
          setValue('name', res.data?.name!)
          setValue('price', res.data?.price!)
          setValue('description', res.data?.description!)
          setPreviewUrl(res.data?.coverImage!)
          setValue('coverImage', res.data?.coverImage!)
          setValue('salePrice', res.data?.salePrice!)
          setValue('typeName', res.data?.category.big_category.type.name)
          setValue('bigCategoryName', res.data?.category.big_category.name)
          setValue('categoryId', res.data?.category.name)
          setSelectedCategory(res.data?.category.id)
          setValue(
            'sizes',
            res.data?.sizes!.map((size: any) => ({
              sizeId: size.id,
              sizeQuantity: size.Product_Size.quantity.toString(),
            }))
          )

          if (res.data?.salePrice! < res.data?.price!) {
            setChecked(true)
          } else {
            setChecked(false)
          }
        })
        .catch((err) => console.log(err))
    }
  }, [isUpdate, productId, setValue])

  useEffect(() => {
    bigCategoriesService
      .getCategoryByType(+typeSelected!)
      .then((res) =>
        setBigCategoryOptions(
          res.data?.map((data: any) => {
            return {
              value: data.id,
              label: data.name,
            }
          })
        )
      )
      .catch((err) => console.log(err))
  }, [typeSelected])

  useEffect(() => {
    categoriesService
      .getCategoryByBigCategory(+bigCategorySelect!)
      .then((res) =>
        setCategoryOptions(
          res.data?.map((data: any) => {
            return {
              value: data.id,
              label: data.name,
            }
          })
        )
      )
      .catch((err) => console.log(err))
  }, [bigCategorySelect, typeSelected])

  useEffect(() => {
    sizeService
      .getAllSize()
      .then((res) =>
        setSizeData(
          res.data?.map((data: any) => {
            return {
              value: data.id,
              label: data.name,
            }
          })
        )
      )
      .catch((err) => console.log(err))
  }, [typeSelected])

  // const filteredOptions = OPTIONS.filter((o) => !selectedItems.includes(o));

  const customRequest = async ({ file, onSuccess }: RcCustomRequestOptions) => {
    console.log(file)

    const fil = file as RcFile
    setPreviewUrl(URL.createObjectURL(fil))
    const storageRef = ref(storage, `/products/${fil.name}`) // progress can be paused and resumed. It also exposes progress updates. // Receives the storage reference and the file to upload.
    const uploadTask = uploadBytesResumable(storageRef, fil)
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100) // update progress
        setPercent(percent)
      },
      (err) => console.log(err),
      () => {
        // download url
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setValue('coverImage', url)
        })
      }
    )
    onSuccess?.(true)
  }

  return (
    <div className="p-5 pt-0">
      <div className="cursor-pointer py-5" onClick={() => navigate(-1)}>
        <ArrowLeftOutlined className="text-xl" />
      </div>
      <div className="bg-[#FFFFFF] px-2 pb-10">
        {isUpdate ? (
          <div className="flex justify-center text-[24px] py-8 font-medium">UPDATE PRODUCT</div>
        ) : (
          <div className="flex justify-center text-[24px] py-8 font-medium">CREATE PRODUCT</div>
        )}

        <div className="flex px-16">
          {' '}
          <div className="basis-[60%] w-full px-5">
            <Form
              name="basic"
              wrapperCol={{ span: 16 }}
              style={{ maxWidth: 900 }}
              autoComplete="off"
              className="basis-[60%] m-4"
            >
              <label htmlFor="name" className="font-medium cursor-pointer">
                Product Name
              </label>
              <Form.Item
                name="name"
                labelCol={{ span: 4, offset: 1 }}
                help={<div>{!!errors && <div className="alert mt-1">{errors.name?.message?.toString()}</div>}</div>}
              >
                <Controller
                  control={control}
                  name="name"
                  rules={{
                    required: 'Please enter a product name',
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      id="name"
                      placeholder="Product Name"
                      className="mb-2 input-field placeholder:text-[13px]"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </Form.Item>

              <label htmlFor="description" className="font-medium cursor-pointer">
                Description
              </label>
              <Form.Item
                name="description"
                labelCol={{ span: 4, offset: 1 }}
                help={
                  <div>{!!errors && <div className="alert mt-1">{errors.description?.message?.toString()}</div>}</div>
                }
              >
                <Controller
                  control={control}
                  name="description"
                  rules={{
                    required: 'Please enter product description',
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      id="description"
                      placeholder="Description"
                      className="mb-2 input-field placeholder:text-[13px]"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </Form.Item>
              <label htmlFor="description" className="font-medium cursor-pointer">
                Price
              </label>
              <Form.Item
                name="price"
                labelCol={{ span: 4, offset: 1 }}
                help={<div>{!!errors && <div className="alert mt-1">{errors.price?.message?.toString()}</div>}</div>}
              >
                <Controller
                  control={control}
                  name="price"
                  rules={{
                    required: 'Please enter product price',
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      placeholder="Price"
                      className="mb-2 input-field placeholder:text-[13px]"
                      value={value}
                      onChange={onChange}
                      onKeyPress={preventMinus}
                      type="number"
                      min={1}
                    />
                  )}
                />
              </Form.Item>
              <label htmlFor="description" className="font-medium cursor-pointer">
                Is sale
              </label>
              <Form.Item className="pt-0" labelCol={{ span: 4, offset: 1 }}>
                <Checkbox onChange={onChange} checked={checked} />
              </Form.Item>

              <label htmlFor="description" className={`${!checked && 'text-[#8a8a8a]'} font-medium cursor-pointer`}>
                Sale price
              </label>
              <Form.Item
                name="salePrice"
                labelCol={{ span: 4, offset: 1 }}
                help={
                  <div>{!!errors && <div className="alert mt-1">{errors.salePrice?.message?.toString()}</div>}</div>
                }
              >
                <Controller
                  control={control}
                  name="salePrice"
                  rules={{
                    max: {
                      value: priceWatch,
                      message: 'Sales price must be less than or equal price',
                    },
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      disabled={!checked}
                      placeholder="Sale price"
                      className="mb-2 input-field placeholder:text-[13px]"
                      value={checked === true ? value : ''}
                      onChange={onChange}
                      onKeyPress={preventMinus}
                      type="number"
                      min={1}
                    />
                  )}
                />
              </Form.Item>
              <label htmlFor="description" className="font-medium cursor-pointer mb-2 block">
                Category
              </label>
              <Form.Item
                name="category"
                labelCol={{ span: 4, offset: 1 }}
                help={
                  <div>{!!errors && <div className="alert mt-1">{errors.categoryId?.message?.toString()}</div>}</div>
                }
              >
                <div className="flex gap-2 max-w[400px] flex-wrap">
                  <Controller
                    control={control}
                    name="typeName"
                    rules={{
                      required: 'Please enter product price',
                    }}
                    render={({ field: { value, onChange } }) => {
                      return (
                        <Select
                          style={{ width: 160 }}
                          value={typeof value === 'string' ? value.toUpperCase() : value}
                          placeholder="Choose type"
                          optionFilterProp="children"
                          onChange={(e) => {
                            setTypeSelected(e)
                            onChange(e)
                          }}
                          options={typeOptions}
                        />
                      )
                    }}
                  />
                  <Controller
                    control={control}
                    name="bigCategoryName"
                    rules={{
                      required: 'Please enter product price',
                    }}
                    render={({ field: { value, onChange } }) => {
                      return (
                        <Select
                          showSearch
                          value={value}
                          style={{ width: 160 }}
                          placeholder="Choose big category"
                          optionFilterProp="children"
                          onChange={(e) => {
                            setCategorySelect(e)
                            onChange(e)
                          }}
                          options={bigCategoryOptions}
                        />
                      )
                    }}
                  />
                  <Controller
                    control={control}
                    name="categoryId"
                    rules={{
                      required: 'Please enter product price',
                    }}
                    render={({ field: { value, onChange } }) => {
                      return (
                        <Select
                          showSearch
                          value={value}
                          style={{ width: 160 }}
                          placeholder="Choose category"
                          optionFilterProp="children"
                          onChange={(e) => {
                            setSelectedCategory(e)
                            onChange(e)
                          }}
                          options={categoryOptions}
                        />
                      )
                    }}
                  />
                </div>
              </Form.Item>

              <label htmlFor="description" className="font-medium cursor-pointer mb-2 block">
                Sizes
              </label>
              <Form.Item
                name="sizes"
                labelCol={{ span: 4, offset: 1 }}
                // help={<div>{!!errors && <div className="alert mt-1">{errors.sizes?.message?.toString()}</div>}</div>}
                help={<div>{errors.sizes && <div className="alert mt-1">Please select a size</div>}</div>}
              >
                {fields.map((field: any, index) => {
                  return (
                    <div key={index} className=" p-1">
                      <div className="flex items-center  gap-2  ">
                        <Controller
                          name={`sizes.${index}.sizeId`}
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <Select
                              style={{ width: 160 }}
                              placeholder="Choose a size"
                              optionFilterProp="children"
                              onChange={onChange}
                              value={value}
                              options={sizeData}
                            />
                          )}
                        />

                        <Controller
                          name={`sizes.${index}.sizeQuantity`}
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <Input
                              className="!w-[80%] max-w-xs md:!w-[90%]"
                              value={value} // update this line
                              onChange={onChange}
                              min={1}
                              defaultValue={1}
                              type="number"
                              onKeyPress={preventMinus}
                            />
                          )}
                        />

                        <CloseCircleOutlined
                          className="ml-2 cursor-pointer text-base"
                          onClick={() => {
                            remove(index)
                            // handleDeleteQuestion(index);
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
                <Button
                  className="mt-3"
                  onClick={() => append({ sizeId: '', sizeQuantity: 0 })}
                  type="default"
                  htmlType="submit"
                >
                  Add a size
                </Button>
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                {isUpdate === true ? (
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    className="w-[200px] h-[50px]  rounded-md bg-baseColor  hover:bg-[#a35d3e] text-[#FFFFFF] hover:!text-[#FFFFFF] transition-all  duration-300"
                    type="default"
                    htmlType="submit"
                  >
                    <p className="font-medium text-base"> Update Product</p>
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    className="w-[200px] h-[50px]  rounded-md bg-baseColor  hover:bg-[#a35d3e] text-[#FFFFFF] hover:!text-[#FFFFFF] transition-all  duration-300"
                    type="default"
                    htmlType="submit"
                  >
                    <p className="font-medium text-base"> Create Product</p>
                  </Button>
                )}
              </Form.Item>
            </Form>
          </div>
          <div className="basis-[40%]  ">
            <div className="group relative">
              {' '}
              <img
                className="w-full aspect-square rounded-md "
                src={
                  previewUrl
                    ? previewUrl
                    : 'https://www.grouphealth.ca/wp-content/uploads/2018/05/placeholder-image-400x300.png'
                }
                alt={previewUrl}
              />
              <Upload
                className="absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 z-50"
                customRequest={(e) => {
                  customRequest({ ...e })
                }}
                maxCount={1}
                showUploadList={false}
              >
                <button
                  // onClick={handleSubmit(onSubmit)}
                  className=" text-[#fff] font-medium  transition-all rounded-md text-sm  pl-[30px] pr-[30px] hover:text-baseColor hidden group-hover:block "
                  disabled={percent !== 0 && percent !== 100}
                >
                  <UploadOutlined className="text-4xl z-50 text-[#000]" />
                </button>
              </Upload>
            </div>
            {percent !== 0 && percent !== 100 && <Progress percent={percent} steps={5} />}
          </div>
        </div>
      </div>
    </div>
  )
}
