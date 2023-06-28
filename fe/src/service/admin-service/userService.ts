import adminInstance from '../../adminAuth'
const API_URL_ADMIN = '/api/admin/users'

const getAllUser = () => {
  return adminInstance.get(API_URL_ADMIN)
}

const getUserDetails = (userId: string) => {
  return adminInstance.get(API_URL_ADMIN + `/${userId}`)
}

const deleteUser = (userId: string) => {
  return adminInstance.delete(API_URL_ADMIN + `/${userId}`)
}

const userService = {
  getAllUser,
  getUserDetails,
  deleteUser,
}

export default userService
