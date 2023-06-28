const dbConfig = require('../config/database')

const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(dbConfig.DATABASE, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.DIALECT,
  timezone: '+07:00',
})

const db = {}
db.sequelize = sequelize
db.models = {}
db.models.User = require('./user')(sequelize, Sequelize.DataTypes)
db.models.Product = require('./product')(sequelize, Sequelize.DataTypes)
db.models.Transaction = require('./transaction')(sequelize, Sequelize.DataTypes)
db.models.Size = require('./size')(sequelize, Sequelize.DataTypes)
db.models.Category = require('./category')(sequelize, Sequelize.DataTypes)
db.models.Type = require('./type')(sequelize, Sequelize.DataTypes)
db.models.BigCategory = require('./big-category')(sequelize, Sequelize.DataTypes)
db.models.ProductSize = require('./product-size')(sequelize, Sequelize.DataTypes)
db.models.TransactionProductSize = require('./transaction-product-size')(sequelize, Sequelize.DataTypes)
db.models.Carousel = require('./carousel')(sequelize, Sequelize.DataTypes)
db.models.UserReview = require('./user-review')(sequelize, Sequelize.DataTypes)

//relationship

db.models.User.belongsToMany(db.models.Product, { through: 'userwishlist' })
db.models.Product.belongsToMany(db.models.User, { through: 'userwishlist' })

db.models.User.belongsToMany(db.models.Product, {
  through: db.models.UserReview,
})
db.models.Product.belongsToMany(db.models.User, {
  through: db.models.UserReview,
})

db.models.Size.belongsToMany(db.models.Product, {
  through: db.models.ProductSize,
})
db.models.Product.belongsToMany(db.models.Size, {
  through: db.models.ProductSize,
})
db.models.Transaction.belongsToMany(db.models.ProductSize, {
  through: db.models.TransactionProductSize,
})
db.models.ProductSize.belongsToMany(db.models.Transaction, {
  through: db.models.TransactionProductSize,
})

db.models.Transaction.hasMany(db.models.TransactionProductSize)
db.models.TransactionProductSize.belongsTo(db.models.Transaction)
db.models.ProductSize.belongsTo(db.models.TransactionProductSize)
db.models.TransactionProductSize.hasMany(db.models.ProductSize)
db.models.Product.hasMany(db.models.ProductSize)
db.models.ProductSize.belongsTo(db.models.Product)
db.models.Size.hasMany(db.models.ProductSize)
db.models.ProductSize.belongsTo(db.models.Size)

db.models.User.hasMany(db.models.Transaction)
db.models.Transaction.belongsTo(db.models.User)

db.models.Category.hasMany(db.models.Product)
db.models.Product.belongsTo(db.models.Category)

db.models.BigCategory.hasMany(db.models.Category)
db.models.Category.belongsTo(db.models.BigCategory)

db.models.Type.hasMany(db.models.BigCategory)
db.models.BigCategory.belongsTo(db.models.Type)

db.sequelize
  .authenticate()
  .then(() => {
    console.log('Connected successfully')
  })
  .catch((err) => {
    console.log('Connect Error: ' + err)
  })

//db.sequelize.sync({ force: true }).then(() => {
//  console.log('yes resync done')
//})

module.exports = db
