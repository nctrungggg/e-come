import { Button, Card, Col, Progress, Radio, Row, Select, Space, Table, Tooltip as Subtitle } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import React from 'react'
import dayjs, { Dayjs, ManipulateType } from 'dayjs'
import { Controller, useForm } from 'react-hook-form'
import localeData from 'dayjs/plugin/localeData'
import generatePicker from 'antd/lib/date-picker/generatePicker'
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs'
import 'dayjs/locale/en'
import { DollarCircleFilled, InfoCircleOutlined, ProjectFilled, WalletFilled } from '@ant-design/icons'
import cartBackground from '../../../assets/texture/pattern/pattern.jpeg'
import analyticService from '../../../service/admin-service/analyticService'
import { SpinContainer } from '../../../components/spin-container'
import NoData from '../../../assets/texture/nodata.png'
import { XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts'
import { useNavigate } from 'react-router-dom'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
dayjs.extend(isSameOrBefore)

const { getOutOfStockItem, getStatsData, getTotalRevenue, getBestSellerProduct } = analyticService
dayjs.locale('en')
dayjs.extend(localeData)

export const RawDatePicker = generatePicker<dayjs.Dayjs>(dayjsGenerateConfig)

export enum RangeStatsType {
  HOURLY = 'hour',
  DAILY = 'day',
  MONTHLY = 'month',
  YEARLY = 'year',
}

export type QueryStatsForm = {
  type: 'hour' | 'day' | 'month' | 'year'
  timeStart: any
  timeEnd: any
  statsType: string
}

export type TranStatsProps = {
  totalRevenue: number
  totalConfirmedTrans: number
  onlineRevenue: number
  totalCancelTrans: number
  totalTrans: number
  successRevenue: number
  successTrans: number
  confirmedRevenue: number
}

export type BestSellerProps = {
  id: number
  name: string
  saleCount: string
}

export type OutOfStockProps = {
  id: number
  name: string
  quantity: string
}

export enum StatsType {
  REVENUE = 'revenue',
  USER = 'user',
}

const DashBoardAdminContainer: React.FC = () => {
  const { control, watch } = useForm<QueryStatsForm>({
    defaultValues: {
      type: RangeStatsType.HOURLY,
      timeStart: dayjs().hour(0).minute(0).second(0),
      timeEnd: null,
      statsType: StatsType.REVENUE,
    },
  })

  const buildTranStats = (data: any): TranStatsProps => {
    let totalRevenue = 0
    let confirmedRevenue = 0
    let onlineRevenue = 0
    let successRevenue = 0
    let totalTrans = 0
    let totalCancelTrans = 0
    let successTrans = 0
    let totalConfirmedTrans = 0
    data.forEach((item: any) => {
      if (item.status === 'canceled') totalCancelTrans++
      else {
        totalTrans++
        totalRevenue += parseInt(item.totalPrice)
        if (item.status !== 'confirmming') {
          totalConfirmedTrans++
          confirmedRevenue += parseInt(item.totalPrice)
          if (item.status === 'received') {
            if (item.method === 'vnpay') onlineRevenue += parseInt(item.totalPrice)
            successRevenue += parseInt(item.totalPrice)
            successTrans++
          }
        }
      }
    })
    return {
      totalRevenue,
      totalConfirmedTrans,
      onlineRevenue,
      totalCancelTrans,
      totalTrans,
      successRevenue,
      successTrans,
      confirmedRevenue,
    }
  }

  const formData = watch()
  const [stats, setStats] = useState<any[] | undefined>(undefined)
  const [tranStats, setTranStats] = useState<TranStatsProps | undefined>(undefined)
  const [bestSeller, setBestSeller] = useState<BestSellerProps[] | undefined>(undefined)
  const [outOfStock, setOutOfStock] = useState<OutOfStockProps[] | undefined>(undefined)
  const [page1, setPage1] = useState(1)
  const [page2, setPage2] = useState(1)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const getStats = useCallback(async () => {
    setLoading(true)
    if (!formData.timeStart) return

    //console.log(formData.timeStart?.toString(), formData.timeEnd?.toString())
    const result1 = await getStatsData({
      dateStart: formData.timeStart,
      dateEnd: formData.timeEnd,
      rangeType: formData.type,
      statsType: formData.statsType,
    })
    if (result1) {
      setStats(buildStats(result1.data))
    }
    const result2 = await getTotalRevenue({
      dateStart: formData.timeStart,
      dateEnd: formData.timeEnd,
      rangeType: formData.type,
    })
    if (result2) {
      setTranStats(buildTranStats(result2.data))
    }
  }, [formData.timeStart, formData.timeEnd, formData.type, formData.statsType])

  const buildStats = (data: any) => {
    const timeList = getTimeList(formData.timeStart, formData.timeEnd, formData.type as ManipulateType)
    let i = 0
    //console.log(timeList);
    const stats = timeList?.map((item) => {
      if (i === data.length || item !== data[i].time) {
        return {
          time: item,
          total: 0,
        }
      } else {
        i++
        return {
          time: item,
          total: data[i - 1].total,
        }
      }
    })
    return stats
  }

  useEffect(() => {
    getStats()
  }, [formData.timeEnd, formData.timeStart, formData.type, formData.statsType, getStats])
  useEffect(() => {
    if (stats && tranStats) setLoading(false)
  }, [tranStats, stats])

  useEffect(() => {
    getOutOfStockItem()
      .then((res) => {
        const result = res?.data?.map((el: OutOfStockProps, key: number) => ({
          no: key + 1,
          id: el.id,
          name: el.name,
          quantity: el.quantity,
        }))
        setOutOfStock(result)
      })
      .catch((err) => console.log(err))
    getBestSellerProduct()
      .then((res) => {
        const result = res.data.map((el: BestSellerProps, key: number) => ({
          no: key + 1,
          id: el.id,
          name: el.name,
          saleCount: el.saleCount,
        }))
        setBestSeller(result)
      })
      .catch((err) => console.log(err))
  }, [])

  const bestSellerColumns: any = [
    {
      title: 'Top',
      dataIndex: 'no',
      key: 'no',
      width: '10%',
      render: (value: any, record: any, index: number) => {
        const no = index + 1 + 5 * (page1 - 1)
        return (
          <div
            className={`${
              no === 1
                ? 'font-bold text-[1.3rem] text-[#A7604E]'
                : no === 2
                ? 'text-[1.2rem] text-[#A6874B]'
                : no === 3
                ? 'text-[1.1rem] text-[#355644]'
                : ''
            }`}
          >
            {no}
          </div>
        )
      },
    },
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      width: '15%',
      render: (value: any, record: any, index: number) => {
        const no = index + 1 + 5 * (page1 - 1)
        return (
          <div
            className={`${
              no === 1
                ? 'font-bold text-[1.3rem] text-[#A7604E]'
                : no === 2
                ? 'text-[1.2rem] text-[#A6874B]'
                : no === 3
                ? 'text-[1.1rem] text-[#355644]'
                : ''
            }`}
          >
            {value}
          </div>
        )
      },
    },
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
      render: (value: any, record: any, index: number) => {
        const no = index + 1 + 5 * (page1 - 1)
        return (
          <div
            className={`${
              no === 1
                ? 'font-bold text-[1.3rem] text-[#A7604E]'
                : no === 2
                ? 'text-[1.2rem] text-[#A6874B]'
                : no === 3
                ? 'text-[1.1rem] text-[#355644]'
                : ''
            }`}
          >
            {value}
          </div>
        )
      },
    },
    {
      title: 'Sale quantity',
      dataIndex: 'saleCount',
      key: 'saleCount',
      align: 'center',
      width: '20%',
      render: (value: any, record: any, index: number) => {
        const no = index + 1 + 5 * (page1 - 1)
        return (
          <div
            className={`${
              no === 1
                ? 'font-bold text-[1.3rem] text-[#A7604E]'
                : no === 2
                ? 'text-[1.2rem] text-[#A6874B]'
                : no === 3
                ? 'text-[1.1rem] text-[#987272]'
                : ''
            }`}
          >
            {value}
          </div>
        )
      },
    },
    {
      title: 'Action',
      align: 'center',
      dataIndex: '',
      //@ts-ignore
      render: ({ id }) => (
        <Button
          onClick={() => {
            navigate(`/admin/product/${id}`, { state: { status: { status: id } } })
          }}
          className="m-auto py-[5px] flex  items-center"
        >
          Detail
        </Button>
      ),
    },
  ]
  const outOfStockColumns: any = [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      width: '10%',
      render: (value: any, record: any, index: number) => {
        return <div>{index + 1 + 5 * (page2 - 1)}</div>
      },
    },
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      width: '15%',
    },
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '20%',
      align: 'center',
    },
    {
      title: 'Action',
      align: 'center',
      dataIndex: '',
      //@ts-ignore
      render: ({ id }) => (
        <Button
          onClick={() => {
            navigate(`/admin/product/${id}`, { state: { status: { status: id } } })
          }}
          className="m-auto py-[5px] flex  items-center"
        >
          Detail
        </Button>
      ),
    },
  ]
  const handlePageChange1 = (page: any) => {
    setPage1(page.current)
  }
  const handlePageChange2 = (page: any) => {
    setPage2(page.current)
  }
  //if (loading) return (<SpinContainer spinning={true} size="large" type='auto' width='100%' height="50vh" />)
  return (
    <div className="bg-[#FFFFFF] w-[100%] px-[4rem] py-4">
      <div className="mt-5 flex justify-end mb-[2rem]">
        <div className="flex items-center justify-end">
          <div className="">
            <span>Sort by: </span>
          </div>
          <div className="ml-5">
            <Controller
              control={control}
              name="type"
              render={({ field: { value, onChange } }) => (
                <Select className="w-full lg:min-w-[120px]" size="large" {...{ value, onChange }}>
                  {statsRangeTypes.map(({ key, value }) => (
                    <Select.Option value={key} key={key}>
                      {value}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </div>

          <div className="ml-5">
            <Space size={12} className="flex justify-between">
              <Controller
                control={control}
                name="timeStart"
                render={({ field: { value, onChange } }) => (
                  <RawDatePicker
                    {...{ value, onChange }}
                    className="s-picker"
                    size="large"
                    picker={
                      formData.type === RangeStatsType.YEARLY
                        ? 'year'
                        : formData.type === RangeStatsType.MONTHLY
                        ? 'month'
                        : 'date'
                    }
                  />
                )}
              />
              <span>〜</span>
              <Controller
                control={control}
                name="timeEnd"
                render={({ field: { value, onChange } }) => (
                  <RawDatePicker
                    {...{ value, onChange }}
                    className="s-picker"
                    size="large"
                    picker={
                      formData.type === RangeStatsType.YEARLY
                        ? 'year'
                        : formData.type === RangeStatsType.MONTHLY
                        ? 'month'
                        : 'date'
                    }
                    disabled={formData.type === RangeStatsType.HOURLY}
                  />
                )}
              />
            </Space>
          </div>
        </div>
      </div>
      {!loading && (
        <>
          <div>
            <Row gutter={32} className="">
              <StatsCard
                span={6}
                data={
                  <>
                    {formatUnit(tranStats?.successRevenue ?? 0)} <span className="text-[0.75rem]">VND</span>
                  </>
                }
                label={'SUCCESS REVENUE'}
                icon={<DollarCircleFilled className="text-[30px]" />}
                children={
                  <div>
                    <Subtitle
                      title={`${
                        tranStats?.totalRevenue
                          ? Math.floor(((tranStats?.successRevenue ?? 0) * 100) / tranStats?.totalRevenue)
                          : 0
                      } % successful`}
                    >
                      <Progress
                        percent={
                          tranStats?.totalRevenue
                            ? Math.floor(((tranStats?.confirmedRevenue ?? 0) * 100) / tranStats?.totalRevenue)
                            : 0
                        }
                        success={{
                          percent: tranStats?.totalRevenue
                            ? Math.floor(((tranStats?.successRevenue ?? 0) * 100) / tranStats?.totalRevenue)
                            : 0,
                          strokeColor: '#FF896B',
                        }}
                        strokeColor={'#FFCA66'}
                        trailColor={'white'}
                      />
                    </Subtitle>
                  </div>
                }
              />
              <StatsCard
                span={6}
                data={
                  <>
                    {formatUnit(tranStats?.onlineRevenue ?? 0)} <span className="text-[0.75rem]">VND</span>
                  </>
                }
                label={'ONLINE PAYMENT'}
                icon={<WalletFilled className="text-[30px]" />}
                children={
                  <div>
                    <Subtitle
                      title={`${
                        tranStats?.successRevenue
                          ? Math.floor(((tranStats?.onlineRevenue ?? 0) * 100) / tranStats?.successRevenue)
                          : 0
                      } % total success revenue`}
                    >
                      <Progress
                        percent={
                          tranStats?.successRevenue
                            ? Math.floor(((tranStats?.onlineRevenue ?? 0) * 100) / tranStats?.successRevenue)
                            : 0
                        }
                        strokeColor={'#FFCA66'}
                        trailColor={'white'}
                      />
                    </Subtitle>
                  </div>
                }
              />

              <StatsCard
                span={6}
                data={<>{formatUnit(tranStats?.successTrans ?? 0)}</>}
                label={'SUCCESS TRANS'}
                icon={<ProjectFilled className="text-[30px]" />}
                children={
                  <div>
                    <Subtitle
                      title={`${
                        tranStats?.totalTrans
                          ? Math.floor(((tranStats?.successTrans ?? 0) * 100) / tranStats?.totalTrans)
                          : 0
                      } % successful`}
                    >
                      <Progress
                        percent={
                          tranStats?.totalTrans
                            ? Math.floor(((tranStats?.totalConfirmedTrans ?? 0) * 100) / tranStats?.totalTrans)
                            : 0
                        }
                        success={{
                          percent: tranStats?.totalTrans
                            ? Math.floor(((tranStats?.successTrans ?? 0) * 100) / tranStats?.totalTrans)
                            : 0,
                          strokeColor: '#FF896B',
                        }}
                        strokeColor={'#FFCA66'}
                        trailColor={'white'}
                      />
                    </Subtitle>
                  </div>
                }
              />
              <StatsCard
                span={6}
                data={
                  <>
                    {tranStats?.totalTrans
                      ? Math.round(
                          ((tranStats?.totalCancelTrans ?? 0) * 100) /
                            ((tranStats?.totalCancelTrans ?? 0) + tranStats?.totalTrans)
                        )
                      : 0}{' '}
                    %
                  </>
                }
                label={'CANCELATION RATE'}
                icon={<WalletFilled className="text-[30px]" />}
                children={
                  <div>
                    <Subtitle
                      title={`${
                        tranStats?.totalTrans
                          ? Math.round(
                              ((tranStats?.totalCancelTrans ?? 0) * 100) /
                                ((tranStats?.totalCancelTrans ?? 0) + tranStats?.totalTrans)
                            )
                          : 0
                      } % total transactions`}
                    >
                      <Progress
                        percent={
                          tranStats?.totalTrans
                            ? Math.round(
                                ((tranStats?.totalCancelTrans ?? 0) * 100) /
                                  ((tranStats?.totalCancelTrans ?? 0) + tranStats?.totalTrans)
                              )
                            : 0
                        }
                        strokeColor={'#FFCA66'}
                        trailColor={'white'}
                      />
                    </Subtitle>
                  </div>
                }
              />
            </Row>
          </div>

          <div className="chart-container mt-[4rem] max-w-full overflow-x-auto mb-[5rem] flex">
            <div>
              <Controller
                control={control}
                name="statsType"
                render={({ field: { onChange, value } }) => (
                  <Radio.Group
                    value={value}
                    onChange={onChange}
                    size="large"
                    className="!flex flex-col font-medium mr-[3rem]"
                  >
                    <div className="text-[20px] !mb-4 rounded tracking-widest">REVENUE STATISTICS</div>
                    {/* <Radio
                                            value={StatsType.USER}
                                            className="text-[16px] !mb-4 rounded tracking-widest"
                                            disabled={formData.type !== RangeStatsType.MONTHLY && formData.type !== RangeStatsType.YEARLY}
                                        >
                                            USER DEVELOPMENT RATE
                                        </Radio> */}
                  </Radio.Group>
                )}
              />
            </div>
            <div className="max-sm:h-[40vh] max-sm:w-[600px]">
              {(stats?.length ?? 0) > 0 && formData.statsType === StatsType.REVENUE && (
                <LineChart
                  className="mx-auto"
                  width={800}
                  height={400}
                  data={stats}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="total" fill="#7F4227" />
                </LineChart>
              )}
              {(stats?.length ?? 0) > 0 && formData.statsType === StatsType.USER && (
                <LineChart
                  className="mx-auto"
                  width={800}
                  height={400}
                  data={stats}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="total" fill="#7F4227" />
                </LineChart>
              )}
              {(stats?.length ?? 0) === 0 && (
                <div className="flex flex-col w-[800px] h-[400px] justify-start">
                  <img src={`${NoData}`} alt="no data" className="mx-auto h-[360px]" />
                  <div className="text-center text-[#7F4227]">No data during this time!</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {loading && <SpinContainer spinning={true} size="large" type="auto" width="100%" height="50vh" />}
      <div className="mb-[2rem] mt-[3rem]">
        <div className="mb-5 text-[1.25rem]">
          <span className="font-medium">TOP HOT SELLING PRODUCTS:</span>
        </div>
        <div>
          <Table
            dataSource={bestSeller}
            columns={bestSellerColumns}
            onChange={handlePageChange1}
            pagination={{ pageSize: 5 }}
          ></Table>
        </div>
      </div>
      <div className="mb-[3rem]">
        <div className="mb-5 text-[1.25rem]">
          <span className="font-medium">TOP PRODUCTS OUT OF STOCK:</span>
        </div>
        <div>
          <Table
            dataSource={outOfStock}
            columns={outOfStockColumns}
            onChange={handlePageChange2}
            pagination={{ pageSize: 5 }}
          ></Table>
        </div>
      </div>
    </div>
  )
}

export default DashBoardAdminContainer

const statsRangeTypes = [
  {
    key: RangeStatsType.HOURLY,
    value: 'By hour',
  },
  {
    key: RangeStatsType.DAILY,
    value: 'By day',
  },
  {
    key: RangeStatsType.MONTHLY,
    value: 'By month',
  },
  {
    key: RangeStatsType.YEARLY,
    value: 'By year',
  },
]

function formatUnit(unit: number) {
  let floor: number
  let unitSymbol = ''
  if (unit >= 1000000000) {
    floor = 1000000000
    unitSymbol = 'B'
  } else if (unit >= 1000000) {
    floor = 1000000
    unitSymbol = 'M'
  } else if (unit > 1000) {
    floor = 1000
    unitSymbol = 'K'
  } else return unit.toString()
  let formattedNumber = (unit / floor).toLocaleString('en-US', { maximumFractionDigits: 5 })
  return formattedNumber + unitSymbol
}

type StatsCardProps = {
  data?: React.ReactNode
  label?: string
  icon?: React.ReactNode
  children?: React.ReactNode
  span?: number
}

export const StatsCard = ({ data, label, icon, children, span }: React.PropsWithChildren<StatsCardProps>) => {
  return (
    <>
      <Col span={span} className="flex-grow">
        <Card
          bordered={false}
          bodyStyle={{
            background: `linear-gradient(to right, #80d5e8, #1e7a99)`,
            borderRadius: '0.5rem',
            color: 'white',
            height: '100%',
          }}
          className="drop-shadow-md"
        >
          <div className="grid grid-cols-4 gap-4 items-start">
            <div className="col-span-3">
              <div className="lg:text-[24px] font-medium">{data}</div>
              <div className="lg:text-sm  mb-1 font-medium">{label}</div>
            </div>
            <div className="col-span-1 text-center h-[3rem] w-[3rem]">{icon}</div>
          </div>
          {children}
        </Card>
      </Col>
      <style>
        {`.ant-progress-text{
                    color: white !important;
                }`}
      </style>
    </>
  )
}

function getTimeList(start: Dayjs, end: Dayjs, type: ManipulateType) {
  if (type === 'hour') end = start.endOf('day')
  if (!end) end = dayjs(new Date())
  let format = ''
  switch (type) {
    case 'hour':
      format = 'HH'
      break
    case 'day':
      format = 'YYYY-MM-DD'
      break
    case 'month':
      format = 'YYYY-MM'
      break
    case 'year':
      format = 'YYYY'
      break
    default:
      return
  }
  var timeList = []

  while (start.isSameOrBefore(end)) {
    timeList.push(start.format(format))
    start = start.add(1, type)
  }

  return timeList
}
