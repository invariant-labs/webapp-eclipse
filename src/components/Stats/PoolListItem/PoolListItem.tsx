import React, { useMemo, useRef, useState } from 'react'
import { colors, theme } from '@static/theme'
import { useStyles } from './style'
import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import { useNavigate } from 'react-router-dom'
import {
  airdropRainbowIcon,
  horizontalSwapIcon,
  lockIcon,
  newTabBtnIcon,
  plusIcon,
  unknownTokenIcon,
  warningIcon
} from '@static/icons'
import { ITEMS_PER_PAGE, NetworkType, SortTypePoolList } from '@store/consts/static'
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
import { shortenAddress } from '@utils/uiUtils'
import classNames from 'classnames'
import LockStatsPopover from '@components/Modals/LockStatsPopover/LockStatsPopover'
import PromotedPoolPopover from '@components/Modals/PromotedPoolPopover/PromotedPoolPopover'
import { BN } from '@coral-xyz/anchor'

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
  itemNumber = 0
}) => {
  const [showInfo, setShowInfo] = useState(false)
  const { classes } = useStyles({ showInfo })

  const navigate = useNavigate()
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const isSmd = useMediaQuery(theme.breakpoints.down('md'))
  const isMd = useMediaQuery(theme.breakpoints.down(1160))
  const lockIconRef = useRef<HTMLButtonElement>(null)
  const airdropIconRef = useRef<HTMLDivElement>(null)
  const [isLockPopoverOpen, setLockPopoverOpen] = useState(false)
  const [isPromotedPoolPopoverOpen, setIsPromotedPoolPopoverOpen] = useState(false)

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
  const handlePointerEnter = () => {
    setLockPopoverOpen(true)
  }

  const handlePointerLeave = () => {
    setLockPopoverOpen(false)
  }

  //HOTFIX
  const { convertedApy, convertedApr } = calculateAPYAndAPR(apy, poolAddress, volume, fee, TVL)

  return (
    <Grid className={classes.wrapper}>
      {displayType === 'token' ? (
        <Grid
          sx={{
            borderBottom:
              itemNumber !== 0 && itemNumber % ITEMS_PER_PAGE
                ? `1px solid ${colors.invariant.light}`
                : `2px solid ${colors.invariant.light}`
          }}
          container
          classes={{
            container: classNames(classes.container, { [classes.containerNoAPY]: !showAPY })
          }}>
          {!isMd ? <Typography>{tokenIndex}</Typography> : null}
          <Grid className={classes.imageContainer}>
            <img
              className={classes.tokenIcon}
              src={tokenAData.icon}
              alt='Token from'
              onError={e => {
                e.currentTarget.src = unknownTokenIcon
              }}
            />
            {tokenAData.isUnknown && <img className={classes.warningIcon} src={warningIcon} />}
            <img
              className={classes.tokenIcon}
              src={tokenBData.icon}
              alt='Token to'
              onError={e => {
                e.currentTarget.src = unknownTokenIcon
              }}
            />
            {tokenBData.isUnknown && <img className={classes.warningIcon} src={warningIcon} />}
            {!isSm && (
              <Typography>
                {shortenAddress(tokenAData.symbol ?? '')}/{shortenAddress(tokenBData.symbol ?? '')}
              </Typography>
            )}
            <TooltipHover title='Copy pool address'>
              <FileCopyOutlinedIcon
                onClick={copyToClipboard}
                classes={{ root: classes.clipboardIcon }}
              />
            </TooltipHover>
          </Grid>
          {!isSmd && showAPY ? (
            <Grid className={classes.row} justifyContent='space-between'>
              <Typography gap='4px'>
                {`${convertedApr > 1000 ? '>1000%' : convertedApr === 0 ? '-' : Math.abs(convertedApr).toFixed(2) + '%'}`}
                <span
                  className={
                    classes.apy
                  }>{`${convertedApy > 1000 ? '>1000%' : convertedApy === 0 ? '' : Math.abs(convertedApy).toFixed(2) + '%'}`}</span>
              </Typography>
              {isPromoted && (
                <PromotedPoolPopover apr={convertedApr} apy={convertedApy} points={points}>
                  <Box
                    className={classes.actionButton}
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
                    <img width={24} height={32} src={airdropRainbowIcon} alt={'Airdrop'} />
                  </Box>
                </PromotedPoolPopover>
              )}
            </Grid>
          ) : null}
          <Typography>{fee}%</Typography>
          {!isSmd && <Typography> ${formatNumberWithSuffix(fee * volume)}</Typography>}
          <Typography>{`$${formatNumberWithSuffix(volume)}`}</Typography>
          <Typography>{`$${formatNumberWithSuffix(TVL)}`}</Typography>
          {isSmd && (
            <ArrowDropDownIcon
              width={10}
              onClick={() => setShowInfo(prev => !prev)}
              className={classes.extendedRowIcon}
            />
          )}

          {!isMd && (
            <Box className={classes.action}>
              {isLocked && (
                <>
                  <button
                    className={classes.actionButton}
                    ref={lockIconRef}
                    onPointerLeave={handlePointerLeave}
                    onPointerEnter={handlePointerEnter}>
                    <img width={32} height={32} src={lockIcon} alt={'Lock info'} />
                  </button>
                  <LockStatsPopover
                    anchorEl={lockIconRef.current}
                    open={isLockPopoverOpen}
                    lockedX={tokenAData.locked}
                    lockedY={tokenBData.locked}
                    symbolX={shortenAddress(tokenAData.symbol ?? '')}
                    symbolY={shortenAddress(tokenBData.symbol ?? '')}
                    liquidityX={tokenAData.liquidity}
                    liquidityY={tokenBData.liquidity}
                    onClose={() => {
                      setLockPopoverOpen(false)
                    }}
                  />
                </>
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
          {showInfo && isSmd && (
            <>
              <Typography component='h5' className={classes.extendedRowTitle}>
                Fee (24h){' '}
                <span className={classes.extendedRowContent}>
                  ${formatNumberWithSuffix(fee * volume)}
                </span>
              </Typography>

              <Typography>{''}</Typography>
              <Typography component='h5' className={classes.extendedRowTitle}>
                APY{' '}
                <span className={classes.extendedRowContent}>
                  {Math.abs(convertedApy).toFixed(2)}
                </span>
              </Typography>
              <Typography component='h5' className={classes.extendedRowTitle}>
                APR{' '}
                <span className={classes.extendedRowContent}>
                  {Math.abs(convertedApr).toFixed(2)}
                </span>
              </Typography>
            </>
          )}
        </Grid>
      ) : (
        <Grid
          container
          classes={{
            root: classes.header
          }}
          className={classNames(classes.container, { [classes.containerNoAPY]: !showAPY })}>
          {!isMd && (
            <Typography style={{ lineHeight: '11px' }}>
              N<sup>o</sup>
            </Typography>
          )}
          <Typography
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (sortType === SortTypePoolList.NAME_ASC) {
                onSort?.(SortTypePoolList.NAME_DESC)
              } else {
                onSort?.(SortTypePoolList.NAME_ASC)
              }
            }}>
            Name
            {sortType === SortTypePoolList.NAME_ASC ? (
              <ArrowDropUpIcon className={classes.icon} />
            ) : sortType === SortTypePoolList.NAME_DESC ? (
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
              APR <span className={classes.apy}>APY</span>
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
              Fee 24H
              {sortType === SortTypePoolList.FEE_24_ASC ? (
                <ArrowDropUpIcon className={classes.icon} />
              ) : sortType === SortTypePoolList.FEE_24_DESC ? (
                <ArrowDropDownIcon className={classes.icon} />
              ) : null}
            </Typography>
          )}
          <Typography
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (sortType === SortTypePoolList.VOLUME_DESC) {
                onSort?.(SortTypePoolList.VOLUME_ASC)
              } else {
                onSort?.(SortTypePoolList.VOLUME_DESC)
              }
            }}>
            Volume 24H
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
          {!isMd && <Typography align='right'>Action</Typography>}
        </Grid>
      )}
    </Grid>
  )
}

export default PoolListItem
