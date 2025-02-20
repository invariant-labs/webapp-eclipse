import {
  Grid,
  TableRow,
  TableCell,
  Button,
  Tooltip,
  Typography,
  useMediaQuery,
  Box,
  Skeleton
} from '@mui/material'
import { useCallback, useMemo, useRef, useState } from 'react'
import { MinMaxChart } from '../../components/MinMaxChart/MinMaxChart'
import { IPositionItem } from '../../../types'
import { colors, theme } from '@static/theme'
import PromotedPoolPopover from '@components/Modals/PromotedPoolPopover/PromotedPoolPopover'
import { BN } from '@coral-xyz/anchor'
import icons from '@static/icons'
import { initialXtoY, tickerToAddress, formatNumberWithoutSuffix } from '@utils/utils'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { usePromotedPool } from '../../../../../store/hooks/positionList/usePromotedPool'
import { useSharedStyles } from '../PositionMobileCard/style/shared'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import SwapList from '@static/svg/swap-list.svg'
import { network as currentNetwork } from '@store/selectors/solanaConnection'
import PositionStatusTooltip from '../../components/PositionStatusTooltip/PositionStatusTooltip'
import PositionViewActionPopover from '@components/Modals/PositionViewActionPopover/PositionViewActionPopover'
import React from 'react'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { singlePositionData } from '@store/selectors/positions'
import LockLiquidityModal from '@components/Modals/LockLiquidityModal/LockLiquidityModal'
import { actions as lockerActions } from '@store/reducers/locker'
import { lockerState } from '@store/selectors/locker'
import { ILiquidityToken } from '@components/PositionDetails/SinglePositionInfo/consts'
import { useUnclaimedFee } from '@store/hooks/positionList/useUnclaimedFee'
import { usePositionTableRowStyle } from './styles/positionTableRow'

interface IPositionsTableRow extends IPositionItem {
  isLockPositionModalOpen: boolean
  setIsLockPositionModalOpen: (value: boolean) => void
}

export const PositionTableRow: React.FC<IPositionsTableRow> = ({
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
  network,
  isLockPositionModalOpen,
  setIsLockPositionModalOpen
}) => {
  const { classes } = usePositionTableRowStyle()
  const { classes: sharedClasses } = useSharedStyles()
  const [xToY, setXToY] = useState<boolean>(
    initialXtoY(tickerToAddress(network, tokenXName), tickerToAddress(network, tokenYName))
  )
  const positionSingleData = useSelector(singlePositionData(id ?? ''))
  const networkType = useSelector(currentNetwork)
  const airdropIconRef = useRef<any>(null)
  const [isPromotedPoolPopoverOpen, setIsPromotedPoolPopoverOpen] = useState(false)
  const isXs = useMediaQuery(theme.breakpoints.down('xs'))

  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))

  const { tokenValueInUsd, tokenXPercentage, tokenYPercentage, unclaimedFeesInUSD } =
    useUnclaimedFee({
      currentPrice,
      id,
      position,
      tokenXLiq,
      tokenYLiq,
      positionSingleData,
      xToY
    })

  const { isPromoted, pointsPerSecond, estimated24hPoints } = usePromotedPool(
    poolAddress,
    position,
    poolData
  )

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
        className={`${sharedClasses.value} ${classes.itemCellContainer}`}
        justifyContent='space-between'
        alignItems='center'
        wrap='nowrap'>
        <Grid className={sharedClasses.infoCenter} container item justifyContent='center'>
          <Typography className={sharedClasses.greenText}>
            {`$${formatNumberWithoutSuffix(tokenValueInUsd.value, { twoDecimals: true })}`}
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
        className={`${sharedClasses.value} ${classes.itemCellContainer}`}
        justifyContent='space-between'
        alignItems='center'
        wrap='nowrap'>
        <Grid className={sharedClasses.infoCenter} container item justifyContent='center'>
          <Typography className={sharedClasses.greenText}>
            ${formatNumberWithoutSuffix(unclaimedFeesInUSD.value, { twoDecimals: true })}
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
            ref={airdropIconRef}
            onClick={e => e.stopPropagation()}
            className={classes.actionButton}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}>
            <img
              src={icons.airdropRainbow}
              alt={'Airdrop'}
              style={{
                height: '32px',
                width: '30px'
              }}
            />
          </div>
          <PromotedPoolPopover
            showEstPointsFirst
            isActive={true}
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

  const dispatch = useDispatch()

  const lockPosition = () => {
    dispatch(lockerActions.lockPosition({ index: 0, network: networkType }))
  }

  const { value, tokenXLabel, tokenYLabel } = useMemo<{
    value: string
    tokenXLabel: string
    tokenYLabel: string
  }>(() => {
    const valueX = tokenXLiq + tokenYLiq / currentPrice
    const valueY = tokenYLiq + tokenXLiq * currentPrice
    return {
      value: `${formatNumberWithoutSuffix(xToY ? valueX : valueY)} ${xToY ? tokenXName : tokenYName}`,
      tokenXLabel: xToY ? tokenXName : tokenYName,
      tokenYLabel: xToY ? tokenYName : tokenXName
    }
  }, [min, max, currentPrice, tokenXName, tokenYName, tokenXLiq, tokenYLiq, xToY])

  const { success, inProgress } = useSelector(lockerState)

  return (
    <TableRow>
      <LockLiquidityModal
        open={isLockPositionModalOpen}
        onClose={() => setIsLockPositionModalOpen(false)}
        xToY={xToY}
        tokenX={{ name: tokenXName, icon: tokenXIcon, liqValue: tokenXLiq } as ILiquidityToken}
        tokenY={{ name: tokenYName, icon: tokenYIcon, liqValue: tokenYLiq } as ILiquidityToken}
        onLock={lockPosition}
        fee={`${fee}% fee`}
        minMax={`${formatNumberWithoutSuffix(xToY ? min : 1 / max)}-${formatNumberWithoutSuffix(xToY ? max : 1 / min)} ${tokenYLabel} per ${tokenXLabel}`}
        value={value}
        isActive={isActive}
        swapHandler={() => setXToY(!xToY)}
        success={success}
        inProgress={inProgress}
      />
      <PositionViewActionPopover
        anchorEl={anchorEl}
        handleClose={handleClose}
        open={isActionPopoverOpen}
        unclaimedFeesInUSD={unclaimedFeesInUSD.value}
        position={positionSingleData}
        onLockPosition={() => setIsLockPositionModalOpen(true)}
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

      {tokenValueInUsd.loading ? (
        <TableCell className={`${classes.cellBase} ${classes.valueCell}`}>
          <Skeleton
            variant='rectangular'
            width='100%'
            height={36}
            sx={{ borderRadius: '10px', margin: '0 auto' }}
          />
        </TableCell>
      ) : (
        <TableCell className={`${classes.cellBase} ${classes.valueCell}`}>
          {valueFragment}
        </TableCell>
      )}
      {unclaimedFeesInUSD.loading ? (
        <TableCell className={`${classes.cellBase} ${classes.feeCell}`}>
          <Skeleton
            variant='rectangular'
            width='100%'
            height={36}
            sx={{ borderRadius: '10px', margin: '0 auto' }}
          />
        </TableCell>
      ) : (
        <TableCell className={`${classes.cellBase} ${classes.feeCell}`}>{unclaimedFee}</TableCell>
      )}
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
