import React from 'react'
import { theme } from '@static/theme'
import { useStyles } from './style'
import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import icons from '@static/icons'
import { NetworkType } from '@store/consts/static'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import { addressToTicker, parseFeeToPathFee } from '@utils/utils'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import { apyToApr, shortenAddress } from '@utils/uiUtils'
import { VariantType } from 'notistack'
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined'

import classNames from 'classnames'

interface IProps {
  fee?: number
  displayType: string
  symbolFrom?: string
  symbolTo?: string
  iconFrom?: string
  iconTo?: string
  tokenIndex?: number
  hideBottomLine?: boolean
  addressFrom?: string
  addressTo?: string
  network: NetworkType
  apy?: number
  apyData?: {
    fees: number
    accumulatedFarmsAvg: number
    accumulatedFarmsSingleTick: number
  }
  poolAddress?: string
  copyAddressHandler?: (message: string, variant: VariantType) => void
  showAPY: boolean
}

const PoolListItem: React.FC<IProps> = ({
  fee = 0,
  displayType,
  symbolFrom,
  symbolTo,
  iconFrom,
  iconTo,
  tokenIndex,
  hideBottomLine = false,
  addressFrom,
  addressTo,
  network,
  poolAddress,
  copyAddressHandler,
  apy = 0,
  showAPY
}) => {
  const { classes } = useStyles()
  const navigate = useNavigate()
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  const handleOpenPosition = () => {
    navigate(
      `/newPosition/${addressToTicker(network, addressFrom ?? '')}/${addressToTicker(network, addressTo ?? '')}/${parseFeeToPathFee(Math.round(fee * 10 ** (DECIMAL - 2)))}`,
      { state: { referer: 'stats' } }
    )
  }

  const copyToClipboard = () => {
    if (!poolAddress || !copyAddressHandler) {
      return
    }
    navigator.clipboard
      .writeText(poolAddress)
      .then(() => {
        copyAddressHandler('Market ID copied to Clipboard', 'success')
      })
      .catch(() => {
        copyAddressHandler('Failed to copy Market ID to Clipboard', 'error')
      })
  }

  const apr = apyToApr(apy)

  return (
    <Grid maxWidth='100%'>
      {displayType === 'token' ? (
        <Grid
          container
          classes={{
            container: classNames(classes.container, { [classes.containerNoAPY]: !showAPY })
          }}
          style={hideBottomLine ? { border: 'none' } : undefined}>
          {!isMd ? <Typography>{tokenIndex}</Typography> : null}
          <Grid className={classes.imageContainer}>
            {!isSm && (
              <Box className={classes.iconsWrapper}>
                <Box className={classes.iconContainer}>
                  <img
                    className={classes.tokenIcon}
                    src={iconFrom}
                    alt='Token from'
                    onError={e => {
                      e.currentTarget.src = icons.unknownToken
                    }}
                  />
                </Box>
                <Box className={classes.iconContainer}>
                  <img
                    className={classes.tokenIcon}
                    src={iconTo}
                    alt='Token to'
                    onError={e => {
                      e.currentTarget.src = icons.unknownToken
                    }}
                  />
                </Box>
              </Box>
            )}
            {(!isMd || isSm) && (
              <Grid className={classes.symbolsContainer}>
                <Typography>
                  {shortenAddress(symbolFrom ?? '')}/{shortenAddress(symbolTo ?? '')}
                </Typography>
                <TooltipHover text='Copy pool address'>
                  <FileCopyOutlinedIcon
                    onClick={copyToClipboard}
                    classes={{ root: classes.clipboardIcon }}
                  />
                </TooltipHover>
              </Grid>
            )}
          </Grid>
          {!isSm && showAPY ? (
            <Typography className={classes.row}>
              {`${apr > 1000 ? '>1000%' : apr === 0 ? '-' : apr.toFixed(2) + '%'}`}
              <span
                className={
                  classes.apy
                }>{`${apy > 1000 ? '>1000%' : apy === 0 ? '' : apy.toFixed(2) + '%'}`}</span>
            </Typography>
          ) : null}
          <Typography>{fee}%</Typography>
          <Typography>8,640,000</Typography>

          {!isSm && (
            <Box className={classes.action}>
              <TooltipHover text='Add position'>
                <button className={classes.actionButton} onClick={handleOpenPosition}>
                  <img width={32} height={32} src={icons.plusIcon} alt={'Open'} />
                </button>
              </TooltipHover>
            </Box>
          )}
        </Grid>
      ) : (
        <Grid
          container
          classes={{
            container: classNames(classes.container, { [classes.containerNoAPY]: !showAPY }),
            root: classes.header
          }}>
          {!isMd && (
            <Typography style={{ lineHeight: '11px' }}>
              N<sup>o</sup>
            </Typography>
          )}
          <Typography style={{ cursor: 'pointer' }}>Name</Typography>
          {!isSm && showAPY ? (
            <Typography className={classes.row} style={{ cursor: 'pointer' }}>
              APR <span className={classes.apy}>APY</span>
            </Typography>
          ) : null}
          <Typography style={{ cursor: 'pointer' }}>Fee</Typography>
          <Typography style={{ cursor: 'pointer' }}>Points per 24h</Typography>
          {!isSm && <Typography align='right'>Action</Typography>}
        </Grid>
      )}
    </Grid>
  )
}

export default PoolListItem
