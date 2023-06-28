const db = require('../models')
const Sequelize = require('sequelize')
const { Transaction,User } = db.models
const dayjs = require('dayjs')
const RangeStatsType = {
  HOURLY: `%H`,
  DAILY: '%Y-%m-%d',
  MONTHLY: '%Y-%m',
  YEARLY: '%Y',
}

const analyticsController = {
  getTotalRevenue: async (req, res, next) => {
    try {
      let { dateStart, dateEnd, rangeType } = req.query;
      if (!dateStart) dateStart = dayjs().startOf('day');
      else dateStart = dayjs(dateStart)
      if(rangeType === 'hour') dateEnd = dateStart.endOf('day');
      dateStart = dateStart.format('YYYY-MM-DD HH:mm:ss')
      const createdAt = {
        [Sequelize.Op.gte]: dateStart,
      }
      if (dateEnd) createdAt[Sequelize.Op.lte] = dayjs(dateEnd).format('YYYY-MM-DD HH:mm:ss')
      
      const result = await Transaction.findAll({
        attributes: [
          ['transactionMethod', 'method'],
          ['deliveryStatus', 'status'],
          'paymentstatus',
          'totalPrice',
        ],
        where: {
          createdAt,
          // deliveryStatus: {
          //   [Sequelize.Op.ne]: 'cancelled',
          // },
        },
      })
      res.status(200).json(result)
    } catch (e) {
      console.log(e)
      res.status(500)
    }
  },
  getStatsData: async (req, res, next) => {
    try {
      let { dateStart, dateEnd, rangeType , statsType} = req.query;
      if(!statsType) statsType = "revenue";
      if (!dateStart) dateStart = dayjs();
      else dateStart = dayjs(dateStart)
      rangeType ? rangeType.toLowerCase() : 'day'
      let format
      switch (rangeType) {
        case 'month':
          format = RangeStatsType.MONTHLY
          dateStart = dateStart.startOf('month');
          break
        case 'year':
          format = RangeStatsType.YEARLY
          dateStart = dateStart.startOf('year');
          break
        case 'day':
          format = RangeStatsType.DAILY
          dateStart = dateStart.startOf('day');
          break
        case 'hour':
          format = RangeStatsType.HOURLY
          dateStart = dateStart.startOf('day');
          dateEnd = dateStart.endOf('day');
          break
        default:
          return res.status(500).send('Invalid range type')
      }
      dateStart = dateStart.format('YYYY-MM-DD HH:mm:ss')
      const createdAt = {
        [Sequelize.Op.gte]: dateStart,
      }
      if (dateEnd) createdAt[Sequelize.Op.lte] = dayjs(dateEnd).format('YYYY-MM-DD HH:mm:ss')
      let result;
      if(statsType==="revenue"){ result = await Transaction.findAll({
        attributes: [
          [Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), format), 'time'],
          [Sequelize.fn('SUM', Sequelize.col('totalPrice')), 'total'],
        ],
        where: {
          createdAt,
          deliveryStatus:{
            [Sequelize.Op.in]:['received','shipping','init'],
          }
        },
        group: [Sequelize.literal('time')],
      })}
      else if(statsType === "user"){
        result = await User.findAll({
          attributes:[
            [Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), format), 'time'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
          ],where: {
            createdAt,
            role:{
              [Sequelize.Op.ne]: 'admin'
            }
          },
          group: [Sequelize.literal('time')],
          order: [Sequelize.literal('time')],
        })
      }
      res.status(200).json(result)
    } catch (e) {
      console.log(e)
    }
  },
}

module.exports = analyticsController
