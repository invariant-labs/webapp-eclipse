import { Box, Button, Grid, Skeleton, Typography } from '@mui/material'
import { formatNumberWithSuffix } from '@utils/utils'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMobileStyles } from './style'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { initialXtoY, tickerToAddress } from '@utils/utils'
import { airdropRainbowIcon, swapListIcon, warning2Icon } from '@static/icons'
import PromotedPoolPopover from '@components/Modals/PromotedPoolPopover/PromotedPoolPopover'
import { BN } from '@coral-xyz/anchor'
import { usePromotedPool } from '@store/hooks/positionList/usePromotedPool'
import { NetworkType } from '@store/consts/static'
import { network as currentNetwork } from '@store/selectors/solanaConnection'
import { useSelector } from 'react-redux'
import { useTokenValues } from '@store/hooks/positionList/useTokenValues'
import { singlePositionData } from '@store/selectors/positions'
import { blurContent, unblurContent } from '@utils/uiUtils'
import PositionViewActionPopover from '@components/Modals/PositionViewActionPopover/PositionViewActionPopover'
import LockLiquidityModal from '@components/Modals/LockLiquidityModal/LockLiquidityModal'
import { lockerState } from '@store/selectors/locker'
import { ILiquidityToken } from '@store/consts/types'
import { ISinglePositionData } from '@components/Portfolio/Overview/Overview/Overview'
import { IPositionItem } from '@store/consts/types'
import { InactivePoolsPopover } from '../components/InactivePoolsPopover/InactivePoolsPopover'
import { MinMaxChart } from '../components/MinMaxChart/MinMaxChart'
import { ReactFitty } from 'react-fitty'

interface IPositionItemMobile extends IPositionItem {
  setAllowPropagation: React.Dispatch<React.SetStateAction<boolean>>
  handleLockPosition: (index: number) => void
  handleClosePosition: (index: number) => void
  handleClaimFee: (index: number, isLocked: boolean) => void
  createNewPosition: () => void
  shouldDisable: boolean
}

export const PositionItemMobile: React.FC<IPositionItemMobile> = ({
  tokenXName,
  tokenYName,
  tokenXIcon,
  poolAddress,
  tokenYIcon,
  fee,
  min,
  max,
  position,
  id,
  isFullRange,
  setAllowPropagation,
  poolData,
  isActive = false,
  currentPrice,
  tokenXLiq,
  tokenYLiq,
  network,
  unclaimedFeesInUSD = { value: 0, loading: false, isClaimAvailable: false },
  handleLockPosition,
  handleClosePosition,
  handleClaimFee,
  shouldDisable,
  createNewPosition
}) => {
  const { classes, cx } = useMobileStyles()
  const airdropIconRef = useRef<any>(null)
  const [isPromotedPoolPopoverOpen, setIsPromotedPoolPopoverOpen] = useState(false)
  const [isPromotedPoolInactive, setIsPromotedPoolInactive] = useState(false)
  const positionSingleData: ISinglePositionData | undefined = useSelector(
    singlePositionData(id ?? '')
  )

  const [isLockPositionModalOpen, setIsLockPositionModalOpen] = useState(false)

  useEffect(() => {
    if (isLockPositionModalOpen) {
      blurContent()
    } else {
      unblurContent()
    }
  }, [isLockPositionModalOpen])

  const networkSelector = useSelector(currentNetwork)

  const { isPromoted, pointsPerSecond, estimated24hPoints } = usePromotedPool(
    poolAddress,
    position,
    poolData
  )

  const handlePopoverState = (isOpen: boolean) => {
    if (isOpen) {
      setAllowPropagation(false)
    } else {
      setTimeout(() => {
        setAllowPropagation(true)
      }, 500)
    }
  }
  const handleInteraction = (event: React.MouseEvent) => {
    event.stopPropagation()
    setIsPromotedPoolPopoverOpen(!isPromotedPoolPopoverOpen)
    setAllowPropagation(false)
  }
  useEffect(() => {
    const PROPAGATION_ALLOW_TIME = 500

    const handleClickOutside = (event: MouseEvent) => {
      const isClickInAirdropIcon =
        airdropIconRef.current &&
        (airdropIconRef.current as HTMLElement).contains(event.target as Node)
      const isClickInPromotedPopover = document
        .querySelector('.promoted-pool-popover')
        ?.contains(event.target as Node)
      const isClickInInactivePopover = document
        .querySelector('.promoted-pool-inactive-popover')
        ?.contains(event.target as Node)

      if (!isClickInAirdropIcon && !isClickInPromotedPopover && !isClickInInactivePopover) {
        if (isPromotedPoolPopoverOpen) {
          setIsPromotedPoolPopoverOpen(false)
        }

        if (isPromotedPoolInactive) {
          setIsPromotedPoolInactive(false)
        }

        setTimeout(() => {
          setAllowPropagation(true)
        }, PROPAGATION_ALLOW_TIME)
      }
    }

    if (isPromotedPoolPopoverOpen || isPromotedPoolInactive || isLockPositionModalOpen) {
      document.addEventListener('click', handleClickOutside)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isPromotedPoolPopoverOpen, isPromotedPoolInactive, isLockPositionModalOpen])

  useEffect(() => {
    setAllowPropagation(!isLockPositionModalOpen)
  }, [isLockPositionModalOpen])
  const promotedIconFragment = useMemo(() => {
    if (isPromoted && isActive && !positionSingleData?.isLocked) {
      return (
        <>
          <PromotedPoolPopover
            showEstPointsFirst
            isActive={isActive}
            headerText={
              <>
                This position is currently <b>earning points</b>
              </>
            }
            pointsLabel={'Total points distributed across the pool per 24H:'}
            estPoints={estimated24hPoints}
            points={new BN(pointsPerSecond, 'hex').muln(24).muln(60).muln(60)}>
            <div
              className={classes.actionButton}
              onClick={() => {
                setIsPromotedPoolPopoverOpen(!isPromotedPoolPopoverOpen)
                setAllowPropagation(false)
              }}>
              <img src={airdropRainbowIcon} alt={'Airdrop'} style={{ height: '32px' }} />
            </div>
          </PromotedPoolPopover>
        </>
      )
    }

    return (
      <>
        <InactivePoolsPopover
          isActive={isActive}
          isPromoted={isPromoted}
          isLocked={positionSingleData?.isLocked ?? false}>
          <div
            className={classes.actionButton}
            onClick={() => {
              const newState = !isPromotedPoolInactive
              setIsPromotedPoolInactive(newState)
              handlePopoverState(newState)
            }}
            onPointerEnter={() => {
              if (window.matchMedia('(hover: hover)').matches) {
                setIsPromotedPoolInactive(true)
                handlePopoverState(true)
              }
            }}
            onPointerLeave={() => {
              if (window.matchMedia('(hover: hover)').matches) {
                setIsPromotedPoolInactive(false)
                handlePopoverState(false)
              }
            }}>
            <img
              src={airdropRainbowIcon}
              alt={'Airdrop'}
              style={{
                height: '32px',
                opacity: 0.3,
                filter: 'grayscale(1)'
              }}
            />
          </div>
        </InactivePoolsPopover>
      </>
    )
  }, [
    isPromoted,
    isActive,
    isPromotedPoolPopoverOpen,
    isPromotedPoolInactive,
    classes.actionButton,
    handleInteraction,
    airdropIconRef,
    estimated24hPoints,
    pointsPerSecond
  ])
  const [xToY, setXToY] = useState<boolean>(
    initialXtoY(tickerToAddress(network, tokenXName), tickerToAddress(network, tokenYName))
  )

  const [isActionPopoverOpen, setActionPopoverOpen] = useState<boolean>(false)

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    blurContent()
    setActionPopoverOpen(true)
  }

  const handleClose = () => {
    unblurContent()
    setActionPopoverOpen(false)
  }

  const { tokenValueInUsd, tokenXPercentage, tokenYPercentage } = useTokenValues({
    currentPrice,
    id,
    position,
    tokenXLiq,
    tokenYLiq,
    positionSingleData,
    xToY
  })

  const topSection = useMemo(
    () => (
      <Grid container sx={{ width: '100%', marginBottom: 2 }}>
        <Grid item xs={5}>
          <TooltipHover
            title={
              isActive ? (
                <>
                  The position is <b>active</b> and currently <b>earning a fee</b>
                </>
              ) : (
                <>
                  The position is <b>inactive</b> and <b>not earning a fee</b>
                </>
              )
            }
            placement='top'
            increasePadding
            fullSpan>
            <Grid
              container
              className={cx(classes.fee, isActive ? classes.activeFee : undefined)}
              justifyContent='center'
              alignItems='center'>
              <Typography
                className={cx(classes.infoText, isActive ? classes.activeInfoText : undefined)}>
                {fee}% fee
              </Typography>
            </Grid>
          </TooltipHover>
        </Grid>

        <Grid item xs={7} paddingLeft={'16px'}>
          {unclaimedFeesInUSD.loading ? (
            <Skeleton
              variant='rectangular'
              width='100%'
              height={36}
              sx={{ borderRadius: '10px' }}
            />
          ) : (
            <Grid
              container
              justifyContent='center'
              alignItems='center'
              className={classes.fee}
              sx={{ width: '100%' }}>
              <Box className={classes.unclaimedFeeContainer}>
                <Typography className={classes.infoText}>Unclaimed Fee</Typography>
                <Typography className={classes.greenText}>
                  ${formatNumberWithSuffix(unclaimedFeesInUSD.value.toFixed(2))}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Grid>
    ),
    [fee, isActive, unclaimedFeesInUSD]
  )

  const middleSection = useMemo(
    () => (
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={6}>
          {tokenValueInUsd.loading ? (
            <Skeleton
              variant='rectangular'
              width='100%'
              height={36}
              sx={{ borderRadius: '10px' }}
            />
          ) : (
            <div>
              {tokenValueInUsd.priceWarning ? (
                <TooltipHover title='The price might not be shown correctly' fullSpan>
                  <Grid
                    container
                    className={classes.value}
                    alignItems='center'
                    justifyContent='center'>
                    <Box gap={'8px'} display={'flex'} alignItems={'center'}>
                      <Typography className={classes.infoText}>Value</Typography>

                      <Typography className={classes.greenText}>
                        ${formatNumberWithSuffix(tokenValueInUsd.value)}
                      </Typography>

                      <img src={warning2Icon} width={14} />
                    </Box>
                  </Grid>
                </TooltipHover>
              ) : (
                <Grid
                  container
                  className={classes.value}
                  alignItems='center'
                  justifyContent='center'>
                  <Box gap={'8px'} display={'flex'} alignItems={'center'}>
                    <Typography className={classes.infoText}>Value</Typography>

                    <Typography className={classes.greenText}>
                      ${formatNumberWithSuffix(tokenValueInUsd.value)}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </div>
          )}
        </Grid>

        <Grid item xs={6}>
          <Grid container alignItems='center' className={classes.value} justifyContent='center'>
            <Typography className={classes.infoText}>
              {tokenXPercentage === 100 && (
                <span>
                  {tokenXPercentage}% {xToY ? tokenXName : tokenYName}
                </span>
              )}
              {tokenYPercentage === 100 && (
                <span>
                  {tokenYPercentage}% {xToY ? tokenYName : tokenXName}
                </span>
              )}
              {tokenYPercentage !== 100 && tokenXPercentage !== 100 && (
                <span>
                  {tokenXPercentage}% {xToY ? tokenXName : tokenYName} - {tokenYPercentage}%{' '}
                  {xToY ? tokenYName : tokenXName}
                </span>
              )}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    ),
    [tokenValueInUsd, tokenXPercentage, tokenYPercentage, xToY]
  )

  const chartSection = useMemo(
    () => (
      <Grid container justifyContent='center' margin={'0 auto'} width={'80%'}>
        <MinMaxChart
          isFullRange={isFullRange}
          min={Number(xToY ? min : 1 / max)}
          max={Number(xToY ? max : 1 / min)}
          current={
            xToY ? currentPrice : currentPrice !== 0 ? 1 / currentPrice : Number.MAX_SAFE_INTEGER
          }
        />
      </Grid>
    ),
    [min, max, currentPrice, xToY]
  )

  const { value, tokenXLabel, tokenYLabel } = useMemo<{
    value: string
    tokenXLabel: string
    tokenYLabel: string
  }>(() => {
    const valueX = tokenXLiq + tokenYLiq / currentPrice
    const valueY = tokenYLiq + tokenXLiq * currentPrice
    return {
      value: `${formatNumberWithSuffix(xToY ? valueX : valueY)} ${xToY ? tokenXName : tokenYName}`,
      tokenXLabel: xToY ? tokenXName : tokenYName,
      tokenYLabel: xToY ? tokenYName : tokenXName
    }
  }, [min, max, currentPrice, tokenXName, tokenYName, tokenXLiq, tokenYLiq, xToY])

  const { success, inProgress } = useSelector(lockerState)

  return (
    <Grid className={classes.root} container direction='column'>
      <LockLiquidityModal
        open={isLockPositionModalOpen}
        onClose={() => setIsLockPositionModalOpen(false)}
        xToY={xToY}
        tokenX={{ name: tokenXName, icon: tokenXIcon, liqValue: tokenXLiq } as ILiquidityToken}
        tokenY={{ name: tokenYName, icon: tokenYIcon, liqValue: tokenYLiq } as ILiquidityToken}
        onLock={() => handleLockPosition(positionSingleData?.positionIndex ?? 0)}
        fee={`${fee}% fee`}
        minMax={`${formatNumberWithSuffix(xToY ? min : 1 / max)}-${formatNumberWithSuffix(xToY ? max : 1 / min)} ${tokenYLabel} per ${tokenXLabel}`}
        value={value}
        isActive={isActive}
        swapHandler={() => setXToY(!xToY)}
        success={success}
        inProgress={inProgress}
      />
      <PositionViewActionPopover
        shouldDisable={shouldDisable}
        anchorEl={anchorEl}
        handleClose={handleClose}
        open={isActionPopoverOpen}
        isLocked={positionSingleData?.isLocked ?? false}
        unclaimedFeesInUSD={unclaimedFeesInUSD}
        claimFee={() =>
          handleClaimFee(
            positionSingleData?.positionIndex ?? 0,
            positionSingleData?.isLocked ?? false
          )
        }
        closePosition={() => handleClosePosition(positionSingleData?.positionIndex ?? 0)}
        onLockPosition={() => setIsLockPositionModalOpen(true)}
        createPosition={createNewPosition}
      />
      <Grid container item className={classes.mdTop}>
        <Grid container item className={classes.iconsAndNames}>
          <Box display='flex' alignItems={'center'} flex='1'>
            <Grid container item className={classes.icons}>
              <img
                className={classes.tokenIcon}
                src={xToY ? tokenXIcon : tokenYIcon}
                alt={xToY ? tokenXName : tokenYName}
              />
              <TooltipHover title='Reverse tokens'>
                <img
                  className={classes.arrows}
                  src={swapListIcon}
                  alt='Arrow'
                  onClick={e => {
                    e.stopPropagation()
                    setXToY(!xToY)
                  }}
                />
              </TooltipHover>
              <img
                className={classes.tokenIcon}
                src={xToY ? tokenYIcon : tokenXIcon}
                alt={xToY ? tokenYName : tokenXName}
              />
            </Grid>
            <Box className={classes.tickersContainer}>
              <Typography className={classes.names} component={ReactFitty} maxSize={28}>
                {xToY ? tokenXName : tokenYName} - {xToY ? tokenYName : tokenXName}
              </Typography>
            </Box>
          </Box>

          <Box ref={airdropIconRef} className={classes.actionButtonContainer}>
            {networkSelector === NetworkType.Mainnet && <>{promotedIconFragment}</>}
            <Button
              className={classes.button}
              onClick={e => {
                e.stopPropagation()
                handleClick(e)
              }}>
              ...
            </Button>
          </Box>
        </Grid>
      </Grid>

      {topSection}
      {middleSection}
      {chartSection}
    </Grid>
  )
}
