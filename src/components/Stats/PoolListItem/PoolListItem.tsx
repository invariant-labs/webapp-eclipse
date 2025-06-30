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
  horizontalSwapIcon,
  lockIcon,
  newTabBtnIcon,
  plusIcon,
  unknownTokenIcon
} from '@static/icons'
import { Intervals, ITEMS_PER_PAGE, NetworkType, SortTypePoolList } from '@store/consts/static'
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
import { CustomPopover } from '@common/Popover/CustomPopover'
import { useDispatch } from 'react-redux'
import { actions } from '@store/reducers/navigation'

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
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const isSmd = useMediaQuery(theme.breakpoints.down('md'))
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

  //HOTFIX
  const { convertedApy, convertedApr } = calculateAPYAndAPR(apy, poolAddress, volume, fee, TVL)
  const ActionsButtons = (
    <Box className={classes.action}>
      <button className={classes.actionButton} onClick={handleOpenSwap}>
        <img width={28} src={horizontalSwapIcon} alt={'Exchange'} />
      </button>
      <button className={classes.actionButton} onClick={handleOpenPosition}>
        <img width={28} src={plusIcon} alt={'Open'} />
      </button>
      <button
        className={classes.actionButton}
        onClick={() => {
          window.open(
            `https://eclipsescan.xyz/account/${poolAddress}${networkUrl}`,
            '_blank',
            'noopener,noreferrer'
          )
        }}>
        <img width={28} src={newTabBtnIcon} alt={'Exchange'} />
      </button>
      {isLocked && (
        <CustomPopover
          content={
            <LockStatsPopover
              lockedX={tokenAData.locked}
              lockedY={tokenBData.locked}
              symbolX={shortenAddress(tokenAData.symbol ?? '')}
              symbolY={shortenAddress(tokenBData.symbol ?? '')}
              liquidityX={tokenAData.liquidity}
              liquidityY={tokenBData.liquidity}
            />
          }
          centerOnScreen
          increasePadding>
          <button className={classes.actionButton}>
            <img width={28} src={lockIcon} alt={'Lock info'} />
          </button>
        </CustomPopover>
      )}
    </Box>
  )

  return (
    <Grid className={classes.wrapper}>
      {displayType === 'token' ? (
        <Grid
          onClick={() => {
            if (isSmd) setShowInfo(prev => !prev)
          }}
          container
          classes={{
            container: cx(classes.container, { [classes.containerNoAPY]: !showAPY })
          }}
          sx={{
            borderBottom:
              itemNumber !== 0 && itemNumber % ITEMS_PER_PAGE
                ? `1px solid ${colors.invariant.light}`
                : `2px solid ${colors.invariant.light}`
          }}>
          <Box className={classes.tokenIndexContainer}>
            {!isMd && (
              <Box className={classes.tokenIndex}>
                <Typography>{tokenIndex}</Typography>
              </Box>
            )}
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
          </Box>
          <Grid className={classes.imageContainer}>
            {(tokenAData.icon === '/src/static/svg/unknownToken.svg' || tokenAData.isUnknown) &&
            isSm ? (
              <Typography paddingRight={20} margin={0} minWidth={23}>
                {tokenAData.symbol}
              </Typography>
            ) : (
              <img
                className={classes.tokenIcon}
                src={tokenAData.icon}
                alt='Token from'
                onError={e => {
                  e.currentTarget.src = unknownTokenIcon
                }}
              />
            )}
            {!isSm &&
              (tokenAData.icon === '/src/static/svg/unknownToken.svg' || tokenAData.isUnknown) &&
              (tokenBData.icon === '/src/static/svg/unknownToken.svg' || tokenBData.isUnknown) &&
              ' / '}

            {(tokenBData.icon === '/src/static/svg/unknownToken.svg' || tokenBData.isUnknown) &&
            isSm ? (
              <Typography paddingRight={20} margin={0} minWidth={23}>
                {tokenBData.symbol}
              </Typography>
            ) : (
              <img
                className={classes.tokenIcon}
                src={tokenBData.icon}
                alt='Token from'
                onError={e => {
                  e.currentTarget.src = unknownTokenIcon
                }}
              />
            )}

            {!isSm && (
              <Typography>
                {shortenAddress(tokenAData.symbol ?? '')}/{shortenAddress(tokenBData.symbol ?? '')}
              </Typography>
            )}
            <TooltipHover title='Copy pool address'>
              <FileCopyOutlinedIcon
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  copyToClipboard()
                }}
                classes={{ root: classes.clipboardIcon }}
              />
            </TooltipHover>
          </Grid>
          <Box className={classes.row} justifyContent={'space-between'}>
            {fee && typeof fee === 'number' && <Typography>{fee}%</Typography>}
            {isPromoted && (
              <PromotedPoolPopover apr={convertedApr} apy={convertedApy} points={points}>
                <Box
                  className={cx(classes.actionButton, classes.airdropIcon)}
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
          </Box>

          {!isSmd && showAPY ? (
            <Grid className={classes.row} sx={{ justifyContent: 'space-between' }}>
              <Grid sx={{ display: 'flex', gap: '4px' }}>
                <Typography>
                  {`${convertedApy > 1000 ? '>1000%' : convertedApy === 0 ? '' : Math.abs(convertedApy).toFixed(2) + '%'}`}
                </Typography>{' '}
                <Typography className={classes.apyLabel}>
                  {`${convertedApr > 1000 ? '>1000%' : convertedApr === 0 ? '-' : Math.abs(convertedApr).toFixed(2) + '%'}`}
                </Typography>
              </Grid>
            </Grid>
          ) : null}
          <Typography>{`$${formatNumberWithSuffix(volume)}`}</Typography>
          <Typography className={classes.selfEnd}>{`$${formatNumberWithSuffix(TVL)}`}</Typography>
          {!isSmd && (
            <Typography> ${formatNumberWithSuffix((fee * 0.01 * volume).toFixed(2))}</Typography>
          )}

          {isSmd && (
            <ArrowDropDownIcon preserveAspectRatio='none' className={classes.extendedRowIcon} />
          )}

          {!isMd && (
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

              <TooltipHover title='Exchange'>
                <button className={classes.actionButton} onClick={handleOpenSwap}>
                  <img width={32} height={32} src={horizontalSwapIcon} alt={'Exchange'} />
                </button>
              </TooltipHover>
              <TooltipHover title='Add position'>
                <button className={classes.actionButton} onClick={handleOpenPosition}>
                  <img width={32} height={32} src={plusIcon} alt={'Open'} />
                </button>
              </TooltipHover>
              <TooltipHover title='Open in explorer'>
                <button
                  className={classes.actionButton}
                  onClick={() =>
                    window.open(
                      `https://eclipsescan.xyz/account/${poolAddress}${networkUrl}`,
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }>
                  <img width={32} height={32} src={newTabBtnIcon} alt={'Exchange'} />
                </button>
              </TooltipHover>
            </Box>
          )}
          {isSmd && (
            <>
              <>
                <Typography component='h5' className={classes.extendedRowTitle}>
                  Fees ({intervalSuffix}){' '}
                  <span className={classes.extendedRowContent}>
                    ${formatNumberWithSuffix((fee * 0.01 * volume).toFixed(2))}
                  </span>
                </Typography>
                <Typography>{''}</Typography>
                <Typography>{''}</Typography>
                <Typography component='h5' className={classes.extendedRowTitle}>
                  APY{' '}
                  <span className={classes.extendedRowContent}>
                    {`${convertedApy > 1000 ? '>1000%' : convertedApy === 0 ? '-' : Math.abs(convertedApy).toFixed(2) + '%'}`}
                  </span>
                </Typography>
                <Typography
                  component='h5'
                  className={cx(classes.extendedRowTitle, classes.selfEnd)}>
                  APR{' '}
                  <span className={classes.extendedRowContent}>
                    {`${convertedApr > 1000 ? '>1000%' : convertedApr === 0 ? '-' : Math.abs(convertedApr).toFixed(2) + '%'}`}
                  </span>
                </Typography>
                <Typography>{''}</Typography>
              </>
              {isSm && (
                <>
                  <Typography
                    component='h5'
                    className={classes.extendedRowTitle}
                    sx={{ visibility: showInfo ? 'visible' : 'hidden' }}>
                    {shortenAddress(tokenAData.symbol ?? '')}/
                    {shortenAddress(tokenBData.symbol ?? '')}
                  </Typography>
                  <Typography>{''}</Typography>
                  {ActionsButtons}
                </>
              )}
            </>
          )}
        </Grid>
      ) : (
        <Grid
          container
          classes={{
            root: classes.header
          }}
          className={cx(classes.container, { [classes.containerNoAPY]: !showAPY })}>
          <Typography style={{ lineHeight: '11px' }}>
            N<sup>o</sup>
          </Typography>
          <Typography
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (sortType === SortTypePoolList.NAME_ASC) {
                onSort?.(SortTypePoolList.NAME_DESC)
              } else {
                onSort?.(SortTypePoolList.NAME_ASC)
              }
            }}>
            Pool
            {sortType === SortTypePoolList.NAME_ASC ? (
              <ArrowDropUpIcon className={classes.icon} />
            ) : sortType === SortTypePoolList.NAME_DESC ? (
              <ArrowDropDownIcon className={classes.icon} />
            ) : null}
          </Typography>

          <Typography
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (sortType === SortTypePoolList.FEE_ASC) {
                onSort?.(SortTypePoolList.FEE_DESC)
              } else {
                onSort?.(SortTypePoolList.FEE_ASC)
              }
            }}>
            Fee
            {sortType === SortTypePoolList.FEE_ASC ? (
              <ArrowDropUpIcon className={classes.icon} />
            ) : sortType === SortTypePoolList.FEE_DESC ? (
              <ArrowDropDownIcon className={classes.icon} />
            ) : null}
          </Typography>
          {!isSmd && showAPY ? (
            <Typography
              className={classes.row}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (sortType === SortTypePoolList.APY_DESC) {
                  onSort?.(SortTypePoolList.APY_ASC)
                } else {
                  onSort?.(SortTypePoolList.APY_DESC)
                }
              }}>
              APY <span className={classes.apy}>APR</span>
              {sortType === SortTypePoolList.APY_ASC ? (
                <ArrowDropUpIcon className={classes.icon} />
              ) : sortType === SortTypePoolList.APY_DESC ? (
                <ArrowDropDownIcon className={classes.icon} />
              ) : null}
            </Typography>
          ) : null}
          <Typography
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (sortType === SortTypePoolList.VOLUME_DESC) {
                onSort?.(SortTypePoolList.VOLUME_ASC)
              } else {
                onSort?.(SortTypePoolList.VOLUME_DESC)
              }
            }}>
            Volume {intervalSuffix}
            {sortType === SortTypePoolList.VOLUME_ASC ? (
              <ArrowDropUpIcon className={classes.icon} />
            ) : sortType === SortTypePoolList.VOLUME_DESC ? (
              <ArrowDropDownIcon className={classes.icon} />
            ) : null}
          </Typography>
          <Typography
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (sortType === SortTypePoolList.TVL_DESC) {
                onSort?.(SortTypePoolList.TVL_ASC)
              } else {
                onSort?.(SortTypePoolList.TVL_DESC)
              }
            }}>
            TVL
            {sortType === SortTypePoolList.TVL_ASC ? (
              <ArrowDropUpIcon className={classes.icon} />
            ) : sortType === SortTypePoolList.TVL_DESC ? (
              <ArrowDropDownIcon className={classes.icon} />
            ) : null}
          </Typography>
          {!isSmd && (
            <Typography
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (sortType === SortTypePoolList.FEE_24_DESC) {
                  onSort?.(SortTypePoolList.FEE_24_ASC)
                } else {
                  onSort?.(SortTypePoolList.FEE_24_DESC)
                }
              }}>
              Fees {intervalSuffix}
              {sortType === SortTypePoolList.FEE_24_ASC ? (
                <ArrowDropUpIcon className={classes.icon} />
              ) : sortType === SortTypePoolList.FEE_24_DESC ? (
                <ArrowDropDownIcon className={classes.icon} />
              ) : null}
            </Typography>
          )}
          {!isMd && <Typography align='right'>Action</Typography>}
        </Grid>
      )}
    </Grid>
  )
}

export default PoolListItem
