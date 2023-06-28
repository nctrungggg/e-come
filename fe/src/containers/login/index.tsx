import { yupResolver } from '@hookform/resolvers/yup'
import { Form, Input } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import LoginImage from '../../assets/login/login-image.jpeg'
import instance from '../../auth'
import { login } from '../../redux/slice/authSlice'
import { authService } from '../../service/authService'

type TLoginProps = {
  email: string
  password: string
}

export const LoginContainer = () => {
  const dispatch = useDispatch()

  const schema = yup.object().shape({
    email: yup.string().required('Please enter your email').email('Please enter valid email address'),
    password: yup.string().required('Please enter your password').min(6, 'Password must be more than 6 characters'),
  })

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    setError,
  } = useForm<TLoginProps>({ resolver: yupResolver(schema) })
  const navigate = useNavigate()

  const onSubmit = async () => {
    const data = getValues()
    try {
      authService
        .login({ email: data.email, password: data.password, role: 'user' })
        .then((res: any) => {
          dispatch(login(res.data))
          instance.setToken(res.data.token)
          navigate('/')

          toast.success('Login successfully')
        })
        .catch((err: any) => {
          // setError('root', { type: 'custom', message: 'Invalid credential' })
          toast.error('Wrong Email or Password')
        })
    } catch (error) {}
  }

  return (
    <div className="flex justify-center mt-24">
      <div className="flex ">
        <img className="basis-[50%] aspect-auto h-[80%]" src={LoginImage} alt="login"></img>
        <div className=" basis-[50%] shadow-md max-h-[600px]">
          <div className="flex justify-center items-center text-[32px] mt-6 font-medium">SIGN IN</div>
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

            <Link className="flex text-center mt-4 justify-center text-baseColor  text-[13px]" to={'/register'}>
              You don't have an account,<span className="font-medium ml-1"> Sign Up</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
