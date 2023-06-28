const express = require('express')
const db = require('../models')
const jwt = require('jsonwebtoken')
const { deleteProduct } = require('./productController')
// const productSize = require("../models/product-size");
// const transactionProductSize = require("../models/transaction-product-size");
// const vnpay = require('../services/vnpay');
const Transaction = db.models.Transaction
const Product = db.models.Product
const ProductSize = db.models.ProductSize
const TransactionProductSize = db.models.TransactionProductSize
const Size = db.models.Size
const { Sequelize } = require('sequelize')
function getPayload(request) {
  const token = request.headers.authorization
  return jwt.verify(token, process.env.JWT_SECRET)
}
const transactionController = {
  getOwnTransactions: async (req, res, next) => {
    const limit = 12
    const page = req.params.page || 1
    const offset = (page - 1) * limit
    const payload = getPayload(req)
    let transactions = []
    try {
      transactions = await Transaction.findAll({
        limit: limit,
        offset: offset,
        where: {
          userId: parseInt(payload.userId),
        },
        include: [
          {
            model: ProductSize,
            attributes: ['productId', 'sizeId'],
          },
        ],
      })
    } catch (error) {
      console.log(error)
    }
    return res.status(200).json(transactions)
  },
  getAllTransactions: async (req, res, next) => {
    // const limit = 12
    // const page = req.params.page || 1
    // const offset = (page - 1) * limit
    let transactions = []
    try {
      transactions = await Transaction.findAll({
        // limit: limit,
        // offset: offset,
        include: [
          {
            model: ProductSize,
            attributes: ['productId', 'sizeId'],
            through: { attributes: ['quantity'] },
            include: [
              {
                model: db.models.Product,
                paranoid: false,
              },
              {
                model: db.models.Size,
              },
            ],
          },
          {
            model: db.models.User,
            attributes: ['id', 'name', 'email', 'phone'],
          },
        ],

        order: [['createdAt', 'DESC']],
      })
    } catch (error) {
      console.log(error)
    }
    return res.status(200).json(transactions)
  },

  createTransaction: async (req, res, next) => {
    const { userId, productList, transactionMethod, description, totalPrice } = req.body
    const transaction = await Transaction.create({
      userId,
      totalPrice,
      transactionMethod,
      description,
    })
    try {
      const transactionProductSizes = []
      for (const productItem of productList) {
        const productSizeRecord = await ProductSize.findOne({
          where: {
            productId: productItem.productId,
            sizeId: productItem.sizeId,
          },
        })

        // Update the saleCount and quantity of the productSize
        const saleCount = +productSizeRecord.saleCount + +productItem.quantity
        const quantity = +productSizeRecord.quantity - +productItem.quantity
        if (quantity < 0) return res.status(400).json({ message: 'Cannot create transaction!' })

        await ProductSize.update(
          {
            saleCount,
            quantity,
          },
          { where: { id: productSizeRecord.id } }
        )
        transactionProductSizes.push({
          transactionId: transaction.id,
          ProductSizeId: productSizeRecord.id,
          quantity: productItem.quantity,
        })
      }

      // // Create transaction-productSize associations in bulk
      await TransactionProductSize.bulkCreate(transactionProductSizes)
      return res.status(200).json(transaction)
    } catch (err) {
      console.log(err)
      return res.status(400).json({ message: 'Something wrong' })
    }
  },
  getTransactionById: async (req, res, next) => {
    const id = req.params.id
    try {
      let transactions = await Transaction.findOne({
        where: { id: id },
        attributes: ['userId'],
        include: [
          {
            model: ProductSize,
            attributes: ['id'],
            include: [
              {
                model: Product,
                attributes: ['id', 'name'],
              },
              {
                model: Size,
                attributes: ['id', 'name'],
              },
            ],
          },
        ],
      })
      return res.status(200).json(transactions)
    } catch (error) {
      console.log(error)
    }
  },
  getOwnTransactionById: async (req, res, next) => {
    const id = req.params.id
    const payload = getPayload(req)
    try {
      let transactions = await Transaction.findOne({
        where: {
          id: id,
          userId: parseInt(payload.userId),
        },
        attributes: ['id', 'userId'],
        include: [
          {
            model: ProductSize,
            attributes: ['id'],
            include: [
              {
                model: Product,
                attributes: ['id', 'name'],
              },
              {
                model: Size,
                attributes: ['id', 'name'],
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      })
      return res.status(200).json(transactions)
    } catch (error) {
      console.log(error)
    }
  },
  deleteTransaction: async (req, res, next) => {
    let id = req.params.id
    let transaction = await Transaction.findByPk(id)
    if (!transaction) {
      res.status(404).send('Cannot find transaction')
    }
    await transaction.destroy()
    res.status(200).send('Transaction deleted successfully')
  },

  updateTransactionStatus: async (req, res, next) => {
    let id = req.params.id
    const deliStatus = {
      confirmming: 0,
      init: 1,
      shipping: 2,
      received: 3,
      canceled: -1,
    }
    const { deliveryStatus, transactionMethod } = req.body
    try {
      const transaction = await Transaction.findOne({
        where: { id },
      })
      if (!transaction) {
        throw new ErrorResponse('Transaction not found', 404)
      }
      if (transaction.paymentstatus !== '1' && transaction.transactionMethod !== 'cash')
        return res.status(500).json({ message: 'Unpaid' })

      if (deliStatus[deliveryStatus] !== -1) {
        if (
          deliStatus[deliveryStatus] < deliStatus[transaction.deliveryStatus] ||
          deliStatus[deliveryStatus] - deliStatus[transaction.deliveryStatus] > 1
        ) {
          return res.status(500).json({ message: 'Can not roll back transaction status' })
        }
      }

      if (deliStatus[transaction.deliveryStatus] >= 2 && deliStatus[deliveryStatus] === -1) {
        return res.status(500).json({ message: 'Shipping, can not canceled' })
      }

      if (deliStatus[transaction.deliveryStatus] === -1) {
        return res.status(500).json({ message: 'Cannot update canceled transaction' })
      }

      let paymentstatus = transaction.paymentstatus
      if (deliStatus[deliveryStatus] === 3 && transactionMethod === 'cash') paymentstatus = '1'
      await transaction.update({
        deliveryStatus,
        transactionMethod,
        paymentstatus,
      })

      // const { productsizes } = req.body;
      // if (productsizes) {
      // 	await transaction.setProductSizes(productsizes);
      // }
      return res.status(200).json({
        success: true,
        message: 'Transaction updated successfully',
        transaction,
      })
    } catch (error) {
      console.log(error)
      next(error)
    }
  },

  cancelTransaction: async (req, res, next) => {
    const id = req.params.id
    const payload = getPayload(req)
    try {
      let transaction = await Transaction.findOne({
        where: {
          id: id,
          userId: parseInt(payload.userId),
        },
        include: [
          {
            model: TransactionProductSize,
            attributes: ['id', 'ProductSizeId', 'quantity'],
            order: [['ProductSizeId', 'ASC']],
          },
          {
            model: ProductSize,
            attributes: ['id', 'saleCount', 'quantity'],
            order: [['id', 'ASC']],
          },
        ],
      })
      if (transaction.deliveryStatus !== 'confirmming' || transaction.deliveryStatus === 'canceled') {
        return res.status(500).json({ message: 'Can not cancel transaction' })
      }

      for (index in transaction.Transaction_Product_Sizes) {
        const element = transaction.Transaction_Product_Sizes[index]
        const productSize = transaction.Product_Sizes[index]
        const saleCount = productSize.saleCount - element.quantity
        const quantity = productSize.quantity + element.quantity
        await productSize.update({
          saleCount: saleCount > 0 ? saleCount : 0,
          quantity,
        })
      }
      await transaction.update({ deliveryStatus: 'canceled' })
      return res.status(200).json({
        success: true,
        message: 'Transaction canceled successfully',
        transaction,
      })
    } catch (error) {
      console.log(error)
      return res.status(500)
    }
  },
  getTransactionByUserId: async (req, res, next) => {
    let id = req.params.id
    try {
      try {
        const transactions = await Transaction.findAll({
          where: { userId: id },
          include: {
            model: ProductSize,
            attributes: ['id'],
            include: [
              {
                model: db.models.Size,
                attributes: ['id', 'name'],
              },
              {
                model: db.models.Product,
                attributes: ['id', 'name', 'coverImage', 'price', 'salePrice'],
                paranoid: false,
              },
            ],
            through: { attributes: ['quantity'] },
          },
          order: [['createdAt', 'DESC']],
        })
        return res.status(200).json(transactions)
      } catch (error) {
        console.log(error)
      }
    } catch (error) {}
  },
}

module.exports = transactionController
