const express = require('express')
const router = express.Router()
const { createSize, updateSize, deleteSize, getAllSize } = require('../../controller/sizeController')
const asyncHandle = require('../../middlewares/asyncHandle')

//Lấy tất cả thông tin về kích cỡ sản phẩm
router.route('/').post(asyncHandle(createSize))
router.route('/').get(asyncHandle(getAllSize))

//Lấy thông tin 1 kích cỡ sản phẩm theo id
router.route('/:id').patch(asyncHandle(updateSize)).delete(asyncHandle(deleteSize))

module.exports = router
