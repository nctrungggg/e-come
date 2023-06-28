const express = require('express')
const router = express.Router()
const {
  createTransaction,
  cancelTransaction,
  getTransactionByUserId,
  getOwnTransactionById,
  getOwnTransactions,
} = require('../controller/transactionController')
const asyncHandle = require('../middlewares/asyncHandle')

//Lấy tất cả thông tin về kích cỡ sản phẩm
router
  .route('/')
  // .get(asyncHandle(getAllSize))
  .post(createTransaction)

router.route('/page/:page').get(asyncHandle(getOwnTransactions))

//Lấy thông tin 1 kích cỡ sản phẩm theo id
router.route('/:id').get(asyncHandle(getOwnTransactionById))
// 	.get(asyncHandle(getSizeById))
// 	.patch(asyncHandle(updateSize))
// 	.delete(asyncHandle(deleteSize));

router.route('/user/:id').get(getTransactionByUserId)
router.route('/cancel/:id').patch(asyncHandle(cancelTransaction))

module.exports = router
