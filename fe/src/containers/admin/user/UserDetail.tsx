import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import userService from '../../../service/admin-service/userService'
import { UserType } from './type'
import { Button, Modal, message } from 'antd'
import { toast } from 'react-toastify'

export const UserDetailContainer = () => {
  const { userId } = useParams()
  const [userData, setUserData] = useState<UserType>()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleOk = () => {
    handleDeleteUser()
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }
  const handleDeleteUser = () => {
    userService
      .deleteUser(userId!)
      .then((res) => {
        navigate('/admin/user')
        toast.success('Delete user successfully')
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    userService
      .getUserDetails(userId!)
      .then((res) => setUserData(res.data))
      .catch((err) => console.log(err))
  }, [userId])

  return (
    <div className='p-5'>
      <div className="bg-[#FFFFFF] py-8  flex flex-col items-center">
        <div className="p-5 ">
          <img className="rounded-full w-[150px] h-[150px] m-auto" src={userData?.avatar} alt="userImage" />
          <div className="m-4">
            {userData &&
              Object.entries(userData!).map(
                ([key, value]) =>
                  key !== 'avatar' &&
                  key !== 'id' && (
                    <div className="flex m-4">
                      <div className="font-[500] capitalize mr-2">{key}: </div>
                      <div className="">{value}</div>
                    </div>
                  )
              )}
          </div>
        </div>
        <Button danger className="m-4" onClick={showModal}>
          Delete User
        </Button>
        <Modal
          title="DO YOU WANT TO DELETE?"
          className="w-[500px] h-[500px]"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        ></Modal>
      </div>
    </div>
  )
}
