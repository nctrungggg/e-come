import NewsItem from './NewsItem'
import 'react-multi-carousel/lib/styles.css'
import { Col, Row } from 'antd'

const data = [
  {
    key: '1',
    image: 'https://s1.r29static.com/bin/entry/ccf/0,0,2000,2400/340x408,85/2216357/image.webp',
    title: '11 Plus Size Women On Their Best Fashion Purchase Of 2019 So Far',
    datePost: 'JULY 9, 2022',
    category: 'Shopping',
  },
  {
    key: '2',
    image: 'https://www.refinery29.com/images/8661724.jpg?format=webp&width=340&height=408&quality=85&crop=5%3A6',
    title: 'Olivia Anthony Thinks There Absolutely Should Be Crying In Fashion',
    datePost: 'Oct 31, 2022',
    category: 'Trends',
  },
  {
    key: '3',
    image: 'https://www.refinery29.com/images/8672141.jpg?format=webp&width=340&height=408&quality=85&crop=5%3A6',
    title: 'Leandra Medine On The Importance Of Maintaining Her Personal Style',
    datePost: 'Nov 30, 2022',
    category: 'Online Shopping',
  },
]

export const News = () => {
  return (
    <>
      <div className="mt-[8vh] bg-[#FFFFFF] rounded-[12px] pb-[4vh]">
        <p className="text-[30px] flex justify-center pt-4">LATEST BLOGS</p>

        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          {data.map((data) => (
            <Col className="gutter-row" span={8} key={data.key}>
              <NewsItem
                category={data.category}
                key={data.key}
                image={data.image}
                title={data.title}
                datePost={data.datePost}
              />{' '}
            </Col>
          ))}
        </Row>
      </div>
    </>
  )
}
