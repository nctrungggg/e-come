import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { ExportOutlined } from '@ant-design/icons'
import { logoutAdmin } from '../../redux/slice/adminSlice'
import { useNavigate } from 'react-router'

const AdminHeader = () => {
  const { admin } = useSelector((state: RootState) => state.admin)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return (
    <div className="flex-col bg-[#ffffff] drop-shadow-md z-10">
      <div className="h-[80px]  flex items-center justify-between  border-b border-[#ebebeb] pl-[2%] pr-[2%]">
        <div className="text-[32px] basis-[20%]  whitespace-nowrap text-baseColor font-medium">T - STORE</div>
        <div className="flex items-center">
          <p className="text-[#111111] text-lg hover:text-black whitespace-nowrap pr-4">
            Hello, {admin?.name || 'Admin'}
          </p>
          <ExportOutlined
            className="cursor-pointer text-lg"
            onClick={() => {
              dispatch(logoutAdmin())
              navigate('/admin/login')
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default AdminHeader
