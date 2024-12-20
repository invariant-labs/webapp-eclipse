import React, { useEffect } from 'react'
import PoolListItem from '../PoolListItem/PoolListItem'
import { useStyles } from './style'
import { Grid } from '@mui/material'
import { NetworkType } from '@store/consts/static'
import { VariantType } from 'notistack'
import classNames from 'classnames'

export interface PoolListInterface {
  data: Array<{
    symbolFrom: string
    symbolTo: string
    iconFrom: string
    iconTo: string
    fee: number
    addressFrom: string
    addressTo: string
    apy: number
    apyData: {
      fees: number
      accumulatedFarmsAvg: number
      accumulatedFarmsSingleTick: number
    }
    poolAddress: string
  }>
  network: NetworkType
  copyAddressHandler: (message: string, variant: VariantType) => void
  isLoading: boolean
  showAPY: boolean
}

const PoolList: React.FC<PoolListInterface> = ({
  data,
  network,
  copyAddressHandler,
  isLoading,
  showAPY
}) => {
  const { classes } = useStyles()
  const [page, setPage] = React.useState(1)

  useEffect(() => {
    setPage(1)
  }, [data])

  const paginator = (currentPage: number) => {
    const page = currentPage || 1
    const perPage = 10
    const offest = (page - 1) * perPage

    return data.slice(offest).slice(0, perPage)
  }

  const pages = Math.ceil(data.length / 10)

  return (
    <div className={classNames({ [classes.loadingOverlay]: isLoading })} style={{ width: '100%' }}>
      <Grid container direction='column' classes={{ root: classes.container }}>
        <>
          <PoolListItem displayType='header' network={network} showAPY={showAPY} />
          {paginator(page).map((element, index) => (
            <PoolListItem
              displayType='token'
              tokenIndex={index + 1 + (page - 1) * 10}
              symbolFrom={element.symbolFrom}
              symbolTo={element.symbolTo}
              iconFrom={element.iconFrom}
              iconTo={element.iconTo}
              fee={element.fee}
              apy={element.apy}
              hideBottomLine={pages === 1 && index + 1 === data.length}
              apyData={element.apyData}
              key={index}
              addressFrom={element.addressFrom}
              addressTo={element.addressTo}
              network={network}
              poolAddress={element.poolAddress}
              copyAddressHandler={copyAddressHandler}
              showAPY={showAPY}
            />
          ))}
        </>
      </Grid>
    </div>
  )
}
export default PoolList
