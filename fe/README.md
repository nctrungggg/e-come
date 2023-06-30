1. check lại filter ở product
2. xoá user ở bên admin thì bên user như nào

// <div className="mt-5 ">
// <div className="text-[24px]">Price: </div>
// <Checkbox checked={isOnSale} onChange={(e) => setIsOnSale(e.target.checked)} className="text-base mt-2">
// Sale
// </Checkbox>

// <div>
// <Radio.Group value={sortOrder} onChange={handleChangeSortPrice} className="my-2 flex flex-col gap-2">
// <Radio value="ASC" className="text-base">
// Low to High
// </Radio>
// <Radio className="text-base" value="DESC">
// High to Low
// </Radio>
// </Radio.Group>
// </div>
// <div className="relative pt-4">
// <div className="flex py-2">
// <input
// type="number"
// className="!w-[80px] input-field"
// // defaultValue={priceFilter.minPrice}
// value={priceFilter.minPrice}
// min={0}
// onChange={(event) => handleOnChangeMinPrice(event)}
// onKeyPress={preventMinus}
// />
// <div className="px-3">to</div>
// <input
// type="number"
// className="!w-[80px] input-field"
// // defaultValue={priceFilter.maxPrice}
// min={0}
// value={priceFilter.maxPrice}
// onChange={(event) => handleOnChangeMaxPrice(event)}
// onKeyPress={preventMinus}
// />
// </div>
// {/_ <div className="absolute top-0 right-[90px] cursor-pointer">
// <CloseOutlined className="text-sm" />
// </div> _/}
// </div>
// <div className="flex gap-2">
// <button
// className="w-[80px] h-[35px] border border-[#909090] mt-5 rounded-md text-[#000000de] transition-all duration-300 hover:bg-[#9d9d9d] hover:border-none hover:!text-[#FFFFFF]"
// onClick={handleClearFitlerPrice}
// >
// <p className="text-sm ">RESET</p>
// </button>
// <button
// disabled={priceFilter.maxPrice === 0 ? true : false}
// className={`${
//                   priceFilter.maxPrice === 0 ? 'cursor-not-allowed' : ''
//                 } w-[80px] h-[35px] mt-5 rounded-md bg-baseColor hover:bg-[#a35d3e] text-[#FFFFFF] transition-all duration-300`}
// onClick={() => filterProducts(priceFilter)}
// >
// <p className="text-sm">REFINE</p>
// </button>
// </div>
// </div>

// const filterProducts = (price: TPriceFiler) => {
// const filteredProducts = productData.filter((product) => {
// if (product.price > product.salePrice) {
// if (product.salePrice < price.minPrice! || product.salePrice > price.maxPrice!) {
// return false
// }
// } else if (product.price < price.minPrice! || product.price > price.maxPrice!) {
// return false
// }

// return true
// })

// setFilterData(filteredProducts)
// }

// const handleChangeSortPrice = (event: any) => {
// const value = event.target.value
// setSortOrder(value)

// const attemptValue = [...filterData]

// if (value === 'DESC') {
// attemptValue.sort((a, b) => b.salePrice - a.salePrice)
// }
// if (value === 'ASC') {
// attemptValue.sort((a, b) => a.salePrice - b.salePrice)
// }

// setFilterData(attemptValue)
// }

// // eslint-disable-next-line react-hooks/exhaustive-deps
// const filterSaleProducts = () => {
// if (isOnSale) {
// const filteredProducts = filterData.filter((product) => product.salePrice < product.price)
// setFilterData(filteredProducts)
// } else {
// setFilterData(productData)
// }
// }

// useEffect(() => {
// filterSaleProducts()
// }, [isOnSale])
