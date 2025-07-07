import React from 'react'
import { theme } from '@static/theme'
import { useStyles } from './style'
import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { plusIcon, unknownTokenIcon } from '@static/icons'
import { NetworkType } from '@store/consts/static'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import {
  addressToTicker,
  calculateAPYAndAPR,
  formatNumberWithCommas,
  initialXtoY,
  parseFeeToPathFee,
  printBN,
  ROUTES
} from '@utils/utils'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import { shortenAddress } from '@utils/uiUtils'
import { VariantType } from 'notistack'
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined'

import { BN } from '@coral-xyz/anchor'
import { useDispatch } from 'react-redux'
import { actions } from '@store/reducers/navigation'

export interface IProps {
  fee?: number
  displayType: string
  symbolFrom?: string
  symbolTo?: string
  iconFrom?: string
  iconTo?: string
  volume?: number
  TVL?: number
  tokenIndex?: number
  hideBottomLine?: boolean
  addressFrom?: string
  addressTo?: string
  network: NetworkType
  apy?: number
  pointsPerSecond?: string
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
  volume,
  TVL,
  tokenIndex,
  hideBottomLine = false,
  addressFrom,
  addressTo,
  network,
  poolAddress,
  copyAddressHandler,
  pointsPerSecond,
  apy = 0,
  showAPY
}) => {
  const { classes, cx } = useStyles()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  const handleOpenPosition = () => {
    const isXtoY = initialXtoY(addressFrom ?? '', addressTo ?? '')

    const tokenA = isXtoY
      ? addressToTicker(network, addressFrom ?? '')
      : addressToTicker(network, addressTo ?? '')
    const tokenB = isXtoY
      ? addressToTicker(network, addressTo ?? '')
      : addressToTicker(network, addressFrom ?? '')

    dispatch(actions.setNavigation({ address: location.pathname }))
    navigate(
      ROUTES.getNewPositionRoute(
        tokenA,
        tokenB,
        parseFeeToPathFee(Math.round(fee * 10 ** (DECIMAL - 2)))
      ),
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

  const { convertedApy, convertedApr } = calculateAPYAndAPR(apy, poolAddress, volume, fee, TVL)

  const isXtoY = initialXtoY(addressFrom ?? '', addressTo ?? '')

  const tokenAData = isXtoY
    ? {
        symbol: symbolFrom,
        icon: iconFrom
      }
    : {
        symbol: symbolTo,
        icon: iconTo
      }

  const tokenBData = isXtoY
    ? {
        symbol: symbolTo,
        icon: iconTo
      }
    : {
        symbol: symbolFrom,
        icon: iconFrom
      }

  return (
    <Grid maxWidth='100%' className={classes.wrapper}>
      {displayType === 'token' ? (
        <Grid
          container
          classes={{
            container: cx(classes.container, { [classes.containerNoAPY]: !showAPY })
          }}
          style={hideBottomLine ? { border: 'none' } : undefined}>
          {!isMd ? <Typography>{tokenIndex}</Typography> : null}
          <Grid className={classes.imageContainer}>
            {!isSm && (
              <Box className={classes.iconsWrapper}>
                <Box className={classes.iconContainer}>
                  <img
                    className={classes.tokenIcon}
                    src={tokenAData.icon}
                    alt='Token from'
                    onError={e => {
                      e.currentTarget.src = unknownTokenIcon
                    }}
                  />
                </Box>
                <Box className={classes.iconContainer}>
                  <img
                    className={classes.tokenIcon}
                    src={tokenBData.icon}
                    alt='Token to'
                    onError={e => {
                      e.currentTarget.src = unknownTokenIcon
                    }}
                  />
                </Box>
              </Box>
            )}
            {(!isMd || isSm) && (
              <Grid className={classes.symbolsContainer}>
                <Typography>
                  {shortenAddress(tokenAData.symbol ?? '')}/
                  {shortenAddress(tokenBData.symbol ?? '')}
                </Typography>
                <TooltipHover title='Copy pool address'>
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
              {`${convertedApy > 1000 ? '>1000%' : convertedApy === 0 ? '' : Math.abs(convertedApy).toFixed(2) + '%'}`}
              <span className={classes.apy}>
                {`${convertedApr > 1000 ? '>1000%' : convertedApr === 0 ? '-' : Math.abs(convertedApr).toFixed(2) + '%'}`}
              </span>
            </Typography>
          ) : null}
          <Typography>{fee}%</Typography>
          <Typography>
            {formatNumberWithCommas(
              printBN(new BN(pointsPerSecond, 'hex').muln(24).muln(60).muln(60), 0)
            )}
          </Typography>

          {!isSm && (
            <Box className={classes.action}>
              <TooltipHover title='Add position'>
                <button className={classes.actionButton} onClick={handleOpenPosition}>
                  <img width={32} height={32} src={plusIcon} alt={'Open'} />
                </button>
              </TooltipHover>
            </Box>
          )}
        </Grid>
      ) : (
        <Grid
          container
          classes={{
            container: cx(classes.container, { [classes.containerNoAPY]: !showAPY }),
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
              APY<span className={classes.apy}>APR</span>
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
