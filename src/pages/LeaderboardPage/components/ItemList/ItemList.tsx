import React from 'react'
import { useStyles } from './style'
import { Grid } from '@mui/material'
import Item from '../Item/Item'

// interface PoolListInterface {
// data: Array<{
//   symbolFrom: string
//   symbolTo: string
//   iconFrom: string
//   iconTo: string
//   volume: number
//   TVL: number
//   fee: number
//   lockedX: number
//   lockedY: number
//   liquidityX: number
//   liquidityY: number
//   addressFrom: string
//   addressTo: string
//   apy: number
//   apyData: {
//     fees: number
//     accumulatedFarmsAvg: number
//     accumulatedFarmsSingleTick: number
//   }
//   isUnknownFrom: boolean
//   isUnknownTo: boolean
//   poolAddress: string
// }>
// network: NetworkType
// copyAddressHandler: (message: string, variant: VariantType) => void
// }

const ItemList = () => {
  const { classes } = useStyles()

  // const sortedData = useMemo(() => {
  //   switch (sortType) {
  //     case SortTypePoolList.NAME_ASC:
  //       return data.sort((a, b) =>
  //         `${a.symbolFrom}/${a.symbolTo}`.localeCompare(`${b.symbolFrom}/${b.symbolTo}`)
  //       )
  //     case SortTypePoolList.NAME_DESC:
  //       return data.sort((a, b) =>
  //         `${b.symbolFrom}/${b.symbolTo}`.localeCompare(`${a.symbolFrom}/${a.symbolTo}`)
  //       )
  //     case SortTypePoolList.FEE_ASC:
  //       return data.sort((a, b) => a.fee - b.fee)
  //     case SortTypePoolList.FEE_DESC:
  //       return data.sort((a, b) => b.fee - a.fee)
  //     case SortTypePoolList.VOLUME_ASC:
  //       return data.sort((a, b) => (a.volume === b.volume ? a.TVL - b.TVL : a.volume - b.volume))
  //     case SortTypePoolList.VOLUME_DESC:
  //       return data.sort((a, b) => (a.volume === b.volume ? b.TVL - a.TVL : b.volume - a.volume))
  //     case SortTypePoolList.TVL_ASC:
  //       return data.sort((a, b) => (a.TVL === b.TVL ? a.volume - b.volume : a.TVL - b.TVL))
  //     case SortTypePoolList.TVL_DESC:
  //       return data.sort((a, b) => (a.TVL === b.TVL ? b.volume - a.volume : b.TVL - a.TVL))
  //     // case SortType.APY_ASC:
  //     //   return data.sort((a, b) => a.apy - b.apy)
  //     // case SortType.APY_DESC:
  //     //   return data.sort((a, b) => b.apy - a.apy)
  //   }
  // }, [data, sortType])

  // useEffect(() => {
  //   setPage(1)
  // }, [data])

  // const handleChangePagination = (currentPage: number) => setPage(currentPage)

  // const paginator = (currentPage: number) => {
  //   const page = currentPage || 1
  //   const perPage = 10
  //   const offest = (page - 1) * perPage

  //   return sortedData.slice(offest).slice(0, perPage)
  // }

  // const pages = Math.ceil(data.length / 10)

  return (
    <Grid container direction='column' classes={{ root: classes.container }}>
      <>
        <Item displayType='header' />
        <Item displayType='token' tokenIndex={45} username='0x5754676574553434243432' isYou />
        <Item displayType='token' tokenIndex={1} username='0x4534534534534533534534455' />
        <Item
          displayType='token'
          tokenIndex={2}
          totalPoints={23432}
          username='0x423235t459645utdjfgkjdfbgd'
        />
        <Item
          displayType='token'
          tokenIndex={3}
          pointsIncome={453}
          username='0x49045i690uregdfkjgDsvbkdsbs'
        />
        <Item
          displayType='token'
          hideBottomLine
          tokenIndex={4}
          username='0xgnejj45iojt5344rwjnfjkdn'
        />
      </>
    </Grid>
  )
}
export default ItemList
