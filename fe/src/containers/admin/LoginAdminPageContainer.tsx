import { yupResolver } from '@hookform/resolvers/yup'
import { Form, Input, Typography } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import AdminInstance from '../../adminAuth'
import { loginAdmin } from '../../redux/slice/adminSlice'
import { authService } from '../../service/authService'

const { Title } = Typography

type DataRequest = {
  email: string
  password: string
}
export const LoginAdminPageContainer = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const schema = yup.object().shape({
    email: yup.string().required('Please enter your email').email('Please enter valid email address'),
    password: yup.string().required('Please enter your password').min(6, 'Password must be more than 6 characters'),
  })

  const {
    control,
    getValues,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<DataRequest>({ resolver: yupResolver(schema) })

  const onSubmit = () => {
    const data = getValues()
    const dataSubmit = {
      email: data.email,
      password: data.password,
      role: 'admin',
    }

    authService
      .login(dataSubmit)
      .then((res) => {
        try {
          AdminInstance.setToken(res.data.token)
          dispatch(
            loginAdmin({
              id: res.data.id,
              avatar: res.data.avatar,
              email: res.data.email,
              name: res.data.name,
              token: res.data.token,
            })
          )
          navigate('/admin/dashboard')
        } catch (error) {
          toast.error('Wrong Email or Password')
        }
      })

      .catch((err) => {
        console.error(err.response.data.message)

        setError('root', { type: 'custom', message: 'Invalid credential' })
      })
  }

  return (
    <div className="flex justify-center mt-24">
      <div className="flex w-[900px] ">
        <div className="basis-[50%] max-h-[600px] ">
          <img
            className="w-full aspect-auto object-cover h-full"
            src="https://images.pexels.com/photos/3585089/pexels-photo-3585089.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="login"
          ></img>
        </div>
        <div className=" basis-[50%] shadow-md max-h-[600px]">
          <div className="flex justify-center items-center text-[32px] mt-6 font-medium">SIGN IN ADMIN</div>
          <div className="flex-col px-[40px] py-6  m-4 ">
            <Form>
              <label htmlFor="email" className="font-medium cursor-pointer">
                Email Address
              </label>
              <Form.Item help={<div className="alert mb-2 ">{errors.email?.message}</div>}>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      id="email"
                      style={{ height: '50px' }}
                      size="large"
                      placeholder="Enter your Email..."
                      className="mb-2 input-field placeholder:text-[13px]"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </Form.Item>
              <label htmlFor="password" className="font-medium cursor-pointer">
                Password
              </label>
              <Form.Item help={<div className="alert mb-2">{errors.password?.message}</div>}>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { value, onChange } }) => (
                    <Input.Password
                      className="input-field mb-2 "
                      style={{ height: '50px' }}
                      size="large"
                      placeholder="Enter your Password..."
                      type="password"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </Form.Item>
            </Form>

            <p className="mt-[17px] mb-[30px] alert text-[16px]">{errors.root?.message}</p>
            <div className="flex justify-center">
              <button
                onClick={handleSubmit(onSubmit)}
                className="w-full h-[50px]  rounded-md bg-baseColor  hover:bg-[#a35d3e] text-[#FFFFFF] transition-all  duration-300"
              >
                <p className="font-medium text-lg">Sign In</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
