import React, { useEffect, useMemo, useRef, useState } from 'react'
import { colors, theme } from '@static/theme'
import { useStyles } from './style'
import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  airdropRainbowIcon,
  star,
  starFill,
  lockIcon,
  newTabBtnIcon,
  plusIcon,
  unknownTokenIcon,
  plusDisabled,
  warningIcon,
  poolStatsBtnIcon,
  horizontalSwapIcon
} from '@static/icons'
import {
  disabledPools,
  Intervals,
  NetworkType,
  POOLS_TO_HIDE_POINTS_PER_24H,
  SortTypePoolList
} from '@store/consts/static'
import {
  addressToTicker,
  calculateAPYAndAPR,
  initialXtoY,
  parseFeeToPathFee,
  ROUTES
} from '@utils/utils'
import { formatNumberWithSuffix } from '@utils/utils'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { VariantType } from 'notistack'
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined'
import { mapIntervalToString, shortenAddress } from '@utils/uiUtils'
import LockStatsPopover from '@components/Modals/LockStatsPopover/LockStatsPopover'
import PromotedPoolPopover from '@components/Modals/PromotedPoolPopover/PromotedPoolPopover'
import { BN } from '@coral-xyz/anchor'
import { useDispatch } from 'react-redux'
import { actions } from '@store/reducers/navigation'
import ItemValue from './ItemValue/ItemValue'
import BoxValue from './BoxValue/BoxValue'

interface IProps {
  TVL?: number
  volume?: number
  fee?: number
  displayType: string
  symbolFrom?: string
  symbolTo?: string
  iconFrom?: string
  iconTo?: string
  tokenIndex?: number
  sortType?: SortTypePoolList
  onSort?: (type: SortTypePoolList) => void
  addressFrom?: string
  addressTo?: string
  network: NetworkType
  apy?: number
  lockedX?: number
  lockedY?: number
  liquidityX?: number
  liquidityY?: number
  apyData?: {
    fees: number
    accumulatedFarmsAvg: number
    accumulatedFarmsSingleTick: number
  }
  isUnknownFrom?: boolean
  isUnknownTo?: boolean
  isLocked?: boolean
  isPromoted?: boolean
  poolAddress?: string
  copyAddressHandler?: (message: string, variant: VariantType) => void
  showAPY: boolean
  points?: BN
  itemNumber?: number
  interval?: Intervals
  isFavourite?: boolean
  switchFavouritePool?: (poolAddress: string) => void
}

const PoolListItem: React.FC<IProps> = ({
  fee = 0,
  volume = 0,
  TVL = 0,
  lockedX = 0,
  lockedY = 0,
  liquidityX = 0,
  liquidityY = 0,
  displayType,
  symbolFrom,
  symbolTo,
  iconFrom,
  iconTo,
  tokenIndex,
  sortType,
  onSort,
  addressFrom,
  addressTo,
  network,
  apy = 0,
  isUnknownFrom,
  isUnknownTo,
  isLocked,
  isPromoted,
  poolAddress,
  copyAddressHandler,
  points,
  showAPY,
  itemNumber = 0,
  interval = Intervals.Daily,
  isFavourite,
  switchFavouritePool
}) => {
  const [showInfo, setShowInfo] = useState(false)
  const { classes, cx } = useStyles({ showInfo })
  const navigate = useNavigate()

  const isTablet = useMediaQuery(theme.breakpoints.down(1200))

  const isExSm = useMediaQuery(theme.breakpoints.down(380))
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const isSmd = useMediaQuery(theme.breakpoints.down('md'))
  const hideInterval = useMediaQuery(theme.breakpoints.between(600, 650))

  const isMd = useMediaQuery(theme.breakpoints.down(1160))
  const airdropIconRef = useRef<HTMLDivElement>(null)
  const [isPromotedPoolPopoverOpen, setIsPromotedPoolPopoverOpen] = useState(false)
  const intervalSuffix = mapIntervalToString(interval)
  const dispatch = useDispatch()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

  const isXtoY = initialXtoY(addressFrom ?? '', addressTo ?? '')

  const tokenAData = isXtoY
    ? {
        symbol: symbolFrom,
        icon: iconFrom,
        address: addressFrom,
        locked: lockedX,
        liquidity: liquidityX,
        isUnknown: isUnknownFrom
      }
    : {
        symbol: symbolTo,
        icon: iconTo,
        address: addressTo,
        locked: lockedY,
        liquidity: liquidityY,
        isUnknown: isUnknownTo
      }

  const tokenBData = isXtoY
    ? {
        symbol: symbolTo,
        icon: iconTo,
        address: addressTo,
        locked: lockedY,
        liquidity: liquidityY,
        isUnknown: isUnknownTo
      }
    : {
        symbol: symbolFrom,
        icon: iconFrom,
        address: addressFrom,
        locked: lockedX,
        liquidity: liquidityX,
        isUnknown: isUnknownFrom
      }

  const handleOpenPosition = () => {
    const tokenA = addressToTicker(network, tokenAData.address ?? '')
    const tokenB = addressToTicker(network, tokenBData.address ?? '')

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

  const handleOpenSwap = () => {
    navigate(
      ROUTES.getExchangeRoute(
        addressToTicker(network, tokenAData.address ?? ''),
        addressToTicker(network, tokenBData.address ?? '')
      ),
      { state: { referer: 'stats' } }
    )
  }

  const handleOpenPoolDetails = () => {
    const address1 = addressToTicker(network, tokenAData.address ?? '')
    const address2 = addressToTicker(network, tokenBData.address ?? '')
    const parsedFee = parseFeeToPathFee(Math.round(fee * 10 ** (DECIMAL - 2)))
    const isXtoY = initialXtoY(tokenAData.address ?? '', tokenBData.address ?? '')

    const tokenA = isXtoY ? address1 : address2
    const tokenB = isXtoY ? address2 : address1

    dispatch(actions.setNavigation({ address: location.pathname }))

    navigate(ROUTES.getPoolDetailsRoute(tokenA, tokenB, parsedFee), { state: { referer: 'stats' } })
  }

  const networkUrl = useMemo(() => {
    switch (network) {
      case NetworkType.Mainnet:
        return ''
      case NetworkType.Testnet:
        return '?cluster=testnet'
      case NetworkType.Devnet:
        return '?cluster=devnet'
      default:
        return ''
    }
  }, [network])

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

  useEffect(() => {
    if (!isSmd) {
      setShowInfo(false)
    }
  }, [isSmd])

  useEffect(() => {
    setShowInfo(false)
  }, [itemNumber])

  const isDisabled = useMemo(() => {
    if (tokenAData.address === null || tokenBData.address === null) return []

    return disabledPools
      .filter(
        pool =>
          (pool.tokenX.toString() === tokenAData.address &&
            pool.tokenY.toString() === tokenBData.address) ||
          (pool.tokenX.toString() === tokenBData.address &&
            pool.tokenY.toString() === tokenAData.address)
      )
      .flatMap(p => p.feeTiers)
  }, [tokenAData.address, tokenBData.address, disabledPools]).includes(fee.toString())

  const { convertedApy, convertedApr } = calculateAPYAndAPR(apy, poolAddress, volume, fee, TVL)

  return (
    <>
      <Grid
        onClick={e => {
          e.stopPropagation()

          if (isTablet) setShowInfo(prev => !prev)
        }}
        container
        classes={{
          container: cx(classes.container, {
            [classes.containerNoAPY]: !showAPY
          })
        }}>
        <Grid container display='flex' alignItems='center' flexWrap={'nowrap'} mb={'12px'}>
          <ItemValue
            title='Name:'
            style={{ flexShrink: 1, flexBasis: '300px', minWidth: 80 }}
            value={
              <Grid display='flex' alignItems='center' gap={1}>
                {!isSm && (
                  <img
                    className={classes.favouriteButton}
                    src={isFavourite ? starFill : star}
                    onClick={e => {
                      if (poolAddress && switchFavouritePool) {
                        switchFavouritePool(poolAddress)
                      }

                      e.stopPropagation()
                    }}
                  />
                )}
                <Grid className={classes.symbolsWrapper}>
                  <Grid className={classes.imageWrapper}>
                    <img
                      className={classes.tokenIcon}
                      src={tokenAData.icon}
                      alt='Token from'
                      onError={e => {
                        e.currentTarget.src = unknownTokenIcon
                      }}
                    />
                    {tokenAData.isUnknown && tokenAData.icon !== '/unknownToken.svg' && (
                      <img className={classes.warningIcon} src={warningIcon} />
                    )}
                  </Grid>

                  <Grid className={classes.imageToWrapper}>
                    <img
                      className={classes.tokenIcon}
                      src={tokenBData.icon}
                      alt='Token from'
                      onError={e => {
                        e.currentTarget.src = unknownTokenIcon
                      }}
                    />

                    {tokenBData.isUnknown && tokenBData.icon !== '/unknownToken.svg' && (
                      <img className={classes.warningIcon} src={warningIcon} />
                    )}
                  </Grid>
                </Grid>
                {!hideInterval && !isSm && (
                  <Typography
                    sx={{
                      maxWidth: 100,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                    {shortenAddress(tokenAData.symbol ?? '')}/
                    {shortenAddress(tokenBData.symbol ?? '')}
                  </Typography>
                )}

                {!isSm && (
                  <TooltipHover title='Copy pool address'>
                    <FileCopyOutlinedIcon
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        copyToClipboard()
                      }}
                      classes={{ root: classes.clipboardIcon }}
                    />
                  </TooltipHover>
                )}

                {isPromoted && (
                  <PromotedPoolPopover
                    apr={convertedApr}
                    apy={convertedApy}
                    points={
                      poolAddress
                        ? POOLS_TO_HIDE_POINTS_PER_24H.includes(poolAddress?.toString())
                          ? new BN(0)
                          : points
                        : new BN(0)
                    }>
                    <Box
                      className={cx(classes.actionButton)}
                      ref={airdropIconRef}
                      onPointerEnter={() => {
                        if (!isMobile) {
                          setIsPromotedPoolPopoverOpen(true)
                        }
                      }}
                      onPointerLeave={() => {
                        if (!isMobile) {
                          setIsPromotedPoolPopoverOpen(false)
                        }
                      }}
                      onClick={() => {
                        if (isMobile) {
                          setIsPromotedPoolPopoverOpen(!isPromotedPoolPopoverOpen)
                        }
                      }}
                      mr={3}>
                      <img
                        width={24}
                        height={isSm ? 24 : 32}
                        src={airdropRainbowIcon}
                        alt={'Airdrop'}
                      />
                    </Box>
                  </PromotedPoolPopover>
                )}
              </Grid>
            }
          />

          <ItemValue minWidth={60} title='Fee' value={<Typography>{fee}%</Typography>} />

          {!isSmd && (
            <ItemValue
              minWidth={125}
              title={'APY'}
              value={
                showAPY ? (
                  <Grid className={classes.row} width={80} sx={{ justifyContent: 'space-between' }}>
                    <Box position='relative' maxHeight={24}>
                      <Typography>
                        {`${convertedApy > 1000 ? '>1000%' : convertedApy === 0 ? '' : Math.abs(convertedApy).toFixed(2) + '%'}`}
                      </Typography>
                      <Typography className={classes.apyLabel}>
                        {`${convertedApr > 1000 ? '>1000%' : convertedApr === 0 ? '-' : Math.abs(convertedApr).toFixed(2) + '%'}`}
                      </Typography>
                    </Box>
                  </Grid>
                ) : (
                  '-'
                )
              }
            />
          )}
          <ItemValue
            minWidth={110}
            title={`Volume ${intervalSuffix}`}
            value={`$${formatNumberWithSuffix(volume)}`}
          />

          <ItemValue
            minWidth={90}
            title={`TVL ${intervalSuffix}`}
            value={`$${formatNumberWithSuffix(TVL)}`}
            style={{ flexGrow: isSmd ? 0 : 1 }}
          />

          {!isSmd && (
            <ItemValue
              minWidth={80}
              style={{ flexGrow: isTablet ? 0 : 1 }}
              title={`Fees ${intervalSuffix}`}
              value={`$${formatNumberWithSuffix((fee * 0.01 * volume).toFixed(2))}`}
            />
          )}
          {!isTablet && (
            <ItemValue
              minWidth={192}
              style={{ flexGrow: 0 }}
              title='Action'
              value={
                <Box className={classes.action}>
                  {isLocked && (
                    <TooltipHover
                      maxWidth='none'
                      title={
                        <LockStatsPopover
                          lockedX={tokenAData.locked}
                          lockedY={tokenBData.locked}
                          symbolX={shortenAddress(tokenAData.symbol ?? '')}
                          symbolY={shortenAddress(tokenBData.symbol ?? '')}
                          liquidityX={tokenAData.liquidity}
                          liquidityY={tokenBData.liquidity}
                        />
                      }>
                      <button className={classes.actionButton}>
                        <img width={32} height={32} src={lockIcon} alt={'Lock info'} />
                      </button>
                    </TooltipHover>
                  )}

                  <TooltipHover title='Pool details'>
                    <button className={classes.actionButton} onClick={handleOpenPoolDetails}>
                      <img width={32} height={32} src={poolStatsBtnIcon} alt={'Pool details'} />
                    </button>
                  </TooltipHover>
                  <TooltipHover title='Exchange'>
                    <button className={classes.actionButton} onClick={handleOpenSwap}>
                      <img width={28} src={horizontalSwapIcon} alt={'Exchange'} />
                    </button>
                  </TooltipHover>

                  <TooltipHover title={isDisabled ? 'Pool disabled' : 'Add position'}>
                    <button
                      disabled={isDisabled}
                      style={isDisabled ? { cursor: 'not-allowed' } : {}}
                      className={classes.actionButton}
                      onClick={e => {
                        e.stopPropagation()
                        handleOpenPosition()
                      }}>
                      <img
                        width={32}
                        height={32}
                        style={isDisabled ? { opacity: 0.6 } : {}}
                        src={isDisabled ? plusDisabled : plusIcon}
                        alt={'Open'}
                      />
                    </button>
                  </TooltipHover>

                  <TooltipHover title='Open in explorer'>
                    <button
                      className={classes.actionButton}
                      onClick={e => {
                        e.stopPropagation()
                        window.open(
                          `https://eclipsescan.xyz/account/${poolAddress}${networkUrl}`,
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }}>
                      <img width={32} height={32} src={newTabBtnIcon} alt={'Explorer'} />
                    </button>
                  </TooltipHover>
                </Box>
              }
            />
          )}

          {isTablet && (
            <ArrowDropDownIcon preserveAspectRatio='none' className={classes.extendedRowIcon} />
          )}
        </Grid>
        {isSmd && (
          <Grid container display='flex' alignItems='center'>
            <ItemValue
              minWidth={125}
              title={'APY'}
              value={
                showAPY ? (
                  <Grid className={classes.row} width={80} sx={{ justifyContent: 'space-between' }}>
                    <Box position='relative' maxHeight={24}>
                      <Typography>
                        {`${convertedApy > 1000 ? '>1000%' : convertedApy === 0 ? '' : Math.abs(convertedApy).toFixed(2) + '%'}`}
                      </Typography>
                      <Typography className={classes.apyLabel}>
                        {`${convertedApr > 1000 ? '>1000%' : convertedApr === 0 ? '-' : Math.abs(convertedApr).toFixed(2) + '%'}`}
                      </Typography>
                    </Box>
                  </Grid>
                ) : (
                  '-'
                )
              }
            />
            <ItemValue
              minWidth={80}
              style={{ flexGrow: isTablet ? 0 : 1 }}
              title={`Fees ${intervalSuffix}`}
              value={`$${formatNumberWithSuffix((fee * 0.01 * volume).toFixed(2))}`}
            />
          </Grid>
        )}
        {isTablet && (
          <Grid gap={'12px'} display='flex' container flexDirection='column'>
            <Box className={classes.info}>
              <Grid container gap={'8px'} overflow={'hidden'}>
                {isMdUp && isLocked && (
                  <Box display='flex' flex={1}>
                    <TooltipHover
                      fullSpan
                      maxWidth='none'
                      title={
                        <LockStatsPopover
                          lockedX={tokenAData.locked}
                          lockedY={tokenBData.locked}
                          symbolX={shortenAddress(tokenAData.symbol ?? '')}
                          symbolY={shortenAddress(tokenBData.symbol ?? '')}
                          liquidityX={tokenAData.liquidity}
                          liquidityY={tokenBData.liquidity}
                        />
                      }>
                      <BoxValue title='Locked' icon={lockIcon} style={{ width: '100%' }} />
                    </TooltipHover>
                  </Box>
                )}
                <BoxValue
                  title={isDisabled ? 'Pool disabled' : 'Add position'}
                  onClick={!isDisabled ? handleOpenPosition : undefined}
                  isDisabled={isDisabled}
                  icon={isDisabled ? plusDisabled : plusIcon}
                  style={{ flex: 1 }}
                />
                <BoxValue
                  title='Pool details'
                  icon={poolStatsBtnIcon}
                  style={{ flex: 1 }}
                  onClick={handleOpenPoolDetails}
                />
                <BoxValue
                  title='Exchange'
                  icon={horizontalSwapIcon}
                  style={{ flex: 1 }}
                  onClick={handleOpenSwap}
                />
                {isMdUp && (
                  <BoxValue
                    title='View'
                    icon={newTabBtnIcon}
                    style={{ flex: 1 }}
                    onClick={() => {
                      window.open(
                        `https://eclipsescan.xyz/account/${poolAddress}${networkUrl}`,
                        '_blank',
                        'noopener,noreferrer'
                      )
                    }}
                  />
                )}
              </Grid>
            </Box>
            {isMd && (
              <Box className={classes.info}>
                <Grid container gap={'8px'} overflow={'hidden'}>
                  <BoxValue
                    title={isFavourite ? 'Remove Favourite' : 'Add Favourite'}
                    icon={isFavourite ? starFill : star}
                    onClick={() => {
                      if (poolAddress && switchFavouritePool) {
                        switchFavouritePool(poolAddress)
                      }
                    }}
                  />

                  {isSm && (
                    <BoxValue
                      title={'Copy address'}
                      onClick={copyToClipboard}
                      isDisabled={isDisabled}
                      icon={isDisabled ? plusDisabled : plusIcon}
                      style={{ flex: 1 }}
                    />
                  )}

                  {isLocked && (
                    <Box display='flex' flex={1}>
                      <TooltipHover
                        fullSpan
                        maxWidth='none'
                        title={
                          <LockStatsPopover
                            lockedX={tokenAData.locked}
                            lockedY={tokenBData.locked}
                            symbolX={shortenAddress(tokenAData.symbol ?? '')}
                            symbolY={shortenAddress(tokenBData.symbol ?? '')}
                            liquidityX={tokenAData.liquidity}
                            liquidityY={tokenBData.liquidity}
                          />
                        }>
                        <BoxValue title='Locked' icon={lockIcon} style={{ width: '100%' }} />
                      </TooltipHover>
                    </Box>
                  )}

                  <BoxValue
                    title='View'
                    icon={newTabBtnIcon}
                    style={{ flex: 1 }}
                    onClick={() => {
                      window.open(
                        `https://eclipsescan.xyz/account/${poolAddress}${networkUrl}`,
                        '_blank',
                        'noopener,noreferrer'
                      )
                    }}
                  />
                </Grid>
              </Box>
            )}
          </Grid>
        )}
      </Grid>
    </>
  )
}

export default PoolListItem
