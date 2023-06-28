const slug = require('slug')
const db = require('../models')
const { Op } = require('sequelize')
const Sequelize = require('sequelize')
const { await } = require('await')
const ProductSize = db.models.ProductSize
const product = db.models.Product
const Category = db.models.Category
const bigCategory = db.models.BigCategory
const size = db.models.Size
const type = db.models.Type
const productController = {
  //done
  getAllProduct: async (req, res, next) => {
    // const limit = 12
    // const page = req.params.page || 1
    // const offset = (page - 1) * limit
    let products = []
    try {
      products = await product.findAll({
        // limit: limit,
        // offset: offset,
        include: [
          {
            model: size,
            attributes: ['id', 'name'],
          },
          {
            model: db.models.Category,
            attributes: ['id', 'name'],
          },
        ],
        paranoid: false,
      })
    } catch (error) {
      console.log(error)
    }
    return res.status(200).json(products)
  },
  //done
  getProductById: async (req, res, next) => {
    let id = req.params.id
    const products = await product.findOne({
      where: { id: id },
      include: [
        {
          model: size,
          attributes: ['id', 'name'],
        },
        {
          model: db.models.Category,
          attributes: ['id', 'name'],
          include: [
            {
              model: db.models.BigCategory,
              include: [
                {
                  model: db.models.Type,
                  attributes: ['id', 'name'],
                },
              ],
            },
          ],
        },
      ],
      paranoid: false,
    })

    return res.status(200).json(products)
  },
  //done
  createProduct: async (req, res, next) => {
    try {
      let { ...body } = req.body
      const newSlug = slug(req.body.name)
      let { sizes } = req.body
      let productInstance = await db.models.Product.create({
        ...body,
        slug: newSlug,
      })
      for (const size of sizes) {
        const { sizeId, sizeQuantity, saleCount } = size
        await productInstance.addSize(sizeId, {
          through: { quantity: sizeQuantity, saleCount },
        })
      }
      return res.status(201).json(productInstance)
    } catch (error) {
      console.log(error)
    }
  },
  //update  product with sizes
  //done
  updateProduct: async (req, res, next) => {
    let id = req.params.id
    let { ...body } = req.body
    let product = await db.models.Product.findByPk(id, {
      include: db.models.Size,
    })
    if (!product) {
      res.status(404).send('Cannot find product')
    }
    try {
      await product.update(body)
    } catch (error) {
      console.log(error)
    }
    const { sizes } = req.body
    const productSizes = await db.models.ProductSize.findAll({
      where: { productId: id },
    })
    const newSizeIds = sizes.map(({ sizeId }) => sizeId)
    // Filter out any product sizes that are not included in the request body
    const productSizesToDelete = productSizes.filter(({ sizeId }) => !newSizeIds.includes(sizeId))

    // Delete any product sizes that are not included in the request body
    await Promise.all(
      productSizesToDelete.map(async (productSize) => {
        await productSize.destroy()
      })
    )

    // Update each size in the sizes array
    await Promise.all(
      sizes.map(async ({ sizeId, sizeQuantity, saleCount }) => {
        const productSize = await db.models.ProductSize.findOne({
          where: { productId: id, sizeId },
        })
        if (productSize) {
          // If the product size already exists, update its quantity and sale count
          await productSize.update({ quantity: sizeQuantity, saleCount })
        } else {
          // Otherwise, create a new product size object
          await db.models.ProductSize.create({
            productId: id,
            sizeId,
            quantity: sizeQuantity,
            saleCount,
          })
        }
      })
    )
    res.status(200).send('Product sizes updated successfully')
  },
  findProductByCategory: async (req, res, next) => {
    let categoryid = +req.params.categoryid
    let { sizeCodes, priceRanges, sort } = req.query
    const query = {}
    const condition = {
      categoryId: categoryid,
    }
    if (sizeCodes) {
      const sizes = sizeCodes.split(',')
      if (sizes.length)
        query.include = [
          {
            model: size,
            where: { name: sizes },
          },
        ]
    }
    if (priceRanges) {
      const prices = priceRanges.split('-')
      let startPrice = parseInt(prices[0])
      if (!startPrice) startPrice = 0
      condition.price[Op.gt] = startPrice
      if (prices.length == 2 && parseInt(prices[1])) condition.price[Op.lt] = parseInt(prices[1])
      query.where = condition
    }
    query.where = condition // update the condition object
    if (sort) {
      switch (parseInt(sort)) {
        case 1:
          query.order = [['price', 'ASC']]
          break
        case 2:
          query.order = [['price', 'DESC']]
          break
        case 3:
          query.order = [['createdAt', 'DESC']]
          break
        default:
          break
      }
    }
    try {
      const products = await product.findAll({ ...query })
      return res.status(200).json(products)
    } catch (e) {
      console.log(e)
      res.status(500)
    }
  },

  findProductByBigCategory: async (req, res, next) => {
    try {
      let bigcategoryid = req.params.bigcategoryid
      let categories = await Category.findAll({
        where: { bigcategoryId: bigcategoryid },
      })
      let categoryIds = categories.map((c) => c.id)
      let products = await product.findAll({
        where: { categoryId: categoryIds },
      })
      return res.status(200).json(products)
    } catch (error) {
      console.log(error)
    }
  },

  findProductByType: async (req, res, next) => {
    let typeid = req.params.typeid
    let bigcategories = await bigCategory.findAll({
      where: { typeId: typeid },
    })
    let bigcategoryIds = bigcategories.map((c) => c.id)
    let categories = await Category.findAll({
      where: { bigcategoryId: bigcategoryIds },
    })
    let categoryIds = categories.map((c) => c.id)
    let products = await product.findAll({
      where: { categoryId: categoryIds },
    })
    return res.status(200).json(products)
  },

  deleteProduct: async (req, res, next) => {
    let id = req.params.id
    let Product = await product.findByPk(id)
    if (!Product) {
      res.status(404).send('Cannot find product')
    }
    await Product.destroy()
    res.status(200).send('Product deleted successfully')
  },

  getProductByName: async (req, res, next) => {
    let name = req.query.name
    try {
      let products = await product.findAll({
        where: {
          name: {
            [Op.like]: `%${name}%`,
          },
        },
      })
      return res.status(200).json(products)
    } catch (error) {
      console.error(error)
      res.status(500).send('error server')
    }
  },

  getNewestProducts: async (req, res, next) => {
    let amount = parseInt(req.query.amount)
    if (!amount) amount = 10
    try {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

      const products = await product.findAll({
        where: {
          createdAt: {
            [Op.between]: [oneMonthAgo, new Date()],
          },
        },
        order: [['createdAt', 'DESC']],
        limit: amount,
      })
      return res.status(200).json(products)
    } catch (e) {
      console.log(e)
      res.status(500).send('error server')
    }
  },

  getBestSeller: async (req, res, next) => {
    let amount = parseInt(req.query.amount)
    if (!amount) amount = 10
    try {
      const result = await ProductSize.findAll({
        attributes: ['productId', [Sequelize.fn('SUM', Sequelize.col('saleCount')), 'total']],
        group: ['productId'],
        order: [[Sequelize.literal('total'), 'DESC']],
        having: {
          total: {
            [Op.gt]: 0,
          },
        },
      })

      const productIds = result?.map((e) => e.productId)
      const products = await product.findAll({
        where: {
          id: productIds,
        },
        order: [Sequelize.literal(`FIELD(id, ${productIds.join(',')})`)],
        limit: amount,
      })

      const response = products?.map((el, key) => ({
        ...el.dataValues,
        saleCount: result[key].dataValues.total,
      }))
      return res.status(200).json(response)
    } catch (e) {
      console.log(e)
      res.status(500).send('error server')
    }
  },

  getOutOfStockItems: async (req, res, next) => {
    let limit = parseInt(req.query.limit)
    if (!limit) limit = 5
    try {
      const result = await ProductSize.findAll({
        attributes: ['productId', [Sequelize.fn('SUM', Sequelize.col('quantity')), 'total']],
        group: ['productId'],
        having: {
          total: {
            [Op.lte]: limit,
          },
        },
        order: [[Sequelize.literal('total'), 'ASC']],
      })
      if (!result?.length) return res.status(200).json([])
      const productIds = result?.map((e) => e.productId)
      const products = await product.findAll({
        where: {
          id: productIds,
        },
        order: [Sequelize.literal(`FIELD(id, ${productIds.join(',')})`)],
        limit: 10,
      })
      const response = products?.map((el, key) => ({
        ...el.dataValues,
        quantity: result[key].dataValues.total,
      }))
      return res.status(200).json(response)
    } catch (e) {
      console.log(e)
      res.status(500).send('error server')
    }
  },

  filterProduct: async (req, res, next) => {
    let { typeId } = req.query
    try {
      const products = await type.findOne({
        where: {
          id: parseInt(typeId),
        },
        include: {
          model: bigCategory,
          attributes: ['id', 'name'],
          include: [
            {
              model: Category,
              attributes: ['id', 'name'],
              include: [
                {
                  model: product,
                },
              ],
            },
          ],
        },
      })
      res.status(200).json(products)
    } catch (e) {
      console.log(e)
      res.status(500).send('error server')
      console.log(product)
    }
  },
}

module.exports = productController
