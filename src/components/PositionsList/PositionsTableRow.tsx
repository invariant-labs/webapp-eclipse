import {
  Grid,
  TableRow,
  TableCell,
  Button,
  Theme,
  Tooltip,
  Typography,
  useMediaQuery,
  Box
} from '@mui/material'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MinMaxChart } from './PositionItem/components/MinMaxChart/MinMaxChart'
import { IPositionItem } from './types'
import { makeStyles } from 'tss-react/mui'
import { colors, theme } from '@static/theme'
import PromotedPoolPopover from '@components/Modals/PromotedPoolPopover/PromotedPoolPopover'
import { BN } from '@coral-xyz/anchor'
import icons from '@static/icons'
import { initialXtoY, tickerToAddress, formatNumber, printBN } from '@utils/utils'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { usePromotedPool } from './PositionItem/hooks/usePromotedPool'
import { calculatePercentageRatio } from './PositionItem/utils/calculations'
import { useSharedStyles } from './PositionItem/variants/style/shared'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import SwapList from '@static/svg/swap-list.svg'
import { network as currentNetwork, rpcAddress } from '@store/selectors/solanaConnection'
import PositionStatusTooltip from './PositionItem/components/PositionStatusTooltip'
import PositionViewActionPopover from '@components/Modals/PositionViewActionPopover/PositionViewActionPopover'
import React from 'react'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { singlePositionData } from '@store/selectors/positions'
import { IWallet } from '@invariant-labs/sdk-eclipse'
import { getEclipseWallet } from '@utils/web3/wallet'
import { usePositionTicks } from '@store/hooks/userOverview/usePositionTicks'
import { Tick } from '@invariant-labs/sdk-eclipse/lib/market'
import { calculateClaimAmount } from '@invariant-labs/sdk-eclipse/lib/utils'
import { usePrices } from '@store/hooks/userOverview/usePrices'
import { useLiquidity } from '@store/hooks/userOverview/useLiquidity'
import { actions } from '@store/reducers/overview'
// import { useDebounceLoading } from '@store/hooks/userOverview/useDebounceLoading'

const useStyles = makeStyles()((theme: Theme) => ({
  cellBase: {
    padding: '20px',
    background: 'inherit',
    border: 'none',
    whiteSpace: 'nowrap',
    textAlign: 'center'
  },

  pairNameCell: {
    width: '25%',
    textAlign: 'left',
    paddingLeft: '22px !important'
  },

  pointsCell: {
    width: '8%',
    '& > div': {
      justifyContent: 'center'
    }
  },

  feeTierCell: {
    width: '12%',
    '& > .MuiBox-root': {
      justifyContent: 'center',
      gap: '8px'
    }
  },

  tokenRatioCell: {
    width: '18%',
    '& > .MuiTypography-root': {
      margin: '0 auto',
      maxWidth: '90%'
    }
  },

  valueCell: {
    width: '10%',
    '& .MuiGrid-root': {
      margin: '0 auto',
      justifyContent: 'center'
    }
  },

  feeCell: {
    width: '10%',
    '& .MuiGrid-root': {
      margin: '0 auto',
      justifyContent: 'center'
    }
  },

  chartCell: {
    width: '16%'
  },

  actionCell: {
    width: '4%',
    padding: '14px 8px',
    '& > .MuiButton-root': {
      margin: '0 auto'
    }
  },

  iconsAndNames: {
    width: 'fit-content',
    display: 'flex',
    alignItems: 'center'
  },

  icons: {
    marginRight: 12,
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },

  tokenIcon: {
    width: 40,
    borderRadius: '100%',
    [theme.breakpoints.down('sm')]: {
      width: 28
    }
  },

  arrows: {
    width: 36,
    cursor: 'pointer',
    transition: 'filter 0.2s',
    '&:hover': {
      filter: 'brightness(2)'
    }
  },

  button: {
    minWidth: '36px',
    width: '36px',
    height: '36px',
    padding: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)',
    borderRadius: '16px',
    color: colors.invariant.dark,
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(180deg, #3FF2AB 0%, #25B487 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 15px rgba(46, 224, 154, 0.35)'
    }
  },

  blur: {
    width: 120,
    height: 30,
    borderRadius: 16,
    background: `linear-gradient(90deg, ${colors.invariant.component} 25%, ${colors.invariant.light} 50%, ${colors.invariant.component} 75%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 2s infinite'
  },

  valueWrapper: {
    margin: '0 auto',
    width: '100%',
    maxWidth: 144,
    display: 'flex',
    justifyContent: 'center'
  },
  actionButton: {
    background: 'none',
    padding: 0,
    margin: 0,
    border: 'none',
    display: 'inline-flex',
    position: 'relative',
    color: colors.invariant.black,
    textTransform: 'none',

    transition: 'filter 0.2s linear',

    '&:hover': {
      filter: 'brightness(1.2)',
      cursor: 'pointer',
      '@media (hover: none)': {
        filter: 'none'
      }
    }
  }
}))

interface PositionTicks {
  lowerTick: Tick | undefined
  upperTick: Tick | undefined
  loading: boolean
}

export const PositionTableRow: React.FC<IPositionItem> = ({
  tokenXName,
  tokenYName,
  tokenXIcon,
  poolAddress,
  tokenYIcon,
  currentPrice,
  id,
  fee,
  min,
  position,
  max,
  valueX,
  valueY,
  poolData,
  isActive = false,
  tokenXLiq,
  tokenYLiq,
  network
}) => {
  const { classes } = useStyles()
  const { classes: sharedClasses } = useSharedStyles()
  const [xToY, setXToY] = useState<boolean>(
    initialXtoY(tickerToAddress(network, tokenXName), tickerToAddress(network, tokenYName))
  )
  const [isClaimLoading, _setIsClaimLoading] = useState(false)
  const [previousUnclaimedFees, setPreviousUnclaimedFees] = useState<number | null>(null)
  const positionSingleData = useSelector(singlePositionData(id ?? ''))
  const wallet = getEclipseWallet()
  const networkType = useSelector(currentNetwork)
  const rpc = useSelector(rpcAddress)
  const airdropIconRef = useRef<any>(null)
  const [isPromotedPoolPopoverOpen, setIsPromotedPoolPopoverOpen] = useState(false)
  const isXs = useMediaQuery(theme.breakpoints.down('xs'))
  const dispatch = useDispatch()

  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const [positionTicks, setPositionTicks] = useState<PositionTicks>({
    lowerTick: undefined,
    upperTick: undefined,
    loading: false
  })

  const { tokenXPercentage, tokenYPercentage } = calculatePercentageRatio(
    tokenXLiq,
    tokenYLiq,
    currentPrice,
    xToY
  )

  const { tokenXLiquidity, tokenYLiquidity } = useLiquidity(positionSingleData)

  const { isPromoted, pointsPerSecond, estimated24hPoints } = usePromotedPool(
    poolAddress,
    position,
    poolData
  )
  const { tokenXPriceData, tokenYPriceData } = usePrices({
    tokenX: {
      assetsAddress: positionSingleData?.tokenX.assetAddress.toString(),
      name: positionSingleData?.tokenX.name
    },
    tokenY: {
      assetsAddress: positionSingleData?.tokenY.assetAddress.toString(),
      name: positionSingleData?.tokenY.name
    }
  })

  // useEffect(() => {
  //   console.log({ tokenXPriceData, tokenYPriceData })
  // }, [tokenXPriceData, tokenYPriceData])

  const {
    lowerTick,
    upperTick,
    loading: ticksLoading
  } = usePositionTicks({
    positionId: id,
    poolData: positionSingleData?.poolData,
    lowerTickIndex: positionSingleData?.lowerTickIndex ?? 0,
    upperTickIndex: positionSingleData?.upperTickIndex ?? 0,
    networkType,
    rpc,
    wallet: wallet as IWallet
  })

  useEffect(() => {
    setPositionTicks({
      lowerTick,
      upperTick,
      loading: ticksLoading
    })
  }, [lowerTick, upperTick, ticksLoading])

  const [_tokenXClaim, _tokenYClaim, unclaimedFeesInUSD] = useMemo(() => {
    if (positionTicks.loading || !positionSingleData?.poolData) {
      return [0, 0, previousUnclaimedFees ?? null]
    }

    if (tokenXPriceData.loading || tokenYPriceData.loading) {
      return [0, 0, previousUnclaimedFees ?? null]
    }

    if (
      typeof positionTicks.lowerTick === 'undefined' ||
      typeof positionTicks.upperTick === 'undefined'
    ) {
      return [0, 0, previousUnclaimedFees ?? null]
    }

    const [bnX, bnY] = calculateClaimAmount({
      position,
      tickLower: positionTicks.lowerTick,
      tickUpper: positionTicks.upperTick,
      tickCurrent: positionSingleData.poolData.currentTickIndex,
      feeGrowthGlobalX: positionSingleData.poolData.feeGrowthGlobalX,
      feeGrowthGlobalY: positionSingleData.poolData.feeGrowthGlobalY
    })

    const xAmount = +printBN(bnX, positionSingleData.tokenX.decimals)
    const yAmount = +printBN(bnY, positionSingleData.tokenY.decimals)

    const xValueInUSD = xAmount * tokenXPriceData.price
    const yValueInUSD = yAmount * tokenYPriceData.price
    const totalValueInUSD = xValueInUSD + yValueInUSD

    if (!isClaimLoading && totalValueInUSD > 0) {
      setPreviousUnclaimedFees(totalValueInUSD)
      dispatch(
        actions.addTotalUnclaimedFee({
          positionId: id,
          value: totalValueInUSD
        })
      )
    }

    return [xAmount, yAmount, totalValueInUSD]
  }, [
    positionSingleData,
    position,
    positionTicks,
    tokenXPriceData,
    tokenYPriceData,
    isClaimLoading,
    previousUnclaimedFees
  ])

  const tokenValueInUsd = useMemo(() => {
    if (tokenXPriceData.loading || tokenYPriceData.loading) {
      return null
    }

    if (!tokenXLiquidity && !tokenYLiquidity) {
      return 0
    }

    const xValue = tokenXLiquidity * tokenXPriceData.price
    const yValue = tokenYLiquidity * tokenYPriceData.price
    console.log({ tokenXLiquidity, tokenYLiquidity })
    const totalValue = xValue + yValue
    dispatch(
      actions.addTotalAssets({
        positionId: id,
        value: totalValue
      })
    )
    if (tokenXLiquidity > 0) {
      dispatch(
        actions.addTokenPosition({
          token: tokenXName,
          value: xValue,
          positionId: id,
          logo: positionSingleData?.tokenX.logoURI
        })
      )
    }

    if (tokenYLiquidity > 0) {
      dispatch(
        actions.addTokenPosition({
          token: tokenYName,
          value: yValue,
          positionId: id,
          logo: positionSingleData?.tokenY.logoURI
        })
      )
    }

    return totalValue
  }, [tokenXLiquidity, tokenYLiquidity, tokenXPriceData, tokenYPriceData])

  // const rawIsLoading =
  //   ticksLoading || tokenXPriceData.loading || tokenYPriceData.loading || isClaimLoading
  // const isLoading = useDebounceLoading(rawIsLoading)

  // const handleClaimFee = async () => {
  //   if (!positionSingleData) return

  //   setIsClaimLoading(true)
  //   try {
  //     dispatch(
  //       actions.claimFee({
  //         index: positionSingleData.positionIndex,
  //         isLocked: positionSingleData.isLocked
  //       })
  //     )
  //   } finally {
  //     setIsClaimLoading(false)
  //     setPreviousUnclaimedFees(0)
  //   }
  // }

  const pairNameContent = (
    <Grid container item className={classes.iconsAndNames} alignItems='center' wrap='nowrap'>
      <Grid container item className={sharedClasses.icons} alignItems='center' wrap='nowrap'>
        <img
          className={sharedClasses.tokenIcon}
          src={xToY ? tokenXIcon : tokenYIcon}
          alt={xToY ? tokenXName : tokenYName}
        />
        <TooltipHover text='Reverse tokens'>
          <img
            className={sharedClasses.arrows}
            src={SwapList}
            alt='Arrow'
            onClick={e => {
              e.stopPropagation()
              setXToY(!xToY)
            }}
          />
        </TooltipHover>
        <img
          className={sharedClasses.tokenIcon}
          src={xToY ? tokenYIcon : tokenXIcon}
          alt={xToY ? tokenYName : tokenXName}
        />
      </Grid>

      <Typography className={sharedClasses.names}>
        {xToY ? tokenXName : tokenYName} - {xToY ? tokenYName : tokenXName}
      </Typography>
    </Grid>
  )

  const handleMouseEnter = useCallback(() => {
    setIsPromotedPoolPopoverOpen(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsPromotedPoolPopoverOpen(false)
  }, [])

  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const handleTooltipEnter = useCallback(() => {
    setIsTooltipOpen(true)
  }, [])

  const handleTooltipLeave = useCallback(() => {
    setIsTooltipOpen(false)
  }, [])

  const feeFragment = useMemo(
    () => (
      <Tooltip
        enterTouchDelay={0}
        leaveTouchDelay={Number.MAX_SAFE_INTEGER}
        onClick={e => e.stopPropagation()}
        title={
          isActive ? (
            <>
              The position is <b>active</b> and currently <b>earning a fee</b> as long as the
              current price is <b>within</b> the position's price range.
            </>
          ) : (
            <>
              The position is <b>inactive</b> and <b>not earning a fee</b> as long as the current
              price is <b>outside</b> the position's price range.
            </>
          )
        }
        placement='top'
        classes={{
          tooltip: sharedClasses.tooltip
        }}>
        <Grid
          container
          item
          sx={{ width: 65 }}
          className={classNames(sharedClasses.fee, isActive ? sharedClasses.activeFee : undefined)}
          justifyContent='center'
          alignItems='center'>
          <Typography
            className={classNames(
              sharedClasses.infoText,
              isActive ? sharedClasses.activeInfoText : undefined
            )}>
            {fee}%
          </Typography>
        </Grid>
      </Tooltip>
    ),
    [fee, classes, isActive]
  )

  const valueFragment = useMemo(
    () => (
      <Grid
        container
        item
        sx={{
          width: 100,
          [theme.breakpoints.down(1029)]: {
            marginRight: 0
          },
          [theme.breakpoints.down('sm')]: {
            width: 144,
            paddingInline: 6
          }
        }}
        className={sharedClasses.value}
        justifyContent='space-between'
        alignItems='center'
        wrap='nowrap'>
        <Grid className={sharedClasses.infoCenter} container item justifyContent='center'>
          <Typography className={sharedClasses.greenText}>
            {tokenValueInUsd === null ? '...' : `$${formatNumber(tokenValueInUsd)}`}
          </Typography>
        </Grid>
      </Grid>
    ),
    [tokenValueInUsd, valueX, valueY, tokenXName, classes, isXs, isDesktop, tokenYName, xToY]
  )

  const unclaimedFee = useMemo(
    () => (
      <Grid
        container
        item
        sx={{
          width: 100,
          [theme.breakpoints.down(1029)]: {
            marginRight: 0
          },
          [theme.breakpoints.down('sm')]: {
            width: 144,
            paddingInline: 6
          }
        }}
        className={sharedClasses.value}
        justifyContent='space-between'
        alignItems='center'
        wrap='nowrap'>
        <Grid className={sharedClasses.infoCenter} container item justifyContent='center'>
          <Typography className={sharedClasses.greenText}>
            {unclaimedFeesInUSD === null ? '...' : `$${formatNumber(unclaimedFeesInUSD)}`}
          </Typography>
        </Grid>
      </Grid>
    ),
    [unclaimedFeesInUSD, valueX, valueY, tokenXName, classes, isXs, isDesktop, tokenYName, xToY]
  )

  const promotedIconContent = useMemo(() => {
    if (isPromoted && isActive) {
      return (
        <>
          <div
            onClick={e => e.stopPropagation()}
            className={classes.actionButton}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}>
            <img
              src={icons.airdropRainbow}
              alt={'Airdrop'}
              style={{
                flexShrink: '0',
                height: '32px',
                width: '32px',
                marginRight: '16px',
                marginLeft: '16px'
              }}
            />
            {JSON.stringify(isActive)}
          </div>
          <PromotedPoolPopover
            showEstPointsFirst
            isActive={isActive}
            anchorEl={airdropIconRef.current}
            open={isPromotedPoolPopoverOpen}
            onClose={() => setIsPromotedPoolPopoverOpen(false)}
            headerText={
              <>
                This position is currently <b>earning points</b>
              </>
            }
            pointsLabel={'Total points distributed across the pool per 24H:'}
            estPoints={estimated24hPoints}
            points={new BN(pointsPerSecond, 'hex').muln(24).muln(60).muln(60)}
          />
        </>
      )
    }

    return (
      <Tooltip
        open={isTooltipOpen}
        onOpen={() => setIsTooltipOpen(true)}
        onClose={() => setIsTooltipOpen(false)}
        enterTouchDelay={0}
        leaveTouchDelay={0}
        onClick={e => e.stopPropagation()}
        title={
          <div onMouseEnter={handleTooltipEnter} onMouseLeave={handleTooltipLeave}>
            <PositionStatusTooltip isActive={isActive} isPromoted={isPromoted} />
          </div>
        }
        placement='top'
        classes={{
          tooltip: sharedClasses.tooltip
        }}>
        <div
          onMouseEnter={handleTooltipEnter}
          onMouseLeave={handleTooltipLeave}
          style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            src={icons.airdropRainbow}
            alt={'Airdrop'}
            style={{
              flexShrink: '0',
              height: '32px',
              width: '32px',
              marginRight: '16px',
              marginLeft: '16px',
              opacity: 0.3,
              filter: 'grayscale(1)'
            }}
          />
        </div>
      </Tooltip>
    )
  }, [
    isPromoted,
    isActive,
    isPromotedPoolPopoverOpen,
    isTooltipOpen,
    handleMouseEnter,
    handleMouseLeave,
    handleTooltipEnter,
    handleTooltipLeave,
    estimated24hPoints,
    pointsPerSecond
  ])

  const [isActionPopoverOpen, setActionPopoverOpen] = React.useState<boolean>(false)

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    blurContent()
    setActionPopoverOpen(true)
  }

  const handleClose = () => {
    unblurContent()
    setActionPopoverOpen(false)
  }

  return (
    <TableRow>
      <PositionViewActionPopover
        anchorEl={anchorEl}
        handleClose={handleClose}
        open={isActionPopoverOpen}
        position={positionSingleData}
      />
      <TableCell className={`${classes.pairNameCell} ${classes.cellBase}`}>
        {pairNameContent}
      </TableCell>
      <TableCell className={`${classes.cellBase} ${classes.feeTierCell}`}>
        <Box sx={{ display: 'flex' }}>
          {promotedIconContent}
          {feeFragment}
        </Box>
      </TableCell>
      <TableCell className={`${classes.cellBase} ${classes.tokenRatioCell} ${classes}`}>
        <Typography
          className={`${sharedClasses.infoText} `}
          style={{
            background: colors.invariant.light,
            padding: '8px 12px',
            minWidth: '180px',
            borderRadius: '12px'
          }}>
          {tokenXPercentage === 100 && (
            <span>
              {tokenXPercentage}
              {'%'} {xToY ? tokenXName : tokenYName}
            </span>
          )}
          {tokenYPercentage === 100 && (
            <span>
              {tokenYPercentage}
              {'%'} {xToY ? tokenYName : tokenXName}
            </span>
          )}

          {tokenYPercentage !== 100 && tokenXPercentage !== 100 && (
            <span>
              {tokenXPercentage}
              {'%'} {xToY ? tokenXName : tokenYName} {' - '} {tokenYPercentage}
              {'%'} {xToY ? tokenYName : tokenXName}
            </span>
          )}
        </Typography>
      </TableCell>
      <TableCell className={`${classes.cellBase} ${classes.valueCell}`}>{valueFragment}</TableCell>
      <TableCell className={`${classes.cellBase} ${classes.feeCell}`}>{unclaimedFee}</TableCell>
      <TableCell className={`${classes.cellBase} ${classes.chartCell}`}>
        <MinMaxChart
          min={Number(xToY ? min : 1 / max)}
          max={Number(xToY ? max : 1 / min)}
          current={
            xToY ? currentPrice : currentPrice !== 0 ? 1 / currentPrice : Number.MAX_SAFE_INTEGER
          }
        />
      </TableCell>
      <TableCell className={`${classes.cellBase} ${classes.actionCell} action-button`}>
        <Button
          className={classes.button}
          onClick={e => {
            e.stopPropagation()
            handleClick(e)
          }}>
          ...
        </Button>
      </TableCell>
    </TableRow>
  )
}
