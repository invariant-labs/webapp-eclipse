import React from 'react'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { useMediaQuery, Grid, Typography, Box } from '@mui/material'
import { airdropRainbowIcon, plusIcon, unknownTokenIcon } from '@static/icons'
import { colors, theme, typography } from '@static/theme'
import { shortenAddress } from '@utils/uiUtils'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStyles } from './style'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import {
  addressToTicker,
  calculateAPYAndAPR,
  formatNumberWithCommas,
  initialXtoY,
  parseFeeToPathFee,
  printBN,
  ROUTES
} from '@utils/utils'
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined'
import { IProps } from '../PoolListItem'
import { BN } from '@coral-xyz/anchor'
import { useDispatch } from 'react-redux'
import { actions } from '@store/reducers/navigation'

export const MobilePoolListItem: React.FC<IProps> = ({
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
  pointsPerSecond,
  showAPY,
  volume,
  TVL
}) => {
  const { classes, cx } = useStyles()
  const navigate = useNavigate()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useDispatch()
  const location = useLocation()
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

  //HOTFIX
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
        <>
          <Grid
            container
            classes={{
              container: cx(classes.container, { [classes.containerNoAPY]: !showAPY })
            }}
            style={{
              border: hideBottomLine ? 'none' : undefined
            }}>
            <Typography>{tokenIndex}</Typography>
            <Grid className={classes.imageContainer}>
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
              {isMd && (
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
                  <img src={airdropRainbowIcon} height={20} style={{ marginLeft: '8px' }} />
                </Grid>
              )}
            </Grid>

            <Box className={classes.action}>
              <TooltipHover title='Add position'>
                <button className={classes.actionButton} onClick={handleOpenPosition}>
                  <img width={32} height={32} src={plusIcon} alt={'Open'} />
                </button>
              </TooltipHover>
            </Box>
          </Grid>
          <Grid className={classes.infoWrapper}>
            <Box>
              <Typography style={{ ...typography.body2, color: colors.invariant.textGrey }}>
                Fee
              </Typography>
              <Typography style={{ ...typography.heading4, color: colors.invariant.text }}>
                {fee}%
              </Typography>
            </Box>
            <Box>
              <Box style={{ display: 'flex' }}>
                <span className={classes.APYLabel}>APY</span>
                <span className={classes.APRLabel}>APR</span>
              </Box>
              <Box style={{ display: 'flex' }}>
                <span className={classes.APYValue}>
                  {convertedApy > 1000
                    ? '>1000%'
                    : convertedApy === 0
                      ? ''
                      : Math.abs(convertedApy).toFixed(2) + '%'}
                </span>
                <span className={classes.APRValue}>
                  {convertedApr > 1000
                    ? '>1000%'
                    : convertedApr === 0
                      ? ''
                      : Math.abs(convertedApr).toFixed(2) + '%'}
                </span>
              </Box>
            </Box>
            <Box>
              <Typography style={{ ...typography.body2, color: colors.invariant.textGrey }}>
                Points per 24H
              </Typography>

              <Typography style={{ ...typography.heading4, color: colors.invariant.text }}>
                {formatNumberWithCommas(
                  printBN(new BN(pointsPerSecond, 'hex').muln(24).muln(60).muln(60), 0)
                )}
              </Typography>
            </Box>
          </Grid>
        </>
      ) : (
        <Grid
          container
          classes={{
            container: cx(classes.container),
            root: classes.header
          }}>
          <Typography style={{ lineHeight: '11px' }}>
            N<sup>o</sup>
          </Typography>
          <Typography style={{ cursor: 'pointer' }}>Name</Typography>
          <Typography align='right'>Action</Typography>
        </Grid>
      )}
    </Grid>
  )
}
