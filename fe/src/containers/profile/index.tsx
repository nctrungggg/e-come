import { DatePicker, Divider, Input, Radio, Upload, message, Progress } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { Controller, useForm } from 'react-hook-form'
import { UserDetailData } from './type'
import { preventMinus } from '../product-detail/ProductDetailContainer'
import storage from '../../firebaseConfig'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface'
import { RcFile } from 'antd/es/upload'
import { authService } from '../../service/authService'
import { updateUser } from '../../redux/slice/authSlice'
import { toast } from 'react-toastify'
import { UploadOutlined } from '@ant-design/icons'

export const ProfileContainer = () => {
  const authData = useSelector((state: RootState) => state.auth)

  const [userData, setUserData] = useState<UserDetailData>()
  const dispatch = useDispatch()

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { isDirty },
  } = useForm<UserDetailData>()
  const [percent, setPercent] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const customRequest = async ({ file, onSuccess }: RcCustomRequestOptions) => {
    const fil = file as RcFile
    setPreviewUrl(URL.createObjectURL(fil))
    const storageRef = ref(
      storage,
      `/users/${userData?.id}/avatar.${fil.name.substring(fil.name.lastIndexOf('.') + 1)}`
    ) // progress can be paused and resumed. It also exposes progress updates. // Receives the storage reference and the file to upload.
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
          setValue('avatar', url)
          console.log(url)
        })
      }
    )
    onSuccess?.(true)
  }

  const onSubmit = useCallback(async () => {
    const data = getValues()
    try {
      const res = await authService.updateUser(userData?.id!, data)
      dispatch(
        updateUser({
          id: res.data.id,
          address: res.data.address,
          avatar: res.data.avatar,
          email: res.data.email,
          name: res.data.name,
          phone: res.data.phone,
          birthday: res.data.birthday,
          gender: res.data.gender,
          token: authData.user?.token!,
        })
      )
      toast.success('Update information successfully')
    } catch (error) {
      console.log(error)
    }
  }, [authData.user?.token, dispatch, getValues, userData?.id])

  useEffect(() => {
    authService
      .getUserProfile(authData.user?.id!)
      .then((res) => {
        setUserData(res.data)
        setValue('name', res.data?.name!)
        setValue('gender', res.data?.gender!)
        setValue('birthday', res.data?.birthday!)
        setValue('phone', res.data?.phone!)
        setValue('address', res.data?.address!)
        setValue('avatar', res.data?.avatar!)
      })
      .catch((err) => console.log(err))
  }, [
    authData.user?.id,
    setValue,
    userData?.address,
    userData?.avatar,
    userData?.birthday,
    userData?.gender,
    userData?.name,
    userData?.phone,
  ])

  return (
    <div className="flex basis-[75%]">
      <div className="bg-[#FFFFFF] w-full p-10">
        <div className="text-4xl font-semibold mb-1">Your Profile</div>
        <div className="pb-[4px]">Manage our account information</div>
        <div className="px-8">
          <div className="text-center ">
            <div className="flex justify-center mb-8 relative  transition-all ">
              <div className="group">
                <img
                  className="rounded-full w-[150px] h-[150px]"
                  src={previewUrl ? previewUrl : userData?.avatar}
                  alt={userData?.name}
                />
                <Upload
                  className="absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4"
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
                    <UploadOutlined className="text-2xl" />
                  </button>
                </Upload>
              </div>
            </div>

            {percent !== 0 && percent !== 100 && <Progress percent={percent} steps={5} />}
            {/* <button className=" h-[50px] bg-white border  pl-[30px] pr-[30px] hover:bg-baseColor hover:text-[#FFFFFF]">
              Upload image
            </button> */}
          </div>
          <div className="ml-32">
            <div className="flex pb-[30px]  items-center">
              <div className="w-[20%] text-[#555555CC] pr-2  text-sm">Email: </div>
              <div className="flex-1 text-lg">{userData?.email}</div>
            </div>
            <div className="flex pb-[30px]  items-center">
              <div className="w-[20%] text-[#555555CC] pr-2 text-sm">Name: </div>
              <Controller
                control={control}
                name="name"
                render={({ field: { value, onChange } }) => (
                  <Input className="input-field !w-[400px]" value={value} onChange={onChange} />
                )}
              />
            </div>
            <div className="flex pb-[30px]  items-center">
              <div className="w-[20%] text-[#555555CC] pr-2 text-sm">Gender:</div>
              <Controller
                control={control}
                name="gender"
                render={({ field: { value, onChange } }) => (
                  <Radio.Group onChange={onChange} value={value}>
                    <Radio value={'male'}>Male</Radio>
                    <Radio value={'female'}>Female</Radio>
                    <Radio value={'other'}>Others</Radio>
                  </Radio.Group>
                )}
              />
            </div>
            <div className="flex pb-[30px]  items-center">
              <div className="w-[20%] text-[#555555CC] pr-2 text-sm">Birthday: </div>
              <Controller
                control={control}
                name="birthday"
                render={({ field: { value, onChange } }) => (
                  <DatePicker onChange={onChange} value={dayjs(value)} defaultValue={dayjs(userData?.birthday)} />
                )}
              />
            </div>
            <div className="flex pb-[30px]  items-center">
              <div className="w-[20%] text-[#555555CC] pr-2 text-sm">Phone number: </div>
              <Controller
                control={control}
                name="phone"
                render={({ field: { value, onChange } }) => (
                  <Input
                    onKeyPress={preventMinus}
                    className="input-field !w-[400px]"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            </div>
            <div className="flex pb-[30px] items-center">
              <div className="w-[20%] text-[#555555CC] pr-2 text-sm">Address: </div>
              <Controller
                control={control}
                name="address"
                render={({ field: { value, onChange } }) => (
                  <Input
                    onKeyPress={preventMinus}
                    className="input-field !w-[400px]"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleSubmit(onSubmit)}
              className="w-[200px] h-[50px] mt-5 rounded-md bg-baseColor hover:bg-[#a35d3e] text-[#FFFFFF] transition-all duration-300"
              disabled={percent !== 0 && percent !== 100}
            >
              <p className="font-medium text-lg">Save</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
