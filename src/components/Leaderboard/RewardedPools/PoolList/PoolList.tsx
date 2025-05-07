import React, { useEffect } from 'react'
import PoolListItem from './PoolListItem/PoolListItem'
import { useStyles } from './style'
import { Box, Grid, useMediaQuery } from '@mui/material'
import { NetworkType } from '@store/consts/static'
import { VariantType } from 'notistack'
import { MobilePoolListItem } from './PoolListItem/Variants/MobilePoolListItem'
import { theme } from '@static/theme'

export interface PoolListInterface {
  data: Array<{
    symbolFrom: string
    symbolTo: string
    iconFrom: string
    iconTo: string
    volume: number
    TVL: number
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
    pointsPerSecond: string
  }>
  network: NetworkType
  copyAddressHandler: (message: string, variant: VariantType) => void
  isLoading: boolean
  showAPY: boolean
  disableBackground?: boolean
}

const PoolList: React.FC<PoolListInterface> = ({
  data,
  network,
  copyAddressHandler,
  isLoading,
  showAPY,
  disableBackground = false
}) => {
  const { classes, cx } = useStyles()
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
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <div
      className={cx({ [classes.loadingOverlay]: isLoading })}
      style={{
        width: '100%'
      }}>
      <Grid
        container
        direction='column'
        classes={{
          root: cx(classes.container, disableBackground ? classes.transparent : classes.background)
        }}>
        <>
          {!isMd ? (
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
                  pointsPerSecond={element.pointsPerSecond}
                  copyAddressHandler={copyAddressHandler}
                  showAPY={showAPY}
                  volume={element.volume}
                  TVL={element.TVL}
                />
              ))}
              <Box className={classes.tableFooter} />
            </>
          ) : (
            <>
              <MobilePoolListItem
                displayType='header'
                network={network}
                showAPY={showAPY}
                hideBottomLine
              />
              {paginator(page).map((element, index) => (
                <MobilePoolListItem
                  displayType='token'
                  tokenIndex={index + 1 + (page - 1) * 10}
                  symbolFrom={element.symbolTo}
                  symbolTo={element.symbolFrom}
                  iconFrom={element.iconTo}
                  iconTo={element.iconFrom}
                  fee={element.fee}
                  apy={element.apy}
                  hideBottomLine={pages === 1 && index + 1 === data.length}
                  apyData={element.apyData}
                  key={index}
                  addressFrom={element.addressTo}
                  addressTo={element.addressFrom}
                  network={network}
                  poolAddress={element.poolAddress}
                  pointsPerSecond={element.pointsPerSecond}
                  copyAddressHandler={copyAddressHandler}
                  showAPY={showAPY}
                  volume={element.volume}
                  TVL={element.TVL}
                />
              ))}
              <Box className={classes.tableFooter} />
            </>
          )}
        </>
      </Grid>
    </div>
  )
}
export default PoolList
