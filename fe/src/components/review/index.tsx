import { Button, Drawer, Form, Input, Rate, message } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { CloseOutlined } from '@ant-design/icons'
import reviewService from '../../service/reviewService'
import { ReviewItem } from './ReviewItem'
import { ReviewItemProps } from './type'
import { toast } from 'react-toastify'

type ReviewProps = {
  productId: number
  userId?: number
  isAdmin?: boolean
}

type ReviewRequest = {
  rate: number
  comment: string
}

export const Review = (props: ReviewProps) => {
  const { productId, userId, isAdmin } = props
  const [open, setOpen] = useState(false)
  const [reviewData, setReviewData] = useState<ReviewItemProps[]>()

  const desc = ['terrible', 'bad', 'normal', 'good', 'wonderful']
  const {
    control,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const showDrawer = () => {
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
  }

  const onSubmit = useCallback(async () => {
    const data = getValues()

    const submitData = {
      comment: `${data.comment}`,
      rate: +data.rate,
      productId: productId,
      userId: props.userId!,
    }

    try {
      const res = await reviewService.createReview(submitData)
      if (res) {
        toast.success('Your review has been created')
        window.location.reload()
      } else {
        toast.error('You must buy the product before reviewing')
      }
    } catch (error) {}
  }, [getValues, productId, props.userId])

  useEffect(() => {
    reviewService
      .getReviewsByProductId(productId)
      .then((res) => setReviewData(res.data))
      .catch((err) => console.log('error', err))
  }, [productId])

  return (
    <div>
      <div className="text-[20px] pb-2">PRODUCT REVIEW:</div>
      {reviewData?.map((data: any) => (
        <ReviewItem
          key={data.id}
          id={data.id}
          isDeleteable={isAdmin}
          name={data.userId.name}
          avatar={data.userId.avatar}
          createdAt={data.createdAt}
          rate={data.rate}
          comment={data.comment}
        />
      ))}
      {isAdmin === true ? null : (
        <div>
          <Button
            className="w-[150px] h-[40px] mt-5 rounded-md bg-baseColor  hover:bg-[#a35d3e] hover:!text-[#fff] text-[#FFFFFF] transition-all  duration-300]"
            type="default"
            onClick={() => {
              showDrawer()
            }}
          >
            <p className="">Write review</p>
          </Button>
        </div>
      )}

      <Drawer
        title={
          <div className="flex items-center">
            <span className="text-[20px]">REVIEW PRODUCT</span>
            <CloseOutlined
              onClick={onClose}
              className="absolute right-4 cursor-pointer text-[#a4a4a4] hover:text-[#000000]"
            />
          </div>
        }
        closable={false}
        placement="right"
        onClose={onClose}
        open={open}
        size="large"
        rootClassName=""
      >
        <div className="flex-col">
          <Form.Item
            // label={<div className="w-[50px]">Email</div>}
            className="py-2"
            help={<div>{!!errors && <div className="alert mt-1 ">{errors.rate?.message?.toString()}</div>}</div>}
          >
            <Controller
              control={control}
              name="rate"
              rules={{
                required: 'Please choose a rate',
              }}
              render={({ field: { value, onChange } }) => (
                <div className="flex items-center gap-5">
                  <p className="font-medium">Your rating: </p>
                  <span>
                    <Rate tooltips={desc} onChange={onChange} value={value} />
                    {value ? <span className="ant-rate-text">{desc[value - 1]}</span> : ''}
                  </span>
                </div>
              )}
            />
          </Form.Item>

          <Form.Item
            className="py-2"
            help={<>{!!errors && <div className="alert mt-1">{errors.comment?.message?.toString()}</div>}</>}
          >
            <Controller
              control={control}
              name="comment"
              rules={{
                required: 'Please write your comment',
              }}
              render={({ field: { value, onChange } }) => (
                <div className="">
                  <p className="font-medium">Your comment:</p>
                  <Input.TextArea value={value} onChange={onChange} className="mb-2 mt-2" />
                </div>
              )}
            />
          </Form.Item>
        </div>

        <div className="flex ">
          <button
            onClick={handleSubmit(onSubmit)}
            className="w-[200px] h-[50px] mt-5 rounded-md bg-baseColor  hover:bg-[#a35d3e] text-[#FFFFFF] transition-all  duration-300]"
          >
            <p className="font-medium text-lg">SUBMIT</p>
          </button>
        </div>
      </Drawer>
    </div>
  )
}
