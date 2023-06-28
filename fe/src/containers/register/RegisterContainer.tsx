import { DatePicker, Form, Input, Radio, message } from 'antd'
import RegisterImage from '../../assets/login/register.jpg'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { authService } from '../../service/authService'
import { useNavigate } from 'react-router'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import userService from '../../service/admin-service/userService'
import { UserType } from '../admin/user/type'

type DataRequest = {
  name: string
  email: string
  password: string
  gender: string
  birthday: string
  address: string
  phone: string
  role: string
}
export const RegisterContainer = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(null)
  const [userData, setUserData] = useState<UserType[]>()

  const {
    control,
    getValues,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<DataRequest>()

  const preventMinus = (e: any) => {
    if (e.code === 'Minus') {
      e.preventDefault()
    }
  }

  const handleDateChange = (date: any) => {
    setSelectedDate(date)
  }

  useEffect(() => {
    userService
      .getAllUser()
      .then((res) => {
        setUserData(res.data)
      })
      .catch((err) => console.log(err))
  }, [])

  const onSubmit = () => {
    const data: DataRequest = getValues()
    const isEmailDuplicate = userData?.find((user) => user.email === data.email)

    data.birthday = dayjs(selectedDate).format('YYYY-MM-DD')
    data.role = 'user'

    if (isEmailDuplicate) return toast.warning('E-mail is being used')
    if (data.birthday === 'Invalid Date') return toast.warning('Please select a birth day')

    authService
      .register(data)
      .then((res) => {
        navigate('/login')
        toast.success('You have successfully registered, please login')
      })
      .catch((err) => {
        if (err.response.status === 409) {
          setError('email', { type: 'custom', message: err.response.data.message })
        }
      })
  }

  return (
    <div className="">
      <div className="flex justify-center mt-14">
        <div className="h-[600px]">
          {' '}
          <img className=" aspect-auto w-full h-full object-cover" src={RegisterImage} alt="login"></img>
        </div>
        <div className="flex-col items-center w-[450px] h-[600px] overflow-auto shadow-md ">
          <div className="text-[32px] uppercase text-center  mt-6 font-medium">Create account</div>
          <div className="p-8">
            <Form>
              <Form.Item
                label="Email"
                className="font-medium "
                help={<div>{!!errors && <div className="alert mt-1">{errors.email?.message?.toString()}</div>}</div>}
              >
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    pattern: {
                      value:
                        //eslint-disable-next-line
                        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
                      message: 'Email not valid',
                    },
                    required: 'Please enter a valid email address',
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      placeholder="Enter your Email..."
                      className="input-field placeholder:text-[13px] "
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                className="font-medium"
                label="Password"
                help={<div>{!!errors && <div className="alert mt-1">{errors.password?.message?.toString()}</div>}</div>}
              >
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: 'Please enter a password',
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input.Password
                      placeholder="Enter your Password..."
                      className="input-field placeholder:text-[13px]"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                className="font-medium"
                label="Name"
                help={<div>{!!errors && <div className="alert mt-1">{errors.name?.message?.toString()}</div>}</div>}
              >
                <Controller
                  control={control}
                  name="name"
                  rules={{
                    required: 'Please enter your name',
                    maxLength: {
                      value: 50,
                      message: 'Name up to 50 characters long',
                    },
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      placeholder="Enter your Name..."
                      className="input-field placeholder:text-[13px]"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                className="font-medium"
                label="Gender"
                help={<div>{!!errors && <div className="alert mt-1">{errors.gender?.message?.toString()}</div>}</div>}
              >
                <Controller
                  control={control}
                  name="gender"
                  rules={{
                    required: 'Please select a gender',
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Radio.Group onChange={onChange} value={value}>
                      <Radio value={'male'}>Male</Radio>
                      <Radio value={'female'}>Female</Radio>
                      <Radio value={'other'}>Others</Radio>
                    </Radio.Group>
                  )}
                />
              </Form.Item>

              <Form.Item
                className="font-medium"
                label="Birthdate"
                help={<div>{!!errors && <div className="alert mt-1">{errors.birthday?.message?.toString()}</div>}</div>}
              >
                <Controller
                  control={control}
                  name="birthday"
                  // rules={{
                  //   required: 'Please select a birth day',
                  // }}

                  render={({ field: { value, onChange } }) => (
                    <DatePicker onChange={handleDateChange} value={selectedDate} />
                  )}
                />
              </Form.Item>

              <Form.Item
                className="font-medium"
                label="Phone"
                help={<div>{!!errors && <div className="alert mt-1">{errors.phone?.message?.toString()}</div>}</div>}
              >
                <Controller
                  control={control}
                  name="phone"
                  rules={{
                    required: 'Please enter a phone number',
                    pattern: {
                      value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
                      message: 'Please enter a right number',
                    },
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      onKeyPress={preventMinus}
                      placeholder="Enter your Phone Number..."
                      className="input-field placeholder:text-[13px]"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                className="font-medium"
                label="Address"
                help={<div>{!!errors && <div className="alert mt-1">{errors.address?.message?.toString()}</div>}</div>}
              >
                <Controller
                  control={control}
                  name="address"
                  rules={{
                    required: 'Please enter a valid address',
                    maxLength: {
                      value: 100,
                      message: 'Address must be at latest 100 characters',
                    },
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      className="input-field placeholder:text-[13px]"
                      value={value}
                      onChange={onChange}
                      placeholder="Enter your Address..."
                    />
                  )}
                />
              </Form.Item>

              <div className="flex justify-center">
                <button
                  onClick={handleSubmit(onSubmit)}
                  className=" w-full h-[50px] mt-5 rounded-md bg-baseColor  hover:bg-[#a35d3e] text-[#FFFFFF] transition-all  duration-300]"
                >
                  <p className="font-medium text-lg"> Sign Up</p>
                </button>
              </div>
            </Form>
            <Link className="flex text-center mt-4 text-baseColor  text-[13px] justify-center" to={'/login'}>
              Already has account?<span className="font-medium ml-1"> Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
